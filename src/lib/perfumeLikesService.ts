import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { auth, db } from './firebase';

const ANONYMOUS_FALLBACK_STORAGE_KEY = 'gioteperfumo_fallback_uid';

let currentUid: string | null = auth.currentUser?.uid || null;
let isAnonymousAuthSupported = true;
let authInitPromise: Promise<string> | null = null;

// Listeners internos suscritos a cambios de likes
type LikesListener = (state: {
  counts: Record<string, number>;
  userLikedIds: Set<string>;
}) => void;

const listeners = new Set<LikesListener>();

// Cache en memoria
let cachedCounts: Record<string, number> = {};
let cachedUserLikedIds = new Set<string>();
let rawLikesDocs: Array<{ id: string; perfumeId: string; uid: string }> = [];

// Función para obtener o generar UID de fallback si Anonymous Auth de Firebase no está activo en consola
function getOrCreateFallbackUid(): string {
  if (typeof window === 'undefined') return 'server_guest_uid';
  try {
    const stored = localStorage.getItem(ANONYMOUS_FALLBACK_STORAGE_KEY);
    if (stored && stored.trim()) {
      return stored.trim();
    }
    const newUid =
      'anon_' +
      (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2) + Date.now().toString(36));
    localStorage.setItem(ANONYMOUS_FALLBACK_STORAGE_KEY, newUid);
    return newUid;
  } catch {
    return 'temp_guest_' + Date.now();
  }
}

/**
 * Inicializa y garantiza la identidad transparente del usuario usando Firebase Auth.
 * Si ya hay un usuario (por ejemplo Administrador logueado con Google), lo respeta.
 * Si no hay usuario autenticado, inicia sesión anónima transparente con Firebase Auth.
 */
export function ensureUserId(): Promise<string> {
  if (currentUid) {
    return Promise.resolve(currentUid);
  }

  if (authInitPromise) {
    return authInitPromise;
  }

  authInitPromise = new Promise<string>(resolve => {
    // 1. Revisar estado actual de auth
    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user?.uid) {
        currentUid = user.uid;
        unsubscribe();
        recalculateUserLikes();
        resolve(user.uid);
        return;
      }

      // 2. Intentar autenticación anónima transparente
      try {
        const userCred = await signInAnonymously(auth);
        currentUid = userCred.user.uid;
        unsubscribe();
        recalculateUserLikes();
        resolve(userCred.user.uid);
      } catch (err: any) {
        isAnonymousAuthSupported = false;
        console.warn(
          'Firebase Anonymous Auth no disponible o deshabilitado en consola. Usando UID persistente seguro de visitante.',
          err?.message || err
        );
        const fallback = getOrCreateFallbackUid();
        currentUid = fallback;
        unsubscribe();
        recalculateUserLikes();
        resolve(fallback);
      }
    });
  });

  return authInitPromise;
}

// Iniciar resolución en segundo plano inmediatamente
if (typeof window !== 'undefined') {
  ensureUserId().catch(err => console.error('Error al inicializar Auth para likes:', err));
}

// Escuchar cambios de sesión posteriores (ej. Admin hace login o logout)
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, user => {
    const newUid = user?.uid || null;
    if (newUid && newUid !== currentUid) {
      currentUid = newUid;
      recalculateUserLikes();
    }
  });
}

function recalculateUserLikes() {
  const newUserLikedIds = new Set<string>();
  const activeUid = currentUid;

  if (activeUid) {
    for (const item of rawLikesDocs) {
      if (item.uid === activeUid) {
        newUserLikedIds.add(item.perfumeId);
      }
    }
  }

  cachedUserLikedIds = newUserLikedIds;
  notifySubscribers();
}

function notifySubscribers() {
  const payload = {
    counts: { ...cachedCounts },
    userLikedIds: new Set(cachedUserLikedIds),
  };
  listeners.forEach(fn => {
    try {
      fn(payload);
    } catch (err) {
      console.error('Error en listener de likes:', err);
    }
  });
}

// SINGLETON: Un solo listener global a la colección Firestore 'perfume_likes'
let globalUnsubscribeFirestore: (() => void) | null = null;
let activeSubscribersCount = 0;

function startFirestoreListener() {
  if (globalUnsubscribeFirestore) return;

  const likesColl = collection(db, 'perfume_likes');

  globalUnsubscribeFirestore = onSnapshot(
    likesColl,
    snapshot => {
      const counts: Record<string, number> = {};
      const newRawDocs: Array<{ id: string; perfumeId: string; uid: string }> = [];
      const userLiked = new Set<string>();
      const activeUid = currentUid;

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        let perfumeId =
          typeof data?.perfumeId === 'string' && data.perfumeId.trim()
            ? data.perfumeId.trim()
            : '';
        let uid =
          typeof data?.uid === 'string' && data.uid.trim() ? data.uid.trim() : '';

        // Fallback: extraer de id del doc si fue creado como ${perfumeId}_${uid}
        if (!perfumeId && docSnap.id.includes('_')) {
          const parts = docSnap.id.split('_');
          perfumeId = parts[0];
          uid = parts.slice(1).join('_');
        }

        if (perfumeId) {
          counts[perfumeId] = (counts[perfumeId] || 0) + 1;
          newRawDocs.push({ id: docSnap.id, perfumeId, uid });

          if (activeUid && uid === activeUid) {
            userLiked.add(perfumeId);
          }
        }
      });

      cachedCounts = counts;
      rawLikesDocs = newRawDocs;
      cachedUserLikedIds = userLiked;

      notifySubscribers();
    },
    error => {
      console.warn('Error en onSnapshot de perfume_likes:', error);
    }
  );
}

function stopFirestoreListener() {
  if (activeSubscribersCount <= 0 && globalUnsubscribeFirestore) {
    globalUnsubscribeFirestore();
    globalUnsubscribeFirestore = null;
  }
}

/**
 * Suscribe un callback a los likes de perfumes en tiempo real.
 * Utiliza exactamente UN SOLO listener global a Firestore para toda la aplicación.
 */
export function subscribePerfumeLikes(
  callback: (state: {
    counts: Record<string, number>;
    userLikedIds: Set<string>;
  }) => void
): () => void {
  listeners.add(callback);
  activeSubscribersCount++;

  // Emitir inmediatamente estado en memoria
  callback({
    counts: { ...cachedCounts },
    userLikedIds: new Set(cachedUserLikedIds),
  });

  startFirestoreListener();

  return () => {
    listeners.delete(callback);
    activeSubscribersCount--;
    if (activeSubscribersCount <= 0) {
      stopFirestoreListener();
    }
  };
}

/**
 * Consulta síncrona rápida si el usuario actual dio like a un perfume.
 */
export function hasUserLikedPerfume(perfumeId: string): boolean {
  return cachedUserLikedIds.has(perfumeId);
}

/**
 * Obtiene el UID actual (o lo resuelve si aún no ha terminado).
 */
export async function getCurrentUserId(): Promise<string> {
  if (currentUid) return currentUid;
  return await ensureUserId();
}

/**
 * Agrega like a un perfume creando el documento individual perfume_likes/${perfumeId}_${uid}.
 * Si el usuario ya dio like, setDoc es idempotente gracias al id único.
 */
export async function likePerfume(perfumeId: string, customUid?: string): Promise<boolean> {
  const uid = customUid || (await getCurrentUserId());
  const docId = `${perfumeId}_${uid}`;
  const likeDocRef = doc(db, 'perfume_likes', docId);

  // Actualización optimista local inmediata
  cachedUserLikedIds.add(perfumeId);
  cachedCounts[perfumeId] = (cachedCounts[perfumeId] || 0) + 1;
  notifySubscribers();

  try {
    await setDoc(
      likeDocRef,
      {
        perfumeId,
        uid,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    );
    return true;
  } catch (error) {
    console.error('Error al persistir like en Firestore:', error);
    // Revertir optimismo si falló
    recalculateUserLikes();
    throw error;
  }
}

/**
 * Quita like a un perfume eliminando el documento individual perfume_likes/${perfumeId}_${uid}.
 */
export async function unlikePerfume(perfumeId: string, customUid?: string): Promise<boolean> {
  const uid = customUid || (await getCurrentUserId());
  const docId = `${perfumeId}_${uid}`;
  const likeDocRef = doc(db, 'perfume_likes', docId);

  // Actualización optimista local inmediata
  cachedUserLikedIds.delete(perfumeId);
  cachedCounts[perfumeId] = Math.max(0, (cachedCounts[perfumeId] || 1) - 1);
  notifySubscribers();

  try {
    await deleteDoc(likeDocRef);
    return true;
  } catch (error) {
    console.error('Error al remover like en Firestore:', error);
    // Revertir optimismo si falló
    recalculateUserLikes();
    throw error;
  }
}

/**
 * Alterna (toggle) el like público de un perfume.
 */
export async function togglePerfumeLike(
  perfumeId: string,
  customUid?: string
): Promise<{ isLiked: boolean; newCount?: number }> {
  const isCurrentlyLiked = hasUserLikedPerfume(perfumeId);

  if (isCurrentlyLiked) {
    await unlikePerfume(perfumeId, customUid);
    return {
      isLiked: false,
      newCount: cachedCounts[perfumeId] || 0,
    };
  } else {
    await likePerfume(perfumeId, customUid);
    return {
      isLiked: true,
      newCount: cachedCounts[perfumeId] || 0,
    };
  }
}

export function isFirebaseAnonymousAuthActive(): boolean {
  return isAnonymousAuthSupported;
}

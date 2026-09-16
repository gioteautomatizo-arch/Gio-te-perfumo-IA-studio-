import React, { useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  User,
} from 'firebase/auth';
import { Copy, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { auth } from '../lib/firebase';
import { AdminCatalogManager } from './AdminCatalogManager';

const ADMIN_UID = 'PFpJ0gKykIb7KLz9WIxLXhyNL4a2';

export const AdminAccess: React.FC = () => {
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [domainCopied, setDomainCopied] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleGoogleSignIn = async () => {
    setError(null);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      const code = String(err?.code || '');
      if (
        code.includes('popup-blocked') ||
        code.includes('popup-closed-by-user') ||
        code.includes('cancelled-popup-request')
      ) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError: any) {
          setError(redirectError?.message || 'No fue posible iniciar sesión con Google.');
          return;
        }
      }
      setError(err?.message || 'No fue posible iniciar sesión con Google.');
    }
  };

  const handleCopyUid = async () => {
    if (!user?.uid) return;
    try {
      await navigator.clipboard.writeText(user.uid);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('No pude copiar el UID automáticamente. Mantén presionado el texto para copiarlo.');
    }
  };

  const handleCopyDomain = async () => {
    try {
      await navigator.clipboard.writeText(window.location.hostname);
      setDomainCopied(true);
      window.setTimeout(() => setDomainCopied(false), 1800);
    } catch {
      setError(`Copia manualmente este dominio: ${window.location.hostname}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center text-sm text-[#666] dark:text-[#a1a1aa]">
        Verificando acceso…
      </div>
    );
  }

  const isAdmin = user?.uid === ADMIN_UID;
  const unauthorizedDomain = Boolean(error?.includes('auth/unauthorized-domain'));

  return (
    <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <div className="border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 bg-[#fcfaf7] dark:bg-[#141418] p-5 sm:p-7 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-[#1a1a1a] flex items-center justify-center border border-[#c5a059]">
            <ShieldCheck className="w-5 h-5 text-[#c5a059]" />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a059]">Gio te perfumo</p>
            <h2 className="font-serif italic text-2xl text-[#1a1a1a] dark:text-[#f4f4f5]">Acceso administrador</h2>
          </div>
        </div>

        {!user ? (
          <>
            <p className="text-sm leading-relaxed text-[#555] dark:text-[#a1a1aa] mb-5">
              Inicia sesión con tu cuenta de Google para administrar el catálogo, precios, promociones, stock e imágenes.
            </p>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full min-h-[46px] px-4 py-3 bg-[#1a1a1a] text-[#c5a059] border border-[#c5a059]/70 font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              Entrar con Google
            </button>
          </>
        ) : (
          <div className="space-y-5">
            <div className={`border p-4 ${isAdmin ? 'border-emerald-600/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
              <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isAdmin ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-300'}`}>
                {isAdmin ? 'Administrador autorizado' : 'Cuenta sin permisos de administrador'}
              </p>
              <p className="font-semibold text-[#1a1a1a] dark:text-[#f4f4f5]">{user.displayName || 'Usuario'}</p>
              <p className="text-xs text-[#666] dark:text-[#a1a1aa] break-all">{user.email}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c5a059] mb-2">UID de Firebase</p>
              <div className="flex gap-2 items-stretch">
                <code className="flex-1 min-w-0 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 bg-[#f5f0e8] dark:bg-[#0b0b0d] px-3 py-3 text-xs break-all text-[#1a1a1a] dark:text-[#f4f4f5]">
                  {user.uid}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUid}
                  className="shrink-0 min-w-[46px] border border-[#1a1a1a]/20 dark:border-[#c5a059]/30 px-3 flex items-center justify-center text-[#c5a059]"
                  aria-label="Copiar UID"
                  title="Copiar UID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-[#666] dark:text-[#a1a1aa] mt-2">
                {copied ? 'UID copiado.' : isAdmin ? 'Tu cuenta coincide con el administrador autorizado.' : 'Esta cuenta no coincide con el administrador configurado.'}
              </p>
            </div>

            {isAdmin && <AdminCatalogManager />}

            <button
              type="button"
              onClick={() => signOut(auth)}
              className="w-full min-h-[42px] px-4 py-2.5 border border-[#1a1a1a]/20 dark:border-[#c5a059]/30 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 text-[#1a1a1a] dark:text-[#f4f4f5]"
            >
              <LogOut className="w-4 h-4" />
              Cerrar sesión
            </button>
          </div>
        )}

        {error && !unauthorizedDomain && (
          <p className="mt-4 text-xs border border-red-500/30 bg-red-500/5 text-red-700 dark:text-red-300 p-3 break-words">
            {error}
          </p>
        )}

        {unauthorizedDomain && (
          <div className="mt-4 border border-[#c5a059]/50 bg-[#fff9ec] dark:bg-[#0b0b0d] p-3 space-y-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#8a681f] dark:text-[#c5a059]">
              Este dominio todavía no está autorizado en Firebase
            </p>
            <code className="block border border-[#1a1a1a]/10 dark:border-[#c5a059]/20 bg-white dark:bg-[#141418] px-3 py-2 text-[11px] break-all text-[#1a1a1a] dark:text-[#f4f4f5]">
              {window.location.hostname}
            </code>
            <button
              type="button"
              onClick={handleCopyDomain}
              className="w-full min-h-[38px] px-3 py-2 bg-[#c5a059] text-[#1a1a1a] text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2"
            >
              <Copy className="w-3.5 h-3.5" />
              {domainCopied ? 'Dominio copiado' : 'Copiar dominio'}
            </button>
            <p className="text-[10px] text-[#666] dark:text-[#a1a1aa]">
              Agrégalo en Firebase → Authentication → Configuración → Dominios autorizados.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

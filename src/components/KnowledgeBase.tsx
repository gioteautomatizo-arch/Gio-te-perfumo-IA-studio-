import React, { useState, useMemo, useRef, useEffect, memo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Sparkles,
  Heart,
  Eye,
  ShieldCheck,
  Tag,
  Clock,
  Wind,
  ChevronDown,
  ChevronUp,
  X,
  Compass,
  Share2,
  Check,
  Bookmark,
  BookmarkCheck,
  ShoppingBag,
  MessageCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Perfume } from '../types';
import { PERFUMES_DATABASE } from '../data/perfumes';
import { PerfumeImage } from './PerfumeImage';
import {
  subscribePerfumeLikes,
  likePerfume,
  togglePerfumeLike,
} from '../lib/perfumeLikesService';
import {
  WHATSAPP_SALES_NUMBER,
  getEffectivePrice,
  getReservationAmounts,
  buildReservationWhatsAppUrl,
  buildConsultWhatsAppUrl,
  formatMXN,
} from '../lib/whatsappSales';

export { getEffectivePrice };

export interface KnowledgeBaseProps {
  onOpenDetail: (perfume: Perfume) => void;
  onToggleSave: (perfume: Perfume) => void;
  savedPerfumeIds: string[];
  onConsultGiobot: (perfume: Perfume) => void;
}

type QuickFilterType = 'all' | 'designer' | 'arabic' | 'men' | 'women' | 'unisex' | 'custom';

const INITIAL_PAGE_SIZE = 12;
const PAGE_INCREMENT = 12;

// Memoized individual perfume card for performance
const PerfumeCardItem = memo(({
  perfume,
  isSaved,
  onToggleSave,
  onOpenDetail,
  onConsultGiobot,
  likeCount,
  isPublicLiked,
  onToggleLike,
  onAddLike,
}: {
  perfume: Perfume;
  isSaved: boolean;
  onToggleSave: (perfume: Perfume) => void;
  onOpenDetail: (perfume: Perfume) => void;
  onConsultGiobot: (perfume: Perfume) => void;
  likeCount: number;
  isPublicLiked: boolean;
  onToggleLike: (perfumeId: string) => void;
  onAddLike: (perfumeId: string) => void;
}) => {
  const [shareCopied, setShareCopied] = useState(false);
  const [showHeartAnim, setShowHeartAnim] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState(false);

  const lastTouchTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const hasActivePromo =
    perfume.promoActive === true &&
    typeof perfume.promoPriceMXN === 'number' &&
    perfume.promoPriceMXN > 0;

  const currentPrice = getEffectivePrice(perfume);
  const { deposit, balance } = getReservationAmounts(currentPrice);
  const reservationUrl = buildReservationWhatsAppUrl(perfume);
  const consultWhatsAppUrl = buildConsultWhatsAppUrl(perfume);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = new URL(window.location.href);
    url.searchParams.set('perfume', perfume.id);
    const shareUrl = url.toString();
    const shareData = {
      title: `${perfume.brand} ${perfume.name} | Gio te perfumo`,
      text: 'Mira esta fragancia en Gio te perfumo.',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      window.setTimeout(() => setShareCopied(false), 2200);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        window.setTimeout(() => setShareCopied(false), 2200);
      } catch (clipErr) {
        console.error('Error al copiar enlace:', clipErr);
      }
    }
  };

  const triggerDoubleTapLike = () => {
    setShowHeartAnim(true);
    window.setTimeout(() => setShowHeartAnim(false), 850);
    if (!isPublicLiked) {
      onAddLike(perfume.id);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartPosRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      const dist = Math.hypot(
        touch.clientX - touchStartPosRef.current.x,
        touch.clientY - touchStartPosRef.current.y
      );
      // Ignore if user was scrolling (gesture > 10px)
      if (dist > 10) return;

      const now = Date.now();
      const timeDiff = now - lastTouchTimeRef.current;
      if (timeDiff > 0 && timeDiff < 320) {
        // Double-tap detected
        e.stopPropagation();
        triggerDoubleTapLike();
        lastTouchTimeRef.current = 0;
      } else {
        lastTouchTimeRef.current = now;
      }
    }
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerDoubleTapLike();
  };

  const handleTogglePublicLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isPublicLiked) {
      setShowHeartAnim(true);
      window.setTimeout(() => setShowHeartAnim(false), 850);
    }
    onToggleLike(perfume.id);
  };

  return (
    <div
      className="bg-[#f5f0e8] dark:bg-[#111113] border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 p-4 sm:p-5 shadow-xs hover:border-[#1a1a1a] dark:hover:border-[#c5a059]/70 transition-all duration-300 flex flex-col justify-between group"
    >
      <div>
        {/* 1. IMAGEN DEL PERFUME (Contenedor cuadrado 1:1, soporte de doble toque) */}
        <div
          className="relative aspect-square w-full overflow-hidden mb-3.5 bg-[#fcfaf7] dark:bg-[#18181b] border border-[#1a1a1a]/10 dark:border-[#c5a059]/20 flex items-center justify-center p-2 select-none cursor-pointer"
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <PerfumeImage
            perfumeId={perfume.id}
            alt={perfume.name}
            className="w-full h-full object-contain object-center pointer-events-none"
          />

          {/* Animación de Corazón Grande (Doble toque estilo Instagram) */}
          <AnimatePresence>
            {showHeartAnim && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.28, 1], opacity: [0, 1, 0.95] }}
                exit={{ scale: 1.15, opacity: 0 }}
                transition={{ duration: 0.8, times: [0, 0.35, 0.8] }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
              >
                <Heart className="w-16 h-16 fill-[#c5a059] text-[#111113] drop-shadow-[0_6px_20px_rgba(0,0,0,0.65)] stroke-[1.5]" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Top Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none z-10">
            <span className="bg-[#1a1a1a] dark:bg-[#09090b] text-[#c5a059] border border-transparent dark:border-[#c5a059]/40 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 shadow-xs">
              {perfume.category}
            </span>
            <span className="bg-[#fcfaf7] dark:bg-[#202024] text-[#1a1a1a] dark:text-[#e4e4e7] border border-[#1a1a1a]/20 dark:border-[#c5a059]/30 text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 shadow-xs">
              {perfume.gender}
            </span>
          </div>

          {/* Acciones Superiores Derechas: Compartir + Guardar en Mi Armario */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            {/* Botón Compartir Tarjeta */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                aria-label="Compartir perfume"
                title="Compartir enlace de esta fragancia"
                className="p-2 transition-colors border shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center bg-[#fcfaf7]/90 dark:bg-[#202024]/90 text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/20 dark:border-[#c5a059]/30 hover:bg-[#1a1a1a] hover:text-[#c5a059] dark:hover:bg-[#c5a059] dark:hover:text-[#111113]"
              >
                {shareCopied ? (
                  <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                ) : (
                  <Share2 className="w-4 h-4 text-[#c5a059]" />
                )}
              </button>
              {shareCopied && (
                <span className="absolute right-0 -bottom-6 bg-[#101014] text-emerald-300 text-[9px] font-bold tracking-wider px-1.5 py-0.5 border border-[#c5a059]/40 whitespace-nowrap shadow-md pointer-events-none z-40">
                  Enlace copiado
                </span>
              )}
            </div>

            {/* Guardar en Mi Armario (Bookmark) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const nextSaved = !isSaved;
                  onToggleSave(perfume);
                  if (nextSaved) {
                    setSaveFeedback(true);
                    window.setTimeout(() => setSaveFeedback(false), 2000);
                  }
                }}
                aria-label={isSaved ? 'Guardado en Mi Armario' : 'Guardar en Mi Armario'}
                title={isSaved ? 'Guardado en Mi Armario' : 'Guardar en Mi Armario'}
                className={`p-2 transition-colors border shadow-xs min-h-[36px] min-w-[36px] flex items-center justify-center ${
                  isSaved
                    ? 'bg-[#1a1a1a] dark:bg-[#18181b] text-[#c5a059] border-[#1a1a1a] dark:border-[#c5a059]'
                    : 'bg-[#fcfaf7]/90 dark:bg-[#202024]/90 text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/20 dark:border-[#c5a059]/30 hover:bg-[#1a1a1a] hover:text-[#c5a059] dark:hover:bg-[#c5a059] dark:hover:text-[#111113]'
                }`}
              >
                {isSaved ? (
                  <BookmarkCheck className="w-4 h-4 text-[#c5a059]" />
                ) : (
                  <Bookmark className="w-4 h-4" />
                )}
              </button>
              {saveFeedback && (
                <span className="absolute right-0 -bottom-6 bg-[#101014] text-[#c5a059] text-[9px] font-bold tracking-wider px-1.5 py-0.5 border border-[#c5a059]/40 whitespace-nowrap shadow-md pointer-events-none z-40 animate-in fade-in duration-200">
                  Guardado en Mi Armario
                </span>
              )}
            </div>
          </div>

          {/* Contador Público de Likes (Inferior Izquierda) */}
          <button
            type="button"
            onClick={handleTogglePublicLike}
            aria-label={isPublicLiked ? 'Quitar like a este perfume' : 'Dar like a este perfume'}
            title={
              isPublicLiked
                ? 'Te gusta esta fragancia (toca para quitar like)'
                : 'Likes de la comunidad (doble toque en la foto para dar like)'
            }
            className={`absolute bottom-2.5 left-2.5 px-2 py-1 flex items-center gap-1.5 text-[11px] font-bold tracking-wider transition-all border shadow-xs min-h-[28px] z-10 ${
              isPublicLiked
                ? 'bg-[#1a1a1a]/95 dark:bg-[#18181b]/95 text-[#c5a059] border-[#c5a059]'
                : 'bg-[#fcfaf7]/90 dark:bg-[#18181b]/90 text-[#666] dark:text-[#a1a1aa] border-[#1a1a1a]/15 dark:border-[#c5a059]/25 hover:text-[#1a1a1a] dark:hover:text-[#f4f4f5]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isPublicLiked ? 'fill-[#c5a059] text-[#c5a059]' : 'text-current'}`} />
            <span>{likeCount}</span>
          </button>

          {/* Original Guarantee Flag (Inferior Derecha) */}
          <div className="absolute bottom-2.5 right-2.5 bg-[#fcfaf7]/95 dark:bg-[#18181b]/95 text-[#1a1a1a] dark:text-[#e4e4e7] border border-[#c5a059] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs pointer-events-none z-10">
            <ShieldCheck className="w-3 h-3 text-[#c5a059]" />
            Original
          </div>
        </div>

        {/* 2. MARCA + CONCENTRACIÓN */}
        <div className="flex items-center justify-between text-[11px] uppercase tracking-widest font-semibold text-[#888] dark:text-[#a1a1aa] mb-1">
          <span className="text-[#1a1a1a] dark:text-[#f4f4f5] font-bold">{perfume.brand}</span>
          <span className="text-[#c5a059]">• {perfume.concentration}</span>
        </div>

        {/* 3. NOMBRE */}
        <h3 className="text-xl font-serif italic text-[#1a1a1a] dark:text-[#fcfaf7] group-hover:text-[#c5a059] transition-colors leading-tight mb-2">
          {perfume.name}
        </h3>

        {/* 4. PRECIO */}
        {hasActivePromo ? (
          <div className="mb-2">
            <div className="text-xs text-[#888] dark:text-[#d4d4d8] line-through font-serif italic leading-none mb-0.5">
              ${perfume.priceMXN.toLocaleString('es-MX')}
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">
                ${perfume.promoPriceMXN!.toLocaleString('es-MX')}
              </span>
              <span className="text-[10px] font-sans font-normal text-[#666] dark:text-[#d4d4d8] not-italic">
                MXN
              </span>
              {perfume.promoLabel && perfume.promoLabel.trim() ? (
                <span className="text-[9px] uppercase tracking-wider font-bold text-[#c5a059] dark:text-[#f5d78e] bg-[#c5a059]/15 dark:bg-[#c5a059]/20 border border-[#c5a059]/50 dark:border-[#c5a059] px-1.5 py-0.5">
                  {perfume.promoLabel.trim()}
                </span>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="text-lg font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa] mb-2 flex items-baseline gap-1">
            ${perfume.priceMXN.toLocaleString('es-MX')}{' '}
            <span className="text-[10px] font-sans font-normal text-[#666] dark:text-[#d4d4d8] not-italic">
              MXN
            </span>
          </div>
        )}

        {/* 5. FAMILIA OLFATIVA */}
        <div className="text-xs text-[#555] dark:text-[#a1a1aa] font-medium mb-2.5">
          <span className="text-[#c5a059] font-bold uppercase tracking-wider text-[10px]">
            Familia:{' '}
          </span>
          <span className="font-serif italic text-[#1a1a1a] dark:text-[#e4e4e7]">{perfume.family}</span>
        </div>

        {/* 6. MÁXIMO 3 ACORDES PRINCIPALES */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3">
          <Tag className="w-3 h-3 text-[#c5a059] shrink-0" />
          {perfume.mainAccords.slice(0, 3).map((accord, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-[#fcfaf7] dark:bg-[#1c1c20] text-[#1a1a1a] dark:text-[#d4d4d8] border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 px-2 py-0.5 font-medium"
            >
              {accord}
            </span>
          ))}
        </div>

        {/* 7. DURACIÓN Y PROYECCIÓN EN UNA SOLA LÍNEA */}
        <div className="flex items-center gap-3 text-xs text-[#555] dark:text-[#d4d4d8] font-light py-2 border-y border-[#1a1a1a]/10 dark:border-[#c5a059]/20 mb-4 bg-[#fcfaf7]/50 dark:bg-[#18181b] px-2.5">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
            <span className="text-[11px]">{perfume.duration}</span>
          </div>
          <span className="text-[#bbb] dark:text-[#52525b]">·</span>
          <div className="flex items-center gap-1.5">
            <Wind className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
            <span className="text-[11px]">{perfume.projection}</span>
          </div>
        </div>
      </div>

      {/* ACCIONES DEL PERFUME: JERARQUÍA COMERCIAL Y ASESORÍA
          1. APARTAR CON 60% (Acción Principal de Venta)
          2. Consultar por WhatsApp (Acción Secundaria)
          3. Consultar a Giobot (Asesoría IA)
          4. Ver ficha (Ficha Técnica)
      */}
      <div className="space-y-2 pt-2 border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20">
        {/* 1. Botón Principal Comercial: APARTAR CON 60% */}
        <div className="space-y-1">
          <a
            href={reservationUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-3 px-3 bg-[#c5a059] hover:bg-[#d8b46d] active:scale-[0.99] text-[#111113] border border-[#c5a059] font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-sm min-h-[44px]"
            title={`Apartar ${perfume.name} con 60% por WhatsApp`}
          >
            <ShoppingBag className="w-4 h-4 text-[#111113] shrink-0" />
            <span>Apartar con 60%</span>
          </a>
          <div className="flex items-center justify-between px-1 text-[11px] text-[#666] dark:text-[#a1a1aa]">
            <span>
              Anticipo hoy:{' '}
              <strong className="text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold">
                ${formatMXN(deposit)} MXN
              </strong>
            </span>
            <span className="text-[10px] text-[#888] dark:text-[#71717a]">
              Saldo: ${formatMXN(balance)} MXN
            </span>
          </div>
        </div>

        {/* 2. Acción Secundaria: Consultar por WhatsApp */}
        <a
          href={consultWhatsAppUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="w-full py-2.5 px-3 bg-[#fcfaf7] hover:bg-[#f0ebe1] dark:bg-[#18181b] dark:hover:bg-[#232328] text-[#1a1a1a] dark:text-[#f4f4f5] border border-[#1a1a1a]/20 dark:border-[#c5a059]/35 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 min-h-[40px]"
          title={`Consultar disponibilidad de ${perfume.name} por WhatsApp`}
        >
          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Consultar por WhatsApp</span>
        </a>

        {/* 3. Consultar a Giobot */}
        <button
          type="button"
          onClick={() => onConsultGiobot(perfume)}
          className="w-full py-2.5 px-3 bg-[#1a1a1a] hover:bg-[#2a2a2e] dark:bg-[#0c0c0e] dark:hover:bg-[#18181b] text-[#c5a059] border border-[#c5a059]/60 dark:border-[#c5a059] text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs min-h-[40px]"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
          <span>Consultar a Giobot</span>
        </button>

        {/* 4. Ver ficha */}
        <button
          type="button"
          onClick={() => onOpenDetail(perfume)}
          className="w-full py-2.5 px-3 bg-[#fcfaf7] hover:bg-[#f0ebe1] dark:bg-[#18181b] dark:hover:bg-[#232328] text-[#1a1a1a] dark:text-[#f4f4f5] border border-[#1a1a1a]/20 dark:border-[#c5a059]/35 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 min-h-[40px]"
        >
          <Eye className="w-3.5 h-3.5 text-[#666] dark:text-[#c5a059]" />
          <span>Ver ficha</span>
        </button>
      </div>
    </div>
  );
});

PerfumeCardItem.displayName = 'PerfumeCardItem';


export const KnowledgeBase: React.FC<KnowledgeBaseProps> = ({
  onOpenDetail,
  onToggleSave,
  savedPerfumeIds,
  onConsultGiobot,
}) => {
  const catalogRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [quickFilter, setQuickFilter] = useState<QuickFilterType>('all');
  const [showMoreFilters, setShowMoreFilters] = useState<boolean>(false);
  const [showPersonalShowcase, setShowPersonalShowcase] = useState<boolean>(false);

  // Likes en tiempo real: 1 solo listener a la colección para todo el catálogo
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [userLikedIds, setUserLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsub = subscribePerfumeLikes(({ counts, userLikedIds: currentLiked }) => {
      setLikeCounts(counts);
      setUserLikedIds(currentLiked);
    });
    return unsub;
  }, []);

  const handleToggleLike = async (perfumeId: string) => {
    try {
      await togglePerfumeLike(perfumeId);
    } catch (err) {
      console.error('Error al alternar like en Firestore:', err);
    }
  };

  const handleAddLike = async (perfumeId: string) => {
    if (userLikedIds.has(perfumeId)) return;
    try {
      await likePerfume(perfumeId);
    } catch (err) {
      console.error('Error al registrar like en Firestore:', err);
    }
  };

  // Advanced filter states
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');
  const [selectedGender, setSelectedGender] = useState<string>('Todos');
  const [selectedFamily, setSelectedFamily] = useState<string>('Todas');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('Todas');
  const [maxPrice, setMaxPrice] = useState<number>(4000);
  const [sortBy, setSortBy] = useState<'default' | 'value' | 'priceAsc' | 'priceDesc'>('default');

  const families: string[] = [
    'Todas',
    'Gourmand / Dulce',
    'Aromática / Fougère',
    'Fresca / Acuática',
    'Cítrica',
    'Amaderada',
    'Amaderada Especiada',
    'Amaderada Aromática',
    'Oriental / Ambarada',
  ];

  const occasions = [
    'Todas',
    'Uso diario',
    'Oficina o trabajo',
    'Citas románticas',
    'Fiestas o vida nocturna',
  ];

  // Helper function to match gender robustly across naming conventions
  const matchGender = (perfumeGender: string, targetGender: string) => {
    if (!targetGender || targetGender === 'Todos' || targetGender === 'all') return true;
    const pG = (perfumeGender || '').toLowerCase();
    const tG = targetGender.toLowerCase();

    if (tG === 'masculino' || tG === 'caballero' || tG === 'hombre') {
      return pG.includes('masculino') || pG.includes('caballero') || pG.includes('hombre');
    }
    if (tG === 'femenino' || tG === 'dama' || tG === 'mujer') {
      return pG.includes('femenino') || pG.includes('dama') || pG.includes('mujer');
    }
    if (tG === 'unisex') {
      return pG.includes('unisex');
    }
    return pG === tG;
  };

  // Randomized database order
  const randomizedDatabase = useMemo(() => {
    const list = [...PERFUMES_DATABASE];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }, []);

  // Quick category counts
  const categoryCounts = useMemo(() => {
    const db = PERFUMES_DATABASE;
    return {
      all: db.length,
      designer: db.filter(p => p.category === 'Diseñador').length,
      arabic: db.filter(p => p.category === 'Árabe').length,
      men: db.filter(p => matchGender(p.gender, 'Masculino')).length,
      women: db.filter(p => matchGender(p.gender, 'Femenino')).length,
      unisex: db.filter(p => matchGender(p.gender, 'Unisex')).length,
    };
  }, []);

  // Founding Collection Perfumes
  const personalCollectionPerfumes = useMemo(() => {
    return PERFUMES_DATABASE.filter(p => p.isFoundingCollection).sort(
      (a, b) => (a.foundingOrder || 99) - (b.foundingOrder || 99)
    );
  }, []);

  // Handle Quick Filter clicks
  const handleQuickFilterClick = (type: QuickFilterType) => {
    setQuickFilter(type);
    switch (type) {
      case 'all':
        setSelectedCategory('Todas');
        setSelectedGender('Todos');
        break;
      case 'designer':
        setSelectedCategory('Diseñador');
        setSelectedGender('Todos');
        break;
      case 'arabic':
        setSelectedCategory('Árabe');
        setSelectedGender('Todos');
        break;
      case 'men':
        setSelectedCategory('Todas');
        setSelectedGender('Masculino');
        break;
      case 'women':
        setSelectedCategory('Todas');
        setSelectedGender('Femenino');
        break;
      case 'unisex':
        setSelectedCategory('Todas');
        setSelectedGender('Unisex');
        break;
      default:
        break;
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearch('');
    setQuickFilter('all');
    setSelectedCategory('Todas');
    setSelectedGender('Todos');
    setSelectedFamily('Todas');
    setSelectedOccasion('Todas');
    setMaxPrice(4000);
    setSortBy('default');
    setVisibleCount(INITIAL_PAGE_SIZE);
  };

  const hasActiveAdvancedFilters = useMemo(() => {
    return (
      selectedFamily !== 'Todas' ||
      selectedOccasion !== 'Todas' ||
      maxPrice < 4000 ||
      sortBy !== 'default' ||
      (quickFilter === 'custom' && (selectedCategory !== 'Todas' || selectedGender !== 'Todos'))
    );
  }, [selectedFamily, selectedOccasion, maxPrice, sortBy, quickFilter, selectedCategory, selectedGender]);

  // Progressive rendering state
  const [visibleCount, setVisibleCount] = useState<number>(INITIAL_PAGE_SIZE);

  // Reset pagination on filter or search changes
  useEffect(() => {
    setVisibleCount(INITIAL_PAGE_SIZE);
  }, [selectedCategory, selectedGender, search, selectedFamily, selectedOccasion, maxPrice, sortBy]);

  // Filtered perfumes
  const filteredPerfumes = useMemo(() => {
    let result = [...randomizedDatabase];

    // Category filter
    if (selectedCategory !== 'Todas') {
      result = result.filter(p => p.category === selectedCategory);
    }

    // Gender filter
    if (selectedGender !== 'Todos') {
      result = result.filter(p => matchGender(p.gender, selectedGender));
    }

    // Search query
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.family.toLowerCase().includes(q) ||
          p.topNotes.some(n => n.toLowerCase().includes(q)) ||
          p.baseNotes.some(n => n.toLowerCase().includes(q)) ||
          p.mainAccords.some(a => a.toLowerCase().includes(q))
      );
    }

    // Olfactory Family
    if (selectedFamily !== 'Todas') {
      result = result.filter(p => p.family.toLowerCase() === selectedFamily.toLowerCase());
    }

    // Occasion
    if (selectedOccasion !== 'Todas') {
      const occ = selectedOccasion.toLowerCase();
      result = result.filter(p => p.recommendedOccasions.some(o => o.toLowerCase().includes(occ)));
    }

    // Price (uses effective price when promo is active)
    result = result.filter(p => getEffectivePrice(p) <= maxPrice);

    // Sorting (uses effective price when promo is active)
    if (sortBy === 'priceAsc') {
      result.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sortBy === 'priceDesc') {
      result.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else if (sortBy === 'value') {
      result.sort((a, b) => b.valueForMoney - a.valueForMoney);
    }

    return result;
  }, [
    randomizedDatabase,
    selectedCategory,
    selectedGender,
    search,
    selectedFamily,
    selectedOccasion,
    maxPrice,
    sortBy,
  ]);

  // Visible subset of perfumes for progressive rendering
  const visiblePerfumes = useMemo(() => {
    return filteredPerfumes.slice(0, visibleCount);
  }, [filteredPerfumes, visibleCount]);


  return (
    <div className="max-w-7xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6 animate-fade-in text-[#1a1a1a]">
      {/* 6. ENCABEZADO DEL CATÁLOGO (Compacto, elegante, sin "nicho") */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 bg-[#c5a059]/20 text-[#1a1a1a] border border-[#c5a059]/60 px-2.5 py-0.5 text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" />
            Colección 100% Original
          </div>
          <h2 className="text-xl sm:text-3xl font-serif italic text-[#1a1a1a]">
            Catálogo Oficial Gio te perfumo
          </h2>
          <p className="text-[#555] text-xs sm:text-sm font-light">
            Fragancias seleccionadas para encontrar la que mejor habla de ti.
          </p>
        </div>

        <div className="bg-[#fcfaf7] border border-[#1a1a1a]/15 px-3.5 py-2 text-center shrink-0 self-stretch sm:self-auto flex sm:flex-col items-center justify-between sm:justify-center">
          <span className="text-[10px] text-[#c5a059] uppercase tracking-widest font-bold sm:hidden">
            Disponibles:
          </span>
          <span className="text-xl sm:text-2xl font-serif italic font-bold text-[#1a1a1a]">
            {filteredPerfumes.length}
          </span>
          <span className="text-[9px] sm:text-[10px] text-[#888] uppercase tracking-wider font-semibold hidden sm:block">
            Perfumes
          </span>
        </div>
      </div>

      {/* 5. COLECCIÓN FUNDADORA (Reducida en altura en móvil, diseño especial de Gio te perfumo) */}
      <div className="bg-[#1a1a1a] text-[#fcfaf7] p-4 sm:p-6 border border-[#c5a059]/40 space-y-3 sm:space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[#c5a059] text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
              Historia & Origen
            </div>
            <h3 className="text-lg sm:text-2xl font-serif italic text-[#fcfaf7]">
              Mis primeros 3 perfumes de diseñador
            </h3>
            <p className="text-[#bbb] text-xs font-light max-w-2xl leading-relaxed">
              Las fragancias que iniciaron la pasión por las pirámides olfativas y dieron vida a Gio te perfumo.
            </p>
          </div>

          <button
            onClick={() => setShowPersonalShowcase(prev => !prev)}
            className="self-start sm:self-center bg-[#c5a059] hover:bg-[#b08c48] text-[#1a1a1a] text-xs uppercase tracking-wider font-bold px-4 py-2.5 transition-colors flex items-center gap-2 shrink-0 min-h-[42px]"
          >
            <Eye className="w-4 h-4" />
            <span>{showPersonalShowcase ? 'Cerrar Colección' : 'Conocer la colección'}</span>
          </button>
        </div>

        {/* 3 Designer Collection Cards Showcase (Collapsible) */}
        {showPersonalShowcase && (
          <div className="pt-4 border-t border-[#c5a059]/30">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {personalCollectionPerfumes.map(p => {
                const isSaved = savedPerfumeIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    className="bg-[#242426] border border-[#c5a059]/35 p-3.5 flex flex-col justify-between group"
                  >
                    <div>
                      {/* Badge & Brand */}
                      <div className="flex items-center justify-between mb-2">
                        <span className="bg-[#c5a059] text-[#1a1a1a] font-bold text-[9px] uppercase tracking-wider px-2 py-0.5">
                          Colección Personal #{p.foundingOrder}
                        </span>
                        <span className="text-[10px] text-[#aaa] uppercase tracking-wider">
                          {p.brand}
                        </span>
                      </div>

                      {/* Photo Image (Dedicated fixed mapping) */}
                      <div className="relative aspect-square w-full overflow-hidden mb-2.5 bg-[#141416] border border-[#c5a059]/20 flex items-center justify-center p-2">
                        <PerfumeImage
                          perfumeId={p.id}
                          alt={p.name}
                          className="w-full h-full object-contain object-center"
                        />
                        <button
                          onClick={() => onToggleSave(p)}
                          aria-label="Guardar perfume"
                          className={`absolute top-2 right-2 p-1.5 transition-colors ${
                            isSaved ? 'bg-[#c5a059] text-[#1a1a1a]' : 'bg-[#1a1a1a]/85 text-[#fcfaf7]'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-[#1a1a1a]' : ''}`} />
                        </button>
                        {p.promoActive === true &&
                        typeof p.promoPriceMXN === 'number' &&
                        p.promoPriceMXN > 0 ? (
                          <div className="absolute bottom-2 left-2 bg-[#1a1a1a]/95 text-[#fcfaf7] px-2 py-0.5 border border-[#c5a059]/40 flex items-baseline gap-1.5 flex-wrap">
                            <span className="text-[10px] text-[#d4d4d8] line-through font-serif italic">
                              ${p.priceMXN.toLocaleString('es-MX')}
                            </span>
                            <span className="text-xs font-serif italic font-bold text-[#c5a059]">
                              ${p.promoPriceMXN.toLocaleString('es-MX')} MXN
                            </span>
                            {p.promoLabel && p.promoLabel.trim() ? (
                              <span className="text-[8px] uppercase tracking-wider font-bold text-[#c5a059]">
                                {p.promoLabel.trim()}
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="absolute bottom-2 left-2 bg-[#1a1a1a]/95 text-[#fcfaf7] text-xs font-serif italic px-2 py-0.5 border border-[#c5a059]/30">
                            ${p.priceMXN.toLocaleString('es-MX')} MXN
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-base font-serif italic text-[#fcfaf7] group-hover:text-[#c5a059] transition-colors">
                        {p.name}
                      </h4>
                      <div className="text-[10px] text-[#c5a059] uppercase tracking-wider font-semibold mb-1.5">
                        {p.family} • {p.concentration}
                      </div>

                      <p className="text-xs text-[#ccc] font-light line-clamp-2 mb-2 leading-relaxed">
                        {p.description}
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 pt-2.5 border-t border-[#c5a059]/20">
                      <button
                        onClick={() => onConsultGiobot(p)}
                        className="flex-1 py-2 px-2.5 bg-[#c5a059] hover:bg-[#b08c48] text-[#1a1a1a] text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center justify-center gap-1 min-h-[38px]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Consultar a Giobot</span>
                      </button>
                      <button
                        onClick={() => onOpenDetail(p)}
                        className="py-2 px-3 bg-[#333] hover:bg-[#444] text-[#fcfaf7] text-[10px] uppercase font-semibold tracking-wider transition-colors text-center min-h-[38px]"
                      >
                        Ver ficha
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. SIMPLIFICAR LOS FILTROS (Mobile-First Toolbar) */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-3.5 sm:p-5 space-y-3.5 shadow-xs">
        {/* BUSCADOR */}
        <div>
          <label className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-bold block mb-1">
            Buscador:
          </label>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/50" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Busca perfume, marca, nota o aroma..."
              className="w-full pl-10 pr-9 py-2.5 bg-[#fcfaf7] border border-[#1a1a1a]/20 text-xs text-[#1a1a1a] placeholder-[#1a1a1a]/40 focus:outline-none focus:border-[#1a1a1a] min-h-[42px] transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#1a1a1a] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ACCESOS RÁPIDOS (Pills horizontales limpias) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#888] uppercase tracking-wider font-semibold">
              Accesos rápidos:
            </span>
            {hasActiveAdvancedFilters && (
              <button
                onClick={handleResetFilters}
                className="text-[10px] text-[#c5a059] uppercase tracking-wider font-bold hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {/* Todo */}
            <button
              onClick={() => handleQuickFilterClick('all')}
              className={`text-xs px-3.5 py-2 font-semibold transition-all border flex items-center gap-1.5 min-h-[38px] ${
                quickFilter === 'all' && selectedCategory === 'Todas' && selectedGender === 'Todos'
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a] shadow-xs'
                  : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
              }`}
            >
              <span>Todo</span>
              <span className="text-[10px] bg-[#1a1a1a]/10 px-1.5 py-0.5 font-bold">
                {categoryCounts.all}
              </span>
            </button>

            {/* Diseñador */}
            <button
              onClick={() => handleQuickFilterClick('designer')}
              className={`text-xs px-3.5 py-2 font-semibold transition-all border flex items-center gap-1.5 min-h-[38px] ${
                quickFilter === 'designer'
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a] shadow-xs'
                  : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
              }`}
            >
              <span>Diseñador</span>
              <span className="text-[10px] bg-[#1a1a1a]/10 px-1.5 py-0.5 font-bold">
                {categoryCounts.designer}
              </span>
            </button>

            {/* Árabe */}
            <button
              onClick={() => handleQuickFilterClick('arabic')}
              className={`text-xs px-3.5 py-2 font-semibold transition-all border flex items-center gap-1.5 min-h-[38px] ${
                quickFilter === 'arabic'
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a] shadow-xs'
                  : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
              }`}
            >
              <span>Árabe</span>
              <span className="text-[10px] bg-[#1a1a1a]/10 px-1.5 py-0.5 font-bold">
                {categoryCounts.arabic}
              </span>
            </button>

            {/* Hombre */}
            <button
              onClick={() => handleQuickFilterClick('men')}
              className={`text-xs px-3.5 py-2 font-semibold transition-all border flex items-center gap-1.5 min-h-[38px] ${
                quickFilter === 'men'
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a] shadow-xs'
                  : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
              }`}
            >
              <span>Hombre</span>
              <span className="text-[10px] bg-[#1a1a1a]/10 px-1.5 py-0.5 font-bold">
                {categoryCounts.men}
              </span>
            </button>

            {/* Mujer */}
            <button
              onClick={() => handleQuickFilterClick('women')}
              className={`text-xs px-3.5 py-2 font-semibold transition-all border flex items-center gap-1.5 min-h-[38px] ${
                quickFilter === 'women'
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a] shadow-xs'
                  : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
              }`}
            >
              <span>Mujer</span>
              <span className="text-[10px] bg-[#1a1a1a]/10 px-1.5 py-0.5 font-bold">
                {categoryCounts.women}
              </span>
            </button>

            {/* Unisex */}
            <button
              onClick={() => handleQuickFilterClick('unisex')}
              className={`text-xs px-3.5 py-2 font-semibold transition-all border flex items-center gap-1.5 min-h-[38px] ${
                quickFilter === 'unisex'
                  ? 'bg-[#1a1a1a] text-[#c5a059] border-[#1a1a1a] shadow-xs'
                  : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
              }`}
            >
              <span>Unisex</span>
              <span className="text-[10px] bg-[#1a1a1a]/10 px-1.5 py-0.5 font-bold">
                {categoryCounts.unisex}
              </span>
            </button>
          </div>
        </div>

        {/* BOTÓN "MÁS FILTROS" (Toggle Desplegable) */}
        <div className="pt-2 border-t border-[#1a1a1a]/10">
          <button
            onClick={() => setShowMoreFilters(prev => !prev)}
            className={`w-full py-2.5 px-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-between border transition-all min-h-[42px] ${
              showMoreFilters || hasActiveAdvancedFilters
                ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a]'
                : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
            }`}
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Más filtros</span>
              {hasActiveAdvancedFilters && (
                <span className="bg-[#c5a059] text-[#1a1a1a] text-[9px] font-bold px-1.5 py-0.2">
                  Filtros activos
                </span>
              )}
            </div>
            {showMoreFilters ? (
              <ChevronUp className="w-4 h-4 text-[#c5a059]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#c5a059]" />
            )}
          </button>
        </div>

        {/* CONTENIDO DESPLEGABLE DE MÁS FILTROS */}
        {showMoreFilters && (
          <div className="space-y-4 pt-3 border-t border-[#1a1a1a]/10 animate-fade-in">
            {/* Grid for Linea & Genero */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-bold block mb-1">
                  Línea / Origen:
                </label>
                <select
                  value={selectedCategory}
                  onChange={e => {
                    setQuickFilter('custom');
                    setSelectedCategory(e.target.value);
                  }}
                  className="w-full bg-[#fcfaf7] border border-[#1a1a1a]/20 text-[#1a1a1a] text-xs py-2.5 px-3 focus:outline-none focus:border-[#1a1a1a] font-medium min-h-[40px]"
                >
                  <option value="Todas">Todas las Líneas (Diseñador + Árabe)</option>
                  <option value="Diseñador">Diseñador</option>
                  <option value="Árabe">Árabe / Exótico</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-bold block mb-1">
                  Género:
                </label>
                <select
                  value={selectedGender}
                  onChange={e => {
                    setQuickFilter('custom');
                    setSelectedGender(e.target.value);
                  }}
                  className="w-full bg-[#fcfaf7] border border-[#1a1a1a]/20 text-[#1a1a1a] text-xs py-2.5 px-3 focus:outline-none focus:border-[#1a1a1a] font-medium min-h-[40px]"
                >
                  <option value="Todos">Todos los géneros</option>
                  <option value="Masculino">Hombre / Caballero</option>
                  <option value="Femenino">Mujer / Dama</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>
            </div>

            {/* Familia Olfativa */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-bold block">
                Familia Olfativa:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {families.map((fam, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedFamily(fam)}
                    className={`text-xs px-2.5 py-1.5 border transition-all ${
                      selectedFamily === fam
                        ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a] font-semibold'
                        : 'bg-[#fcfaf7] text-[#1a1a1a] border-[#1a1a1a]/20 hover:border-[#1a1a1a]'
                    }`}
                  >
                    {fam}
                  </button>
                ))}
              </div>
            </div>

            {/* Presupuesto & Ocasión */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#1a1a1a]/10">
              <div>
                <div className="flex justify-between items-center text-xs text-[#1a1a1a] mb-1">
                  <span className="uppercase tracking-wider font-semibold text-[10px]">Presupuesto Máximo:</span>
                  <span className="text-[#c5a059] font-serif font-bold text-sm">
                    ${maxPrice.toLocaleString('es-MX')} MXN
                  </span>
                </div>
                <input
                  type="range"
                  min={500}
                  max={4000}
                  step={100}
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#1a1a1a] bg-[#fcfaf7] cursor-pointer"
                />
              </div>

              <div>
                <span className="text-[10px] text-[#c5a059] uppercase tracking-[0.2em] font-bold block mb-1">
                  Ocasión de Uso:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {occasions.map((occ, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedOccasion(occ)}
                      className={`text-[11px] px-2.5 py-1.5 border transition-all ${
                        selectedOccasion === occ
                          ? 'bg-[#1a1a1a] text-[#fcfaf7] border-[#1a1a1a] font-medium'
                          : 'bg-[#fcfaf7] text-[#1a1a1a]/70 border-[#1a1a1a]/20 hover:text-[#1a1a1a]'
                      }`}
                    >
                      {occ}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="pt-2 border-t border-[#1a1a1a]/10 flex items-center justify-between flex-wrap gap-2">
              <span className="text-[10px] text-[#888] uppercase tracking-wider font-semibold">
                Ordenar catálogo por:
              </span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  onClick={() => setSortBy('default')}
                  className={`px-2.5 py-1 border text-[11px] ${
                    sortBy === 'default' ? 'bg-[#1a1a1a] text-[#fcfaf7]' : 'bg-[#fcfaf7] text-[#1a1a1a]'
                  }`}
                >
                  Destacados
                </button>
                <button
                  onClick={() => setSortBy('priceAsc')}
                  className={`px-2.5 py-1 border text-[11px] ${
                    sortBy === 'priceAsc' ? 'bg-[#1a1a1a] text-[#fcfaf7]' : 'bg-[#fcfaf7] text-[#1a1a1a]'
                  }`}
                >
                  Menor precio
                </button>
                <button
                  onClick={() => setSortBy('priceDesc')}
                  className={`px-2.5 py-1 border text-[11px] ${
                    sortBy === 'priceDesc' ? 'bg-[#1a1a1a] text-[#fcfaf7]' : 'bg-[#fcfaf7] text-[#1a1a1a]'
                  }`}
                >
                  Mayor precio
                </button>
                <button
                  onClick={() => setSortBy('value')}
                  className={`px-2.5 py-1 border text-[11px] ${
                    sortBy === 'value' ? 'bg-[#1a1a1a] text-[#fcfaf7]' : 'bg-[#fcfaf7] text-[#1a1a1a]'
                  }`}
                >
                  Calidad-precio
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. CATÁLOGO MOBILE-FIRST (1 tarjeta por fila en celular, limpia, jerárquica) */}
      <div ref={catalogRef} id="catalog-section" className="scroll-mt-6">
        {filteredPerfumes.length === 0 ? (
          <div className="text-center py-12 bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 space-y-3">
            <p className="text-[#555] text-sm italic font-serif">
              No se encontraron fragancias con los filtros seleccionados.
            </p>
            <button
              onClick={handleResetFilters}
              className="text-xs bg-[#1a1a1a] text-[#c5a059] hover:bg-[#333] font-bold uppercase tracking-widest px-5 py-3 border border-[#c5a059]/30 transition-colors"
            >
              Ver Todo el Catálogo
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {visiblePerfumes.map(perfume => (
                <PerfumeCardItem
                  key={perfume.id}
                  perfume={perfume}
                  isSaved={savedPerfumeIds.includes(perfume.id)}
                  onToggleSave={onToggleSave}
                  onOpenDetail={onOpenDetail}
                  onConsultGiobot={onConsultGiobot}
                  likeCount={likeCounts[perfume.id] || 0}
                  isPublicLiked={userLikedIds.has(perfume.id)}
                  onToggleLike={handleToggleLike}
                  onAddLike={handleAddLike}
                />
              ))}
            </div>

            {/* Progressive Loading / Load More Controls */}
            {visibleCount < filteredPerfumes.length && (
              <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-5 text-center space-y-3 shadow-xs mt-6">
                <div className="text-xs text-[#555] font-light">
                  Mostrando <span className="font-bold text-[#1a1a1a] font-serif">{visiblePerfumes.length}</span> de{' '}
                  <span className="font-bold text-[#1a1a1a] font-serif">{filteredPerfumes.length}</span> fragancias disponibles
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
                  <button
                    onClick={() => setVisibleCount(prev => Math.min(prev + PAGE_INCREMENT, filteredPerfumes.length))}
                    className="w-full sm:w-auto px-6 py-3 bg-[#1a1a1a] hover:bg-[#2a2a2e] text-[#c5a059] border border-[#c5a059]/60 text-xs font-bold uppercase tracking-wider transition-all shadow-xs min-h-[44px]"
                  >
                    Mostrar más fragancias (+{Math.min(PAGE_INCREMENT, filteredPerfumes.length - visibleCount)})
                  </button>
                  <button
                    onClick={() => setVisibleCount(filteredPerfumes.length)}
                    className="w-full sm:w-auto px-4 py-3 bg-[#fcfaf7] hover:bg-[#f0ebe1] text-[#1a1a1a] border border-[#1a1a1a]/20 text-xs font-semibold uppercase tracking-wider transition-colors min-h-[44px]"
                  >
                    Ver todas ({filteredPerfumes.length})
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};


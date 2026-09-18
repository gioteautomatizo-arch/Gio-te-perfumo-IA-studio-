import React, { useEffect } from 'react';
import { Bot, MessageCircle, X } from 'lucide-react';
import { GiobotChat } from './GiobotChat';
import { Perfume } from '../types';
import giobotAvatarWebp from '../../Giobot Sommelier.webp';

interface FloatingGiobotProps {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onOpenDetail: (perfume: Perfume) => void;
  onToggleSave: (perfume: Perfume) => void;
  savedPerfumeIds: string[];
  onStartQuiz: () => void;
  initialQuery?: string;
  initialQueryKey: number;
}

export const FloatingGiobot: React.FC<FloatingGiobotProps> = ({
  isOpen,
  onOpen,
  onClose,
  onOpenDetail,
  onToggleSave,
  savedPerfumeIds,
  onStartQuiz,
  initialQuery,
  initialQueryKey,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={onOpen}
          aria-label="Abrir Giobot Sommelier"
          className="fixed z-50 right-4 sm:right-6 bottom-[max(1rem,env(safe-area-inset-bottom))] group flex items-center gap-2 rounded-full bg-[#1a1a1a] text-[#fcfaf7] border border-[#c5a059] p-1.5 pr-3 shadow-[0_10px_35px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 transition-all"
        >
          <span className="relative w-12 h-12 rounded-full overflow-hidden border border-[#c5a059] bg-[#141418]">
            <img src={giobotAvatarWebp} alt="" className="w-full h-full object-cover scale-[1.4] origin-[50%_22%]" />
            <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#1a1a1a]" />
          </span>
          <span className="hidden xs:block text-left leading-tight">
            <span className="block text-[10px] uppercase tracking-widest text-[#c5a059] font-bold">Pregunta a</span>
            <span className="block text-sm font-serif italic font-bold">Giobot</span>
          </span>
          <MessageCircle className="w-4 h-4 text-[#c5a059]" />
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label="Chat con Giobot Sommelier">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar Giobot"
            className="absolute inset-0 w-full h-full bg-black/55 backdrop-blur-[2px]"
          />
          <section className="absolute inset-x-0 bottom-0 h-[88dvh] max-h-[920px] rounded-t-[1.5rem] bg-[#fcfaf7] dark:bg-[#0b0b0d] border-t border-[#c5a059]/50 shadow-2xl overflow-hidden sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[min(520px,calc(100vw-2.5rem))] sm:h-[min(820px,calc(100dvh-2.5rem))] sm:rounded-[1.25rem] sm:border animate-fade-in pb-[env(safe-area-inset-bottom)]">
            <div className="absolute top-3 right-3 z-20">
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar chat"
                className="w-10 h-10 rounded-full border border-[#1a1a1a]/20 dark:border-[#c5a059]/30 bg-[#fcfaf7]/95 dark:bg-[#141418]/95 text-[#1a1a1a] dark:text-[#f4f4f5] flex items-center justify-center shadow-sm hover:border-[#c5a059] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <GiobotChat
              compact
              onOpenDetail={onOpenDetail}
              onToggleSave={onToggleSave}
              savedPerfumeIds={savedPerfumeIds}
              onStartQuiz={onStartQuiz}
              initialQuery={initialQuery}
              initialQueryKey={initialQueryKey}
            />
          </section>
        </div>
      )}
    </>
  );
};

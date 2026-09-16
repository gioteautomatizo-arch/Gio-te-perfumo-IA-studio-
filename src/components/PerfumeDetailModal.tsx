import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ShieldCheck,
  Heart,
  Clock,
  Wind,
  DollarSign,
  Tag,
  Smile,
  Zap,
  Layers,
  Gauge,
  Calendar,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowLeftRight,
  Star,
} from 'lucide-react';
import { Perfume, CompatibilityResult } from '../types';
import { PerfumeImage } from './PerfumeImage';

interface PerfumeDetailModalProps {
  perfume: Perfume | null;
  compatibility?: CompatibilityResult | null;
  onClose: () => void;
  onToggleSave: (perfume: Perfume) => void;
  isSaved: boolean;
  onAskGiobotAbout: (perfume: Perfume) => void;
}

export const PerfumeDetailModal: React.FC<PerfumeDetailModalProps> = ({
  perfume,
  compatibility,
  onClose,
  onToggleSave,
  isSaved,
  onAskGiobotAbout,
}) => {
  const [mobileOccasionsOpen, setMobileOccasionsOpen] = useState<{
    ideal: boolean;
    possible: boolean;
    notRecommended: boolean;
  }>({
    ideal: true,
    possible: true,
    notRecommended: true,
  });

  const [mobileSectionsOpen, setMobileSectionsOpen] = useState<{
    personality: boolean;
    emotional: boolean;
    strengths: boolean;
    aspects: boolean;
  }>({
    personality: false,
    emotional: false,
    strengths: false,
    aspects: false,
  });

  if (!perfume) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1a1a]/80 backdrop-blur-sm overflow-y-auto animate-fade-in text-[#1a1a1a] dark:text-[#f4f4f5]">
      <div className="relative w-full max-w-3xl bg-[#fcfaf7] dark:bg-[#101014] border border-[#1a1a1a]/20 dark:border-[#c5a059]/35 shadow-2xl overflow-hidden my-8">
        {/* Header Banner */}
        <div className="relative bg-[#1a1a1a] overflow-hidden border-b border-[#c5a059]/30">
          <div className="w-full max-h-72 sm:max-h-80 aspect-square sm:aspect-auto flex items-center justify-center p-4 bg-[#141416]">
            <PerfumeImage
              perfumeId={perfume.id}
              alt={perfume.name}
              className="w-full h-full max-h-72 object-contain object-center"
            />
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-[#fcfaf7] dark:bg-[#1f1f24] text-[#1a1a1a] dark:text-[#f4f4f5] hover:bg-[#c5a059] hover:text-[#1a1a1a] transition-colors border border-[#1a1a1a] dark:border-[#c5a059]/40 z-10 shadow-md"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Save & Compatibility Badge */}
          <div className="bg-[#1a1a1a] p-4 sm:p-5 flex flex-wrap items-end justify-between gap-4 border-t border-[#1a1a1a]/30">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="bg-[#c5a059] text-[#1a1a1a] text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5">
                  {perfume.brand}
                </span>
                <span className="bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#f4f4f5] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  {perfume.concentration}
                </span>
                <span className="bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#f4f4f5] border border-[#c5a059] text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#c5a059]" />
                  Original
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#fcfaf7]">
                {perfume.name}
              </h2>
            </div>

            {compatibility && (
              <div className="bg-[#c5a059] text-[#1a1a1a] px-3 py-1.5 font-bold text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5 shrink-0">
                <Sparkles className="w-4 h-4 fill-[#1a1a1a]" />
                <span>{compatibility.compatibilityScore}% Compatible</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[calc(80vh-12rem)] overflow-y-auto no-scrollbar">
          {/* Price & Primary Details */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-[#f5f0e8] dark:bg-[#16161a] p-4 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#555] dark:text-[#a1a1aa] font-semibold">Precio estimado</span>
              <div className="text-2xl font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa] flex items-baseline gap-1">
                ${perfume.priceMXN.toLocaleString('es-MX')}
                <span className="text-xs text-[#555] dark:text-[#a1a1aa] font-normal font-sans">MXN</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs text-[#1a1a1a] dark:text-[#e4e4e7]">
              <div>
                <span className="text-[#555] dark:text-[#a1a1aa] block font-semibold uppercase text-[10px]">Familia</span>
                <span className="font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">{perfume.family}</span>
              </div>
              <div className="h-8 w-px bg-[#1a1a1a]/15 dark:bg-[#c5a059]/25" />
              <div>
                <span className="text-[#555] dark:text-[#a1a1aa] block font-semibold uppercase text-[10px]">Origen</span>
                <span className="font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">{perfume.country} ({perfume.year})</span>
              </div>
              <div className="h-8 w-px bg-[#1a1a1a]/15 dark:bg-[#c5a059]/25" />
              <div>
                <span className="text-[#555] dark:text-[#a1a1aa] block font-semibold uppercase text-[10px]">Calidad-Precio</span>
                <span className="font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">{perfume.valueForMoney}/10</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#333] dark:text-[#d4d4d8] text-sm leading-relaxed font-light">
            {perfume.description}
          </p>

          {/* Why Giobot Recommends (if compatibility) */}
          {compatibility && (
            <div className="bg-[#f5f0e8] dark:bg-[#16161a] border border-[#c5a059] p-4 space-y-2">
              <div className="flex items-center gap-2 text-[#1a1a1a] dark:text-[#f4f4f5] font-serif italic font-bold text-sm">
                <Sparkles className="w-4 h-4 text-[#c5a059]" />
                <span>¿Por qué te lo recomienda Giobot?</span>
              </div>
              <p className="text-xs text-[#333] dark:text-[#d4d4d8] leading-relaxed">
                {compatibility.whyGiobotRecommends}
              </p>
              {compatibility.matchReasons.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {compatibility.matchReasons.map((reason, i) => (
                    <span
                      key={i}
                      className="text-[11px] bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#e4e4e7] border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 px-2 py-0.5"
                    >
                      ✓ {reason}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Olfactory Pyramid */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#c5a059]" />
              Pirámide Olfativa
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Salida */}
              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3.5 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25">
                <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider block mb-1">
                  Salida (15-30 min)
                </span>
                <div className="flex flex-wrap gap-1">
                  {perfume.topNotes.map((note, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#e4e4e7] px-2 py-0.5 border border-[#1a1a1a]/10 dark:border-[#c5a059]/25 font-serif italic"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Corazón */}
              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3.5 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25">
                <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider block mb-1">
                  Corazón (2-4 hrs)
                </span>
                <div className="flex flex-wrap gap-1">
                  {perfume.heartNotes.map((note, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#e4e4e7] px-2 py-0.5 border border-[#1a1a1a]/10 dark:border-[#c5a059]/25 font-serif italic"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fondo */}
              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3.5 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25">
                <span className="text-[10px] uppercase font-bold text-[#c5a059] tracking-wider block mb-1">
                  Fondo (Fijación)
                </span>
                <div className="flex flex-wrap gap-1">
                  {perfume.baseNotes.map((note, i) => (
                    <span
                      key={i}
                      className="text-xs bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#e4e4e7] px-2 py-0.5 border border-[#1a1a1a]/10 dark:border-[#c5a059]/25 font-serif italic"
                    >
                      {note}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 1. ACORDES PRINCIPALES */}
          {perfume.mainAccords && perfume.mainAccords.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#c5a059]" />
                Acordes Principales
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {perfume.mainAccords.map((accord, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#f5f0e8] dark:bg-[#1c1c21] text-[#1a1a1a] dark:text-[#e4e4e7] px-2.5 py-1 border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 font-serif italic shadow-2xs hover:border-[#c5a059] transition-colors"
                  >
                    {accord}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 2. RENDIMIENTO */}
          <div className="space-y-2.5">
            <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#c5a059]" />
              Rendimiento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#555] dark:text-[#a1a1aa] block uppercase font-semibold">Duración</span>
                  <span className="text-xs font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">{perfume.duration}</span>
                </div>
              </div>

              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 flex items-start gap-2.5">
                <Wind className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#555] dark:text-[#a1a1aa] block uppercase font-semibold">Proyección</span>
                  <span className="text-xs font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa] leading-tight block">{perfume.projection}</span>
                </div>
              </div>

              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#555] dark:text-[#a1a1aa] block uppercase font-semibold">Estela</span>
                  <span className="text-xs font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">{perfume.sillage}</span>
                </div>
              </div>

              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-3 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 flex items-start gap-2.5">
                <Gauge className="w-4 h-4 text-[#c5a059] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] text-[#555] dark:text-[#a1a1aa] block uppercase font-semibold">Versatilidad</span>
                  <span className="text-xs font-serif italic font-bold text-[#1a1a1a] dark:text-[#fafafa]">{perfume.versatility}/10</span>
                </div>
              </div>
            </div>

            {/* Breve nota de rendimiento */}
            <p className="text-[11px] text-[#555] dark:text-[#d4d4d8] italic font-serif bg-[#f5f0e8]/60 dark:bg-[#18181c] px-3 py-1.5 border-l-2 border-[#c5a059] border-y border-r border-[#1a1a1a]/10 dark:border-[#c5a059]/25">
              “El rendimiento puede variar según piel, clima y cantidad aplicada.”
            </p>
          </div>

          {/* 3. OCASIONES DE USO */}
          <div className="space-y-2.5">
            <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#c5a059]" />
              Ocasiones de Uso
            </h3>

            {perfume.occasionsIdeal || perfume.occasionsPossible || perfume.occasionsNotRecommended ? (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Ideal para */}
                {perfume.occasionsIdeal && perfume.occasionsIdeal.length > 0 && (
                  <div className="bg-[#f5f0e8] dark:bg-[#141d18] border border-emerald-800/25 dark:border-emerald-700/40 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileOccasionsOpen(prev => ({ ...prev, ideal: !prev.ideal }))}
                      className="w-full p-3 flex items-center justify-between text-left sm:cursor-default"
                    >
                      <span className="text-xs uppercase font-bold text-emerald-900 dark:text-emerald-400 tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                        Ideal para
                      </span>
                      <span className="sm:hidden text-emerald-800 dark:text-emerald-400">
                        {mobileOccasionsOpen.ideal ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    <div className={`p-3 pt-0 sm:block ${mobileOccasionsOpen.ideal ? 'block' : 'hidden sm:block'}`}>
                      <ul className="text-xs text-[#222] dark:text-[#e4e4e7] space-y-1.5 font-serif italic">
                        {perfume.occasionsIdeal.map((occ, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400 shrink-0" />
                            <span>{occ}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* También funciona */}
                {perfume.occasionsPossible && perfume.occasionsPossible.length > 0 && (
                  <div className="bg-[#f5f0e8] dark:bg-[#1a1813] border border-[#c5a059]/40 dark:border-[#c5a059]/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileOccasionsOpen(prev => ({ ...prev, possible: !prev.possible }))}
                      className="w-full p-3 flex items-center justify-between text-left sm:cursor-default"
                    >
                      <span className="text-xs uppercase font-bold text-[#8a6d2b] dark:text-[#e2be75] tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                        También funciona
                      </span>
                      <span className="sm:hidden text-[#8a6d2b] dark:text-[#e2be75]">
                        {mobileOccasionsOpen.possible ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    <div className={`p-3 pt-0 sm:block ${mobileOccasionsOpen.possible ? 'block' : 'hidden sm:block'}`}>
                      <ul className="text-xs text-[#222] dark:text-[#e4e4e7] space-y-1.5 font-serif italic">
                        {perfume.occasionsPossible.map((occ, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shrink-0" />
                            <span>{occ}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* Menos recomendable */}
                {perfume.occasionsNotRecommended && perfume.occasionsNotRecommended.length > 0 && (
                  <div className="bg-[#f5f0e8] dark:bg-[#1a191a] border border-stone-400/40 dark:border-stone-600/50 overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setMobileOccasionsOpen(prev => ({ ...prev, notRecommended: !prev.notRecommended }))}
                      className="w-full p-3 flex items-center justify-between text-left sm:cursor-default"
                    >
                      <span className="text-xs uppercase font-bold text-stone-700 dark:text-stone-300 tracking-wider flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-stone-500 dark:text-stone-400 shrink-0" />
                        Menos recomendable
                      </span>
                      <span className="sm:hidden text-stone-600 dark:text-stone-400">
                        {mobileOccasionsOpen.notRecommended ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </span>
                    </button>
                    <div className={`p-3 pt-0 sm:block ${mobileOccasionsOpen.notRecommended ? 'block' : 'hidden sm:block'}`}>
                      <ul className="text-xs text-[#555] dark:text-[#d4d4d8] space-y-1.5 font-serif italic">
                        {perfume.occasionsNotRecommended.map((occ, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-stone-400 dark:bg-stone-500 shrink-0" />
                            <span>{occ}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-4 border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 text-xs text-[#333] dark:text-[#d4d4d8] space-y-1">
                <p>
                  <strong className="text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold">Ocasiones recomendadas:</strong>{' '}
                  {perfume.recommendedOccasions.join(', ')}
                </p>
                <p>
                  <strong className="text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold">Estación ideal:</strong>{' '}
                  {perfume.bestSeason.join(', ')} ({perfume.bestTime.join(', ')})
                </p>
              </div>
            )}
          </div>

          {/* 4. PERFIL DE PERSONALIDAD */}
          <div className="bg-[#f5f0e8] dark:bg-[#16161a] border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileSectionsOpen(prev => ({ ...prev, personality: !prev.personality }))}
              className="w-full p-3.5 flex items-center justify-between text-left sm:cursor-default"
            >
              <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
                <Smile className="w-4 h-4 text-[#c5a059]" />
                <span>Perfil de Personalidad</span>
              </h3>
              <span className="sm:hidden text-[#1a1a1a] dark:text-[#f4f4f5]">
                {mobileSectionsOpen.personality ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <div className={`p-4 pt-0 sm:block ${mobileSectionsOpen.personality ? 'block' : 'hidden sm:block'}`}>
              <div className="space-y-3 text-xs text-[#222] dark:text-[#e4e4e7]">
                <p className="font-serif italic text-[#333] dark:text-[#d4d4d8]">
                  {perfume.name === '1 Million EDT' ? 'One Million' : perfume.name} suele conectar mejor con personas que:
                </p>

                {perfume.personalityPoints ? (
                  <ul className="space-y-1.5 font-serif italic text-[#1a1a1a] dark:text-[#e4e4e7]">
                    {perfume.personalityPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shrink-0 mt-1.5" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {perfume.personalityMatch.map((p, i) => (
                      <span key={i} className="text-xs bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#e4e4e7] border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 px-2.5 py-1 font-serif italic">
                        👤 {p}
                      </span>
                    ))}
                  </div>
                )}

                {perfume.lifestyleMatch && perfume.lifestyleMatch.length > 0 && (
                  <div className="pt-2.5 border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20 space-y-1.5">
                    <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#8a6d2b] dark:text-[#e2be75]">
                      Estilo de Vida
                    </h4>
                    <ul className="space-y-1.5 font-serif italic text-[#1a1a1a] dark:text-[#e4e4e7]">
                      {perfume.lifestyleMatch.map((style, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-[#c5a059] shrink-0 mt-1.5" />
                          <span>{style}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 5. PERFIL EMOCIONAL */}
          <div className="bg-[#f5f0e8] dark:bg-[#16161a] border border-[#1a1a1a]/15 dark:border-[#c5a059]/25 overflow-hidden">
            <button
              type="button"
              onClick={() => setMobileSectionsOpen(prev => ({ ...prev, emotional: !prev.emotional }))}
              className="w-full p-3.5 flex items-center justify-between text-left sm:cursor-default"
            >
              <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#c5a059]" />
                <span>Perfil Emocional</span>
              </h3>
              <span className="sm:hidden text-[#1a1a1a] dark:text-[#f4f4f5]">
                {mobileSectionsOpen.emotional ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
            </button>

            <div className={`p-4 pt-0 sm:block ${mobileSectionsOpen.emotional ? 'block' : 'hidden sm:block'}`}>
              <div className="space-y-3.5 text-xs text-[#222] dark:text-[#e4e4e7]">
                {/* Sensaciones */}
                <div className="space-y-1.5">
                  <h4 className="text-[11px] uppercase tracking-wider font-bold text-[#8a6d2b] dark:text-[#e2be75]">
                    Sensaciones
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {perfume.emotions.map((emotion, i) => (
                      <span
                        key={i}
                        className="text-xs bg-[#fcfaf7] dark:bg-[#202025] text-[#1a1a1a] dark:text-[#e4e4e7] border border-[#1a1a1a]/15 dark:border-[#c5a059]/30 px-2.5 py-1 font-serif italic shadow-2xs hover:border-[#c5a059] transition-colors"
                      >
                        ✨ {emotion}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Puede hacer sentir & Puede proyectar */}
                {(perfume.emotionsForUser || perfume.emotionsProjected) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20">
                    {perfume.emotionsForUser && (
                      <div className="bg-[#fcfaf7] dark:bg-[#1a1a1f] p-3 border border-[#1a1a1a]/10 dark:border-[#c5a059]/25 space-y-1.5">
                        <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                          Puede hacer sentir:
                        </h5>
                        <ul className="space-y-1.5 font-serif italic text-[#333] dark:text-[#d4d4d8]">
                          {perfume.emotionsForUser.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059] shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {perfume.emotionsProjected && (
                      <div className="bg-[#fcfaf7] dark:bg-[#1a1a1f] p-3 border border-[#1a1a1a]/10 dark:border-[#c5a059]/25 space-y-1.5">
                        <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#1a1a1a] dark:text-[#f4f4f5]">
                          Puede proyectar:
                        </h5>
                        <ul className="space-y-1.5 font-serif italic text-[#333] dark:text-[#d4d4d8]">
                          {perfume.emotionsProjected.map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1a1a1a] dark:bg-[#c5a059] shrink-0 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 6. FORTALEZAS */}
          {perfume.strengths && perfume.strengths.length > 0 && (
            <div className="bg-[#f5f0e8] dark:bg-[#141d18] border border-emerald-800/25 dark:border-emerald-700/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileSectionsOpen(prev => ({ ...prev, strengths: !prev.strengths }))}
                className="w-full p-3.5 flex items-center justify-between text-left sm:cursor-default"
              >
                <h3 className="text-xs uppercase tracking-widest text-emerald-950 dark:text-emerald-400 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Fortalezas</span>
                </h3>
                <span className="sm:hidden text-emerald-900 dark:text-emerald-400">
                  {mobileSectionsOpen.strengths ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              <div className={`p-4 pt-0 sm:block ${mobileSectionsOpen.strengths ? 'block' : 'hidden sm:block'}`}>
                <ul className="text-xs text-[#222] dark:text-[#e4e4e7] space-y-1.5 font-serif italic">
                  {perfume.strengths.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 dark:bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 7. ASPECTOS A CONSIDERAR */}
          {perfume.aspectsToConsider && perfume.aspectsToConsider.length > 0 && (
            <div className="bg-[#f5f0e8] dark:bg-[#1f1a14] border border-[#1a1a1a]/20 dark:border-amber-700/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setMobileSectionsOpen(prev => ({ ...prev, aspects: !prev.aspects }))}
                className="w-full p-3.5 flex items-center justify-between text-left sm:cursor-default"
              >
                <h3 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <span>Aspectos a Considerar</span>
                </h3>
                <span className="sm:hidden text-[#1a1a1a] dark:text-[#f4f4f5]">
                  {mobileSectionsOpen.aspects ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </span>
              </button>

              <div className={`p-4 pt-0 sm:block ${mobileSectionsOpen.aspects ? 'block' : 'hidden sm:block'}`}>
                <ul className="text-xs text-[#444] dark:text-[#d4d4d8] space-y-1.5 font-serif italic">
                  {perfume.aspectsToConsider.map((a, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-700 dark:bg-amber-400 shrink-0 mt-1.5" />
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* 11. ANÁLISIS DE GIOBOT */}
          {perfume.giobotAnalysis && (
            <div className="bg-[#1a1a1a] dark:bg-[#121215] text-[#fcfaf7] p-5 sm:p-6 border border-[#c5a059]/60 shadow-md space-y-3.5">
              <div className="flex items-center gap-2 text-[#c5a059] font-serif italic font-bold text-sm sm:text-base border-b border-[#c5a059]/30 pb-2">
                <Sparkles className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span className="uppercase tracking-widest text-xs sm:text-sm font-sans font-bold text-[#c5a059]">
                  Análisis de Giobot
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#e8e6e3] dark:text-[#f4f4f5] leading-relaxed whitespace-pre-line font-light font-serif italic">
                {perfume.giobotAnalysis}
              </p>
            </div>
          )}

          {/* 12. CALIFICACIÓN GIO TE PERFUMO */}
          {perfume.ratings && (
            <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-4 sm:p-5 border border-[#c5a059]/50 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1a1a1a]/10 dark:border-[#c5a059]/20 pb-2">
                <h4 className="text-xs uppercase tracking-widest text-[#1a1a1a] dark:text-[#f4f4f5] font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-[#c5a059]" />
                  <span>Calificación Gio te perfumo</span>
                </h4>
                <span className="text-[10px] text-[#8a6d2b] dark:text-[#e2be75] uppercase font-bold tracking-wider">Evaluación Técnica</span>
              </div>

              {/* Barras Horizontales Elegantes en Dorado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-xs">
                {perfume.ratings.aromaQuality !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#333] dark:text-[#d4d4d8] font-medium">Calidad del aroma</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-[#fafafa] font-mono">{perfume.ratings.aromaQuality.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a]/10 dark:bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${(perfume.ratings.aromaQuality / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {perfume.ratings.durationRating !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#333] dark:text-[#d4d4d8] font-medium">Duración</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-[#fafafa] font-mono">{perfume.ratings.durationRating.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a]/10 dark:bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${(perfume.ratings.durationRating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {perfume.ratings.projectionRating !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#333] dark:text-[#d4d4d8] font-medium">Proyección</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-[#fafafa] font-mono">{perfume.ratings.projectionRating.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a]/10 dark:bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${(perfume.ratings.projectionRating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {perfume.ratings.versatilityRating !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#333] dark:text-[#d4d4d8] font-medium">Versatilidad</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-[#fafafa] font-mono">{perfume.ratings.versatilityRating.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a]/10 dark:bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${(perfume.ratings.versatilityRating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {perfume.ratings.valueRating !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#333] dark:text-[#d4d4d8] font-medium">Relación calidad-precio</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-[#fafafa] font-mono">{perfume.ratings.valueRating.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a]/10 dark:bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${(perfume.ratings.valueRating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {perfume.ratings.originalityRating !== undefined && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-[#333] dark:text-[#d4d4d8] font-medium">Originalidad</span>
                      <span className="font-bold text-[#1a1a1a] dark:text-[#fafafa] font-mono">{perfume.ratings.originalityRating.toFixed(1)} / 10</span>
                    </div>
                    <div className="h-2 bg-[#1a1a1a]/10 dark:bg-[#27272a] overflow-hidden">
                      <div
                        className="h-full bg-[#c5a059] transition-all duration-500"
                        style={{ width: `${(perfume.ratings.originalityRating / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {perfume.ratings.verdict && (
                <div className="pt-3 border-t border-[#1a1a1a]/10 dark:border-[#c5a059]/20 space-y-1">
                  <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#8a6d2b] dark:text-[#e2be75]">
                    Veredicto de Giobot
                  </h5>
                  <p className="text-xs text-[#222] dark:text-[#f4f4f5] font-serif italic leading-relaxed">
                    "{perfume.ratings.verdict}"
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 13. COMPARAR CON GIOBOT */}
          <div className="bg-[#1a1a1a] dark:bg-[#121215] text-[#fcfaf7] p-4 sm:p-5 border border-[#c5a059]/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <h4 className="text-xs uppercase tracking-widest text-[#c5a059] font-bold flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-[#c5a059]" />
                <span>Comparar con Giobot</span>
              </h4>
              <p className="text-xs text-[#fff] dark:text-[#f4f4f5] font-serif italic leading-relaxed">
                ¿Quieres saber cómo se compara {perfume.name === '1 Million EDT' ? 'One Million' : perfume.name} con otro perfume del catálogo?
              </p>
              <p className="text-[11px] text-[#ccc] dark:text-[#a1a1aa] leading-relaxed">
                Giobot puede analizar aroma, personalidad, duración, proyección, ocasiones de uso y tipo de usuario para mostrarte sus diferencias.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onAskGiobotAbout(perfume);
              }}
              className="shrink-0 px-4 py-2.5 bg-[#c5a059] text-[#1a1a1a] hover:bg-[#d8b46d] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Comparar con Giobot</span>
            </button>
          </div>

          {/* 14. EXPERIENCIA REAL DE USO */}
          {perfume.usageExperience && (
            <div className="bg-[#f5f0e8] dark:bg-[#16161a] p-4 border border-[#1a1a1a]/20 dark:border-[#c5a059]/30 text-xs text-[#1a1a1a] dark:text-[#f4f4f5] space-y-1">
              <span className="text-[10px] uppercase text-[#c5a059] font-bold tracking-wider block mb-1">
                💬 Experiencia Real de Uso (Gio te perfumo):
              </span>
              <p className="font-serif italic leading-relaxed text-[#1a1a1a] dark:text-[#d4d4d8]">
                "{perfume.usageExperience}"
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-[#f5f0e8] dark:bg-[#141418] border-t border-[#1a1a1a]/15 dark:border-[#c5a059]/25 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => onToggleSave(perfume)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider border transition-colors ${
              isSaved
                ? 'bg-red-800 text-[#fcfaf7] border-red-900 hover:bg-red-900'
                : 'bg-[#fcfaf7] dark:bg-[#1f1f24] text-[#1a1a1a] dark:text-[#f4f4f5] border-[#1a1a1a]/30 dark:border-[#c5a059]/30 hover:bg-[#1a1a1a] hover:text-[#fcfaf7] dark:hover:bg-[#c5a059] dark:hover:text-[#111113]'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            <span>{isSaved ? 'Guardado en Favoritos' : 'Guardar en Favoritos'}</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onAskGiobotAbout(perfume);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a1a1a] dark:bg-[#0c0c0e] text-[#fcfaf7] dark:text-[#c5a059] border border-transparent dark:border-[#c5a059] hover:bg-[#c5a059] hover:text-[#1a1a1a] dark:hover:bg-[#c5a059] dark:hover:text-[#111113] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-[#c5a059]" />
            <span>Preguntar a Giobot sobre este perfume</span>
          </button>
        </div>
      </div>
    </div>
  );
};

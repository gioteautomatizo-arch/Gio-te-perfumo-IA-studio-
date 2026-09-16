import React from 'react';
import {
  Heart,
  Sparkles,
  Eye,
  Trash2,
  PieChart,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { Perfume } from '../types';
import { PerfumeImage } from './PerfumeImage';

interface SavedProfileProps {
  savedPerfumes: Perfume[];
  onOpenDetail: (perfume: Perfume) => void;
  onRemoveSave: (perfume: Perfume) => void;
  onConsultGiobot: (perfume: Perfume) => void;
  onExploreCatalog: () => void;
}

export const SavedProfile: React.FC<SavedProfileProps> = ({
  savedPerfumes,
  onOpenDetail,
  onRemoveSave,
  onConsultGiobot,
  onExploreCatalog,
}) => {
  // Calculate stats
  const totalValue = savedPerfumes.reduce((acc, p) => acc + p.priceMXN, 0);

  const familyCounts = savedPerfumes.reduce((acc, p) => {
    acc[p.family] = (acc[p.family] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 animate-fade-in text-[#1a1a1a]">
      {/* Header Banner (Editorial Style) */}
      <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 bg-[#1a1a1a] text-[#fcfaf7] px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-bold">
            <Heart className="w-3.5 h-3.5 fill-[#c5a059] text-[#c5a059]" />
            Mis Perfumes Guardados
          </div>
          <h2 className="text-2xl sm:text-4xl font-serif italic text-[#1a1a1a]">
            Tu Armario de Fragancias
          </h2>
          <p className="text-[#555] text-xs sm:text-sm font-light max-w-xl">
            Aquí tienes organizadas las fragancias que más han llamado tu atención. Giobot puede ayudarte a compararlas o aconsejarte para cuál decidirte primero.
          </p>
        </div>

        <div className="bg-[#fcfaf7] border border-[#1a1a1a]/15 p-4 text-center shrink-0 min-w-36">
          <span className="text-2xl sm:text-3xl font-serif italic font-bold text-[#1a1a1a]">
            {savedPerfumes.length}
          </span>
          <span className="text-xs text-[#555] block uppercase tracking-wider font-semibold">En Favoritos</span>
        </div>
      </div>

      {savedPerfumes.length === 0 ? (
        <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-12 text-center space-y-4 shadow-sm">
          <Heart className="w-12 h-12 text-[#1a1a1a]/30 mx-auto" />
          <h3 className="text-xl font-serif italic font-bold text-[#1a1a1a]">
            Aún no has guardado ninguna fragancia
          </h3>
          <p className="text-[#555] text-xs sm:text-sm max-w-md mx-auto font-light leading-relaxed">
            Explora nuestro catálogo original o platica con Giobot para guardar los perfumes que mejor se adapten a tu estilo.
          </p>
          <button
            onClick={onExploreCatalog}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#1a1a1a] text-[#fcfaf7] font-bold text-xs uppercase tracking-widest hover:bg-[#c5a059] hover:text-[#1a1a1a] transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>Explorar Catálogo</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile Stats Card */}
          <div className="bg-[#f5f0e8] border border-[#1a1a1a]/15 p-5 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#555] font-semibold">Valor estimado armario</span>
              <div className="text-2xl font-serif italic font-bold text-[#1a1a1a] mt-1">
                ${totalValue.toLocaleString('es-MX')} <span className="text-xs text-[#555] font-normal">MXN</span>
              </div>
            </div>

            <div className="col-span-2">
              <span className="text-xs uppercase tracking-wider text-[#555] font-semibold flex items-center gap-1.5 mb-2">
                <PieChart className="w-3.5 h-3.5 text-[#c5a059]" />
                Inclinación de tu Perfil Olfativo:
              </span>
              <div className="flex flex-wrap gap-2">
                {Object.entries(familyCounts).map(([fam, count], i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#fcfaf7] text-[#1a1a1a] border border-[#1a1a1a]/15 px-3 py-1 font-serif italic"
                  >
                    {fam}: {Math.round((Number(count) / savedPerfumes.length) * 100)}%
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Saved Perfumes List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {savedPerfumes.map(perfume => (
              <div
                key={perfume.id}
                className="bg-[#f5f0e8] border border-[#1a1a1a]/15 hover:border-[#1a1a1a] p-4 shadow-sm transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <div className="w-20 h-20 border border-[#1a1a1a]/15 shrink-0 overflow-hidden bg-[#fcfaf7] flex items-center justify-center p-1">
                    <PerfumeImage
                      perfumeId={perfume.id}
                      alt={perfume.name}
                      className="w-full h-full object-contain object-center"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[9px] bg-[#1a1a1a] text-[#fcfaf7] font-bold uppercase tracking-wider px-2 py-0.5">
                        {perfume.brand}
                      </span>
                      <span className="text-[9px] bg-[#c5a059]/20 text-[#1a1a1a] border border-[#c5a059] px-2 py-0.5 font-bold uppercase tracking-wider flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-[#c5a059]" />
                        Original
                      </span>
                    </div>

                    <h4 className="text-base font-serif italic font-bold text-[#1a1a1a] truncate">
                      {perfume.name}
                    </h4>

                    <div className="text-xs font-serif italic text-[#1a1a1a] font-bold">
                      ${perfume.priceMXN.toLocaleString('es-MX')} MXN
                    </div>

                    <div className="text-[11px] text-[#555] font-serif italic mt-1">
                      {perfume.family} • {perfume.concentration}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#1a1a1a]/10 mt-3 gap-2">
                  <button
                    onClick={() => onOpenDetail(perfume)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fcfaf7] hover:bg-[#1a1a1a] hover:text-[#fcfaf7] text-[#1a1a1a] border border-[#1a1a1a]/20 text-xs font-semibold uppercase tracking-wider transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Ver Ficha</span>
                  </button>

                  <button
                    onClick={() => onConsultGiobot(perfume)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1a] text-[#c5a059] hover:bg-[#2a2a2e] text-xs font-bold uppercase tracking-wider transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                    <span>Consultar Giobot</span>
                  </button>

                  <button
                    onClick={() => onRemoveSave(perfume)}
                    aria-label="Quitar de favoritos"
                    className="p-1.5 text-[#555] hover:text-red-700 hover:bg-red-50 border border-[#1a1a1a]/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

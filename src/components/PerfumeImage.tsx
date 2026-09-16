import React from 'react';
import { Sparkles } from 'lucide-react';
import { PERFUME_IMAGE_MAP } from '../data/perfumeImages';

interface PerfumeImageProps {
  perfumeId: string;
  alt: string;
  className?: string;
  containerClassName?: string;
  priority?: boolean;
}

export const PerfumeImage: React.FC<PerfumeImageProps> = ({
  perfumeId,
  alt,
  className = 'w-full h-full object-contain object-center',
  containerClassName = 'w-full h-full',
  priority = false,
}) => {
  const normalizedKey = perfumeId ? perfumeId.toLowerCase().trim() : '';
  const src =
    PERFUME_IMAGE_MAP[perfumeId] ||
    (normalizedKey ? PERFUME_IMAGE_MAP[normalizedKey] : undefined) ||
    PERFUME_IMAGE_MAP[normalizedKey.replace(/-/g, '_')] ||
    PERFUME_IMAGE_MAP[normalizedKey.replace(/_/g, '-')];

  if (!src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#f5f0e8] dark:bg-[#18181c] border border-[#1a1a1a]/10 dark:border-[#c5a059]/20 text-[#666] dark:text-[#a1a1aa] p-3 text-center select-none ${containerClassName}`}
      >
        <div className="w-9 h-9 rounded-full border border-[#c5a059]/40 flex items-center justify-center mb-1.5 bg-[#fcfaf7] dark:bg-[#121215]">
          <Sparkles className="w-4 h-4 text-[#c5a059]" />
        </div>
        <span className="text-[11px] font-serif italic text-[#1a1a1a] dark:text-[#f4f4f5] font-semibold">
          Imagen próximamente
        </span>
        <span className="text-[9px] uppercase tracking-[0.18em] text-[#888] dark:text-[#777] mt-0.5 font-medium">
          Gio te perfumo
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
};



import React from 'react';
import { MessageCircle, ShieldCheck, WalletCards } from 'lucide-react';
import { buildGeneralWhatsAppUrl } from '../lib/commerce';

export const CatalogCommerceBanner: React.FC = () => {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-5">
      <div className="border border-[#c5a059]/45 bg-[#1a1a1a] dark:bg-[#111113] text-[#fcfaf7] p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#c5a059]">Compra real · atención por WhatsApp</p>
            <h2 className="text-xl sm:text-2xl font-serif italic font-bold">Elige, consulta y aparta tu perfume</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#d4d4d8]">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-[#c5a059]" /> Perfumes originales</span>
              <span className="flex items-center gap-1.5"><WalletCards className="w-3.5 h-3.5 text-[#c5a059]" /> Disponibles y sobre pedido</span>
              <span>Abre la ficha del perfume para comprarlo o apartarlo.</span>
            </div>
          </div>

          <a
            href={buildGeneralWhatsAppUrl()}
            target="_blank"
            rel="noreferrer"
            className="min-h-[44px] px-5 py-3 bg-[#c5a059] text-[#111113] border border-[#c5a059] font-bold uppercase tracking-wider text-[10px] flex items-center justify-center gap-2 shrink-0"
          >
            <MessageCircle className="w-4 h-4" />
            Consultar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

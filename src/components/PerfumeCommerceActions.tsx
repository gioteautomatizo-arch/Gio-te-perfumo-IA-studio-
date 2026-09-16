import React, { useState } from 'react';
import {
  MessageCircle,
  ShoppingBag,
  FlaskConical,
  Share2,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';
import { Perfume } from '../types';
import {
  buildWhatsAppUrl,
  getStockLabel,
} from '../lib/commerce';
import {
  getEffectivePrice,
  getReservationAmounts,
  buildReservationWhatsAppUrl,
  buildConsultWhatsAppUrl,
  formatMXN,
} from '../lib/whatsappSales';

export const PerfumeCommerceActions: React.FC<{ perfume: Perfume }> = ({ perfume }) => {
  const [shareCopied, setShareCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const price = getEffectivePrice(perfume);
  const { deposit, balance } = getReservationAmounts(price);
  const reservationUrl = buildReservationWhatsAppUrl(perfume);
  const consultUrl = buildConsultWhatsAppUrl(perfume);
  const isOrder = perfume.stockStatus === 'Sobre pedido';
  const isSoldOut = perfume.stockStatus === 'Agotado';
  const hasDecant =
    perfume.decant5mlEnabled === true &&
    typeof perfume.decant5mlPriceMXN === 'number' &&
    perfume.decant5mlPriceMXN > 0;

  const bottleLabel = isSoldOut
    ? 'Consultar disponibilidad'
    : 'Apartar con 60%';

  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('perfume', perfume.id);
    const shareUrl = url.toString();
    const shareData = {
      title: `${perfume.brand} ${perfume.name} | Gio te perfumo`,
      text: `Mira la ficha de ${perfume.brand} ${perfume.name} en Gio te perfumo.`,
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
      } catch (clipboardError) {
        console.error('No se pudo compartir la ficha:', clipboardError);
      }
    }
  };

  return (
    <div className="fixed z-[60] left-1/2 -translate-x-1/2 bottom-2 w-[calc(100%-1rem)] max-w-3xl bg-[#101014]/95 backdrop-blur border border-[#c5a059]/60 shadow-2xl text-[#f4f4f5]">
      {!isExpanded ? (
        <div className="flex items-center gap-2 p-2 sm:p-2.5">
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="min-w-0 flex-1 text-left px-2 py-1.5"
            aria-label="Ver opciones de compra"
          >
            <p className="text-[9px] uppercase tracking-[0.16em] font-bold text-[#c5a059]">Compra directa</p>
            <div className="flex items-center gap-2 min-w-0">
              <p className="font-serif italic font-bold text-sm truncate">{perfume.brand} {perfume.name}</p>
              <strong className="shrink-0 text-sm">${price.toLocaleString('es-MX')}</strong>
              <ChevronUp className="w-4 h-4 shrink-0 text-[#c5a059]" />
            </div>
          </button>

          <a
            href={isSoldOut ? consultUrl : reservationUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 min-h-[42px] px-3 sm:px-4 bg-[#c5a059] text-[#111113] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#c5a059]"
          >
            {isOrder ? <ShoppingBag className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
            <span className="hidden sm:inline">{bottleLabel}</span>
            <span className="sm:hidden">{isSoldOut ? 'Consultar' : 'Apartar 60%'}</span>
          </a>
        </div>
      ) : (
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] font-bold text-[#c5a059]">Compra directa · Gio te perfumo</p>
              <p className="font-serif italic font-bold truncate">{perfume.brand} {perfume.name}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded(false)}
              className="shrink-0 w-9 h-9 border border-[#c5a059]/40 flex items-center justify-center"
              aria-label="Minimizar opciones de compra"
            >
              <ChevronDown className="w-4 h-4 text-[#c5a059]" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[10px]">
            <div className="border border-[#c5a059]/25 bg-[#18181b] px-2 py-1.5">
              <span className="block text-[#a1a1aa] uppercase tracking-wider">Precio</span>
              <strong className="text-[#f4f4f5]">${formatMXN(price)}</strong>
            </div>

            {!isSoldOut && (
              <>
                <div className="border border-[#c5a059]/25 bg-[#18181b] px-2 py-1.5">
                  <span className="block text-[#a1a1aa] uppercase tracking-wider">Anticipo 60%</span>
                  <strong className="text-[#c5a059]">${formatMXN(deposit)}</strong>
                </div>
                <div className="border border-[#c5a059]/25 bg-[#18181b] px-2 py-1.5">
                  <span className="block text-[#a1a1aa] uppercase tracking-wider">Saldo 40%</span>
                  <strong className="text-[#f4f4f5]">${formatMXN(balance)}</strong>
                </div>
              </>
            )}

            <div className="border border-[#c5a059]/25 bg-[#18181b] px-2 py-1.5 col-span-2 sm:col-span-1">
              <span className="block text-[#a1a1aa] uppercase tracking-wider">Estado</span>
              <strong className={isOrder ? 'text-[#c5a059]' : isSoldOut ? 'text-rose-300' : 'text-emerald-300'}>
                {getStockLabel(perfume)}
              </strong>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3">
            <a
              href={isSoldOut ? consultUrl : reservationUrl}
              target="_blank"
              rel="noreferrer"
              className="col-span-2 min-h-[44px] px-4 py-2.5 bg-[#c5a059] text-[#111113] text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-[#c5a059]"
            >
              {isSoldOut ? <MessageCircle className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
              {bottleLabel}
            </a>

            {!isSoldOut && (
              <a
                href={consultUrl}
                target="_blank"
                rel="noreferrer"
                className="col-span-2 min-h-[40px] px-3 py-2 bg-[#18181b] text-[#f4f4f5] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#c5a059]/50 hover:border-[#c5a059]"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                Consultar por WhatsApp
              </a>
            )}

            {hasDecant && (
              <a
                href={buildWhatsAppUrl(perfume, 'decant')}
                target="_blank"
                rel="noreferrer"
                className="min-h-[42px] px-3 py-2 bg-[#18181b] text-[#f4f4f5] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#c5a059]/50"
              >
                <FlaskConical className="w-3.5 h-3.5 text-[#c5a059]" />
                Decant 5 ml · ${perfume.decant5mlPriceMXN!.toLocaleString('es-MX')}
              </a>
            )}

            <button
              type="button"
              onClick={handleShare}
              className={`${hasDecant ? '' : 'col-span-2'} min-h-[42px] px-3 py-2 bg-[#18181b] text-[#f4f4f5] text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 border border-[#c5a059]/50 hover:border-[#c5a059] transition-colors`}
            >
              {shareCopied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Share2 className="w-3.5 h-3.5 text-[#c5a059]" />}
              {shareCopied ? 'Enlace copiado' : 'Compartir ficha'}
            </button>
          </div>

          <p className="mt-2 text-[9px] text-[#a1a1aa]">
            Confirma disponibilidad, apartado y entrega por WhatsApp antes de realizar cualquier pago.
          </p>
        </div>
      )}
    </div>
  );
};
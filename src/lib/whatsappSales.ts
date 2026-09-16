import { Perfume } from '../types';

export const WHATSAPP_SALES_NUMBER = '525522478328';

/**
 * Obtiene el precio real y efectivo del perfume.
 * Si existe una promoción activa válida, retorna promoPriceMXN; de lo contrario, priceMXN.
 */
export const getEffectivePrice = (perfume: Perfume): number => {
  if (
    perfume.promoActive === true &&
    typeof perfume.promoPriceMXN === 'number' &&
    Number.isFinite(perfume.promoPriceMXN) &&
    perfume.promoPriceMXN > 0
  ) {
    return perfume.promoPriceMXN;
  }
  return perfume.effectivePriceMXN || perfume.priceMXN;
};

/**
 * Calcula el anticipo del 60% y el saldo restante del 40%.
 * anticipo = Math.round(price * 0.60)
 * saldo = price - anticipo
 */
export const getReservationAmounts = (
  price: number
): { deposit: number; balance: number } => {
  const deposit = Math.round(price * 0.6);
  const balance = price - deposit;
  return { deposit, balance };
};

export const formatMXN = (amount: number): string => {
  return amount.toLocaleString('es-MX');
};

/**
 * Genera la URL de WhatsApp para apartar con el 60%:
 *
 * Hola, quiero apartar [MARCA] [PERFUME] en Gio te perfumo.
 *
 * Precio actual: $X MXN
 * Anticipo 60%: $X MXN
 * Saldo restante 40%: $X MXN
 *
 * ¿Me compartes los datos para realizar el apartado?
 */
export const buildReservationWhatsAppUrl = (perfume: Perfume): string => {
  const currentPrice = getEffectivePrice(perfume);
  const { deposit, balance } = getReservationAmounts(currentPrice);

  const message = [
    `Hola, quiero apartar ${perfume.brand} ${perfume.name} en Gio te perfumo.`,
    '',
    `Precio actual: $${formatMXN(currentPrice)} MXN`,
    `Anticipo 60%: $${formatMXN(deposit)} MXN`,
    `Saldo restante 40%: $${formatMXN(balance)} MXN`,
    '',
    '¿Me compartes los datos para realizar el apartado?',
  ].join('\n');

  return `https://wa.me/${WHATSAPP_SALES_NUMBER}?text=${encodeURIComponent(message)}`;
};

/**
 * Genera la URL de WhatsApp para consultar disponibilidad y dudas:
 *
 * Hola, estoy viendo [MARCA] [PERFUME] en el catálogo de Gio te perfumo.
 *
 * Precio actual: $X MXN.
 *
 * Quiero consultar disponibilidad y resolver una duda antes de comprar.
 */
export const buildConsultWhatsAppUrl = (perfume: Perfume): string => {
  const currentPrice = getEffectivePrice(perfume);

  const message = [
    `Hola, estoy viendo ${perfume.brand} ${perfume.name} en el catálogo de Gio te perfumo.`,
    '',
    `Precio actual: $${formatMXN(currentPrice)} MXN.`,
    '',
    'Quiero consultar disponibilidad y resolver una duda antes de comprar.',
  ].join('\n');

  return `https://wa.me/${WHATSAPP_SALES_NUMBER}?text=${encodeURIComponent(message)}`;
};

import { Perfume } from '../types';

export const GIO_WHATSAPP_NUMBER = '525522478328';

export const getCommercialPrice = (perfume: Perfume): number => {
  if (
    perfume.promoActive === true &&
    typeof perfume.promoPriceMXN === 'number' &&
    perfume.promoPriceMXN > 0
  ) {
    return perfume.promoPriceMXN;
  }
  return perfume.priceMXN;
};

export const getReservationDeposit = (perfume: Perfume): number => {
  const price = getCommercialPrice(perfume);
  return Math.round(price * 0.6);
};

export const getStockLabel = (perfume: Perfume): string => {
  if (perfume.stockStatus === 'Disponible') {
    if (typeof perfume.stockQuantity === 'number' && perfume.stockQuantity > 0) {
      return `Entrega disponible · ${perfume.stockQuantity} ${perfume.stockQuantity === 1 ? 'pieza' : 'piezas'}`;
    }
    return 'Entrega disponible';
  }
  if (perfume.stockStatus === 'Pocas Unidades') return 'Pocas unidades';
  if (perfume.stockStatus === 'Sobre pedido') return 'Sobre pedido';
  if (perfume.stockStatus === 'Reservado') return 'Reservado';
  if (perfume.stockStatus === 'Agotado') return 'Agotado · consultar disponibilidad';
  return perfume.stockStatus || 'Consultar disponibilidad';
};

const buildMessage = (perfume: Perfume, intent: 'bottle' | 'decant'): string => {
  const price = getCommercialPrice(perfume);
  const deposit = getReservationDeposit(perfume);
  const balance = Math.max(price - deposit, 0);

  if (intent === 'decant') {
    const decantPrice = perfume.decant5mlPriceMXN;
    return [
      'Hola Gio 👋',
      `Vi ${perfume.brand} ${perfume.name} ${perfume.concentration} en el catálogo de Gio te perfumo.`,
      'Me interesa un decant de 5 ml.',
      typeof decantPrice === 'number' && decantPrice > 0
        ? `Precio mostrado: $${decantPrice.toLocaleString('es-MX')} MXN.`
        : '¿Me confirmas el precio del decant?',
      `Estado mostrado: ${getStockLabel(perfume)}.`,
      '¿Me confirmas disponibilidad y forma de entrega?',
    ].join('\n');
  }

  const lines = [
    'Hola Gio 👋',
    `Vi ${perfume.brand} ${perfume.name} ${perfume.concentration} en el catálogo de Gio te perfumo.`,
    `Precio actual: $${price.toLocaleString('es-MX')} MXN.`,
    `Estado: ${getStockLabel(perfume)}.`,
  ];

  if (perfume.stockStatus === 'Agotado') {
    lines.push('Quiero consultar cuándo vuelve a estar disponible o si puedes conseguirlo sobre pedido.');
  } else {
    lines.push(
      `Quiero apartarlo con $${deposit.toLocaleString('es-MX')} MXN.`,
      `Saldo estimado al entregar: $${balance.toLocaleString('es-MX')} MXN.`
    );
  }

  lines.push('¿Me confirmas disponibilidad y forma de entrega?');
  return lines.join('\n');
};

export const buildWhatsAppUrl = (
  perfume: Perfume,
  intent: 'bottle' | 'decant' = 'bottle'
): string => {
  return `https://wa.me/${GIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildMessage(perfume, intent))}`;
};

export const buildGeneralWhatsAppUrl = (): string => {
  const message = [
    'Hola Gio 👋',
    'Vi el catálogo de Gio te perfumo y quiero ayuda para elegir o apartar una fragancia.',
    '¿Me puedes orientar?',
  ].join('\n');
  return `https://wa.me/${GIO_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
};
const mt = new Intl.NumberFormat('pt-PT');

export const formatPrice = (value: number): string => `${mt.format(value)} MT`;

export const parseDate = (iso: string): Date => new Date(`${iso}T00:00:00`);

export const formatLongDate = (iso: string): string =>
  new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(iso));

export const formatDay = (iso: string): string =>
  new Intl.DateTimeFormat('pt-PT', { day: '2-digit' }).format(parseDate(iso));

export const formatMonth = (iso: string): string =>
  new Intl.DateTimeFormat('pt-PT', { month: 'short' }).format(parseDate(iso)).replace('.', '');

export const formatWeekday = (iso: string): string =>
  new Intl.DateTimeFormat('pt-PT', { weekday: 'long' }).format(parseDate(iso));

export const whatsappLink = (number: string, message: string): string =>
  `https://wa.me/${number}?text=${encodeURIComponent(message)}`;

// Aceita 8X XXX XXXX, com ou sem indicativo +258 / 258
export const isValidMzPhone = (value: string): boolean =>
  /^(\+?258)?8[2-7]\d{7}$/.test(value.replace(/[\s-]/g, ''));

export const makeReservationCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = 'NE-';
  for (let i = 0; i < 6; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
};

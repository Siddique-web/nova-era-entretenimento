export type PosterVariant = 'sun' | 'stripes' | 'rings' | 'diagonal' | 'burst';

export type LotId = 'normal' | 'vip' | 'vvip';

export interface Lot {
  id: LotId;
  label: string;
  price: number; // em Meticais (MT)
  perks: string;
  remaining: number;
}

export interface EventItem {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string; // ISO yyyy-mm-dd
  time: string;
  venue: string;
  posterLines: string[];
  variant: PosterVariant;
  poster?: string; // cartaz real (em /public/posters); sem ele usa-se o cartaz SVG
  lots: Lot[];
}

export interface Chapter {
  id: string;
  period: string;
  title: string;
  paragraphs: string[];
  highlights: string[];
  photos: { caption: string; src?: string }[];
}

export interface Milestone {
  year: string;
  title: string;
  text: string;
}

export interface GalleryItem {
  id: string;
  caption: string;
  src?: string;
  className?: string;
}

export interface MerchColor {
  id: string;
  label: string;
  hex: string;
  src: string; // foto do produto nesta cor
}

export interface MerchItem {
  id: string;
  name: string;
  description: string;
  price: number;
  sizes: string[];
  tag?: string;
  src?: string;
  colors?: MerchColor[]; // se existir, o cliente escolhe a cor e a foto muda
}

export type ReservationStatus = 'pendente' | 'confirmado' | 'rejeitado';

export interface ReservationItem {
  lotId: LotId;
  label: string;
  qty: number;
  unitPrice: number;
}

export interface Reservation {
  code: string;
  eventId: string;
  eventTitle: string;
  eventCategory: string;
  eventDate: string; // ISO
  eventTime: string;
  eventVenue: string;
  poster?: string;
  items: ReservationItem[];
  total: number;
  name: string;
  phone: string;
  method: string; // método de pagamento escolhido
  proof?: string; // data URL (JPEG) do comprovativo; só vem no painel de administração
  status: ReservationStatus;
  createdAt: string; // ISO
  confirmedAt?: string;
}

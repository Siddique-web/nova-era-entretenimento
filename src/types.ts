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

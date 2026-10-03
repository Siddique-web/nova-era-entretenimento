import type { EventItem } from '../types';

// Dados simulados — substitua por eventos, datas e preços reais.
export const EVENTS: EventItem[] = [
  {
    id: 'matias-damasio',
    title: 'Matias Damásio — El Concerto',
    category: 'El Concerto',
    description:
      'A última edição de 2026 do El Concerto na Cidade da Beira, com Matias Damásio em palco. Bilhetes também à venda online no M Ticket.',
    date: '2026-11-28',
    time: 'Hora a anunciar',
    venue: 'Cidade da Beira',
    posterLines: ['MATIAS', 'DAMÁSIO'],
    variant: 'stripes',
    poster: '/posters/matias-damasio.jpg',
    lots: [{ id: 'normal', label: 'Normal', price: 800, perks: 'Promo normal, bilhete de acesso geral', remaining: 500 }],
  },
  {
    id: 'anselmo-ralph',
    title: 'Anselmo Ralph Live na Beira',
    category: 'Concerto Internacional',
    description:
      'Uma noite de românticas, kizomba e grandes êxitos com Anselmo Ralph em palco. Produção de nível internacional, som e luz de arena.',
    date: '2026-11-14',
    time: '20:00',
    venue: 'Estádio do Ferroviário da Beira',
    posterLines: ['ANSELMO', 'RALPH'],
    variant: 'burst',
    poster: '/posters/anselmo-ralph.jpg',
    lots: [
      { id: 'normal', label: 'Normal', price: 800, perks: 'Acesso à plateia geral', remaining: 420 },
      { id: 'vip', label: 'VIP', price: 2500, perks: 'Zona VIP, bar exclusivo e entrada rápida', remaining: 96 },
      { id: 'vvip', label: 'VVIP', price: 6000, perks: 'Mesa reservada, open bar e fila de honra', remaining: 18 },
    ],
  },
  {
    id: 'the-music-set',
    title: 'The Music Set',
    category: 'Festival',
    description:
      'Um dia inteiro de música ao vivo, DJs e artistas convidados num palco único. A banda sonora da cidade, do pôr do sol ao amanhecer.',
    date: '2026-12-05',
    time: '16:00',
    venue: 'Nova Era Arena',
    posterLines: ['THE', 'MUSIC', 'SET'],
    variant: 'rings',
    poster: '/posters/the-music-set.jpg',
    lots: [
      { id: 'normal', label: 'Normal', price: 500, perks: 'Acesso geral ao festival', remaining: 700 },
      { id: 'vip', label: 'VIP', price: 1800, perks: 'Zona VIP com vista de palco', remaining: 140 },
      { id: 'vvip', label: 'VVIP', price: 4500, perks: 'Camarote, bar premium e backstage lounge', remaining: 30 },
    ],
  },
  {
    id: 'sol-beach',
    title: 'S.O.L Beach Experience',
    category: 'Festival de Praia',
    description:
      'Sol, mar e música na Praia do Macuti. Palco à beira-mar, DJs, gastronomia e a energia de uma geração inteira reunida.',
    date: '2026-12-27',
    time: '14:00',
    venue: 'Praia do Macuti',
    posterLines: ['S.O.L', 'BEACH', 'EXPERIENCE'],
    variant: 'sun',
    poster: '/posters/sol-beach.jpg',
    lots: [
      { id: 'normal', label: 'Normal', price: 600, perks: 'Acesso à praia e ao palco principal', remaining: 650 },
      { id: 'vip', label: 'VIP', price: 2000, perks: 'Deck VIP, espreguiçadeiras e bar', remaining: 110 },
      { id: 'vvip', label: 'VVIP', price: 5000, perks: 'Cabana privada, serviço de mesa e open bar', remaining: 24 },
    ],
  },
  {
    id: 'noite-kizomba',
    title: 'Noite de Kizomba & Semba',
    category: 'Concerto',
    description:
      'A pista a ferver com os melhores nomes da kizomba e do semba. Dança, emoção e boa companhia numa noite para toda a cidade.',
    date: '2027-01-23',
    time: '21:00',
    venue: 'Nova Era Arena',
    posterLines: ['NOITE DE', 'KIZOMBA', '& SEMBA'],
    variant: 'diagonal',
    lots: [
      { id: 'normal', label: 'Normal', price: 400, perks: 'Acesso à pista', remaining: 500 },
      { id: 'vip', label: 'VIP', price: 1500, perks: 'Mesa partilhada e bar VIP', remaining: 80 },
      { id: 'vvip', label: 'VVIP', price: 3500, perks: 'Mesa privada e garrafa de boas-vindas', remaining: 16 },
    ],
  },
  {
    id: 'afro-night',
    title: 'Afro Night Beira',
    category: 'Festival',
    description:
      'Afrobeats, amapiano e hip-hop numa só noite. Os sons que movem África, com line-up de artistas nacionais e convidados.',
    date: '2027-02-14',
    time: '19:00',
    venue: 'Estádio do Ferroviário da Beira',
    posterLines: ['AFRO', 'NIGHT'],
    variant: 'stripes',
    lots: [
      { id: 'normal', label: 'Normal', price: 500, perks: 'Acesso geral', remaining: 800 },
      { id: 'vip', label: 'VIP', price: 1700, perks: 'Zona VIP e bar exclusivo', remaining: 120 },
      { id: 'vvip', label: 'VVIP', price: 4000, perks: 'Camarote com serviço de mesa', remaining: 22 },
    ],
  },
];

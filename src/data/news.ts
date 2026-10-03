export interface NewsImage {
  src: string;
  alt: string;
}

export interface NewsItem {
  id: string;
  tag: string;
  publishedAt: string; // data de publicação (aaaa-mm-dd): só serve para ordenar, a mais recente aparece primeiro
  date: string; // data ou local mostrado no artigo
  title: string;
  excerpt: string;
  images: NewsImage[]; // mostradas por inteiro, sem corte
  eventId?: string; // se existir, mostra o botão de reserva desse evento
}

// Notícias com base nos cartazes e fotos oficiais (/public/posters e /public/news).
const RAW_NEWS: NewsItem[] = [
  {
    id: 'verao-africano',
    publishedAt: '2026-09-27',
    tag: 'Evento',
    date: '27 de setembro · 18H · Casa dos Bicos',
    title: 'O Verão Africano: The Voice On junta Cef Tanzy e Landrick na Casa dos Bicos',
    excerpt:
      'A Nova Era levou O Verão Africano à Cidade da Beira, às 18 horas, na Casa dos Bicos, com Cef Tanzy e Landrick e a participação especial de Djakas. Na 1.ª fase, os bilhetes custaram 1000 MT (Normal) e 2500 MT (VIP); na 2.ª fase, 1500 MT e 3000 MT. Venda no mticket.co.mz, 2+1 e Vodacom da Manga.',
    images: [
      { src: '/posters/verao-africano-the-voice-on.jpg', alt: 'Cartaz O Verão Africano, The Voice On, com Cef Tanzy, Landrick e Djakas, 27 de setembro' },
      { src: '/gallery/recepcao-aeroporto.jpg', alt: 'Recepção de artistas com flores e champanhe no Aeroporto Internacional da Beira' },
    ],
  },
  {
    id: 'matias-damasio',
    publishedAt: '2026-10-03',
    tag: 'Anúncio',
    date: '28 de novembro de 2026',
    title: 'Matias Damásio traz a última edição de 2026 do El Concerto à Beira',
    excerpt:
      'O El Concerto fecha o ano com Matias Damásio, no sábado, 28 de novembro, na Cidade da Beira. Os bilhetes já estão à venda online no M Ticket, em promoção normal a 800 MT. Uma produção Nova Era com a Mosaik Live Communication.',
    images: [{ src: '/posters/matias-damasio.jpg', alt: 'Cartaz do El Concerto com Matias Damásio, 28 de novembro' }],
    eventId: 'matias-damasio',
  },
  {
    id: 'grooveland',
    publishedAt: '2026-10-01',
    tag: 'Bilheteira',
    date: 'Mesas à venda',
    title: 'Grooveland · The Music Set: mesas VIP e VVIP já têm preços',
    excerpt:
      'A Triple Vision Gold e a Nova Era apresentam o Grooveland. As mesas VIP custam de 14 000 MT (mesa de 4) a 35 000 MT (mesa de 10) e as VVIP de 20 000 MT a 50 000 MT, com consumíveis e bilhetes incluídos. As reservas fazem-se pelos contactos indicados no cartaz.',
    images: [{ src: '/posters/grooveland.jpg', alt: 'Cartaz Grooveland The Music Set com a tabela de mesas VIP e VVIP' }],
  },
  {
    id: 'chegada-aeroporto',
    publishedAt: '2026-09-20',
    tag: 'Reportagem',
    date: 'Aeroporto Internacional da Beira',
    title: 'Imprensa recebe artista à chegada ao Aeroporto Internacional da Beira',
    excerpt:
      'Câmaras e microfones de vários órgãos de comunicação aguardavam o artista à porta do Aeroporto Internacional da Beira, acompanhado por elementos de segurança.',
    images: [
      { src: '/news/chegada-aeroporto-imprensa.jpg', alt: 'Artista a falar à imprensa à porta do Aeroporto Internacional da Beira' },
      { src: '/news/chegada-aeroporto-corredor.jpg', alt: 'Artista a caminhar no terminal do aeroporto, rodeado pela equipa' },
    ],
  },
  {
    id: 'prm-sofala',
    publishedAt: '2026-09-10',
    tag: 'Institucional',
    date: 'Comando Provincial · Sofala',
    title: 'Nova Era visita o Comando Provincial da PRM em Sofala',
    excerpt:
      'Representantes da Nova Era, de colete da marca, posaram com oficiais do Comando Provincial da Polícia da República de Moçambique em Sofala.',
    images: [{ src: '/news/prm-sofala.jpg', alt: 'Equipa da Nova Era com oficiais da PRM em frente ao Comando Provincial de Sofala' }],
  },
  {
    id: 'watch-session',
    publishedAt: '2026-07-19',
    tag: 'Evento',
    date: '19 de julho · 14:30',
    title: 'Watch Session da final: «Somos de quem ganha 2Gueda» no Clube de Golfe da Beira',
    excerpt:
      'A 2M levou a Watch Session da final ao Clube de Golfe da Beira, a 19 de julho, às 14:30, com a Nova Era. Os bilhetes estavam disponíveis em compmoz.co.mz e a entrada era só para maiores de 18 anos.',
    images: [{ src: '/posters/watch-session-2gueda.jpg', alt: 'Cartaz da Watch Session da final, 19 de julho, Clube de Golfe da Beira' }],
  },
  {
    id: 'anna-joyce',
    publishedAt: '2026-08-28',
    tag: 'El Concerto',
    date: '28 de agosto de 2026',
    title: 'Anna Joyce lidera o cartaz do El Concerto, com artistas locais e DJs',
    excerpt:
      'O cartaz de 28 de agosto, no Campo da Escola Samora M. Machel, às 15H, juntou Anna Joyce a Edmazia Mayembe, Filomena Maricoa, Hot Blaze, Hélio Beatz, Kamane e Jay Arghh, com artistas locais e DJs convidados.',
    images: [{ src: '/news/anna-joyce-palco.jpg', alt: 'Anna Joyce em concerto, com o nome no ecrã de palco' }],
  },
];

// A notícia publicada mais recentemente fica sempre em primeiro (hero e secção Notícias).
export const NEWS: NewsItem[] = [...RAW_NEWS].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));

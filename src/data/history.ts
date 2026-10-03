import type { Chapter, Milestone } from '../types';

// Textos e marcos simulados — ajuste com a história oficial da marca.
export const CHAPTERS: Chapter[] = [
  {
    id: 'origens',
    period: '2006 — 2012',
    title: 'As origens e os primeiros passos na Beira',
    paragraphs: [
      'A Nova Era nasceu de uma ideia simples: a Beira merecia noites à altura do seu talento. Com pouco equipamento, muita vontade e uma equipa de amigos, começámos por organizar pequenos espetáculos em salões e pátios da cidade.',
      'Cada evento era feito à mão: cartazes colados de bairro em bairro, bilhetes entregues em mão e um palco montado na véspera. Foi assim que aprendemos o valor de cumprir o horário, respeitar o público e deixar a casa cheia.',
    ],
    highlights: ['Primeiros espetáculos em salões da Beira', 'Equipa fundadora de poucas pessoas', 'Bilhetes vendidos de mão em mão'],
    photos: [
      { caption: 'Arquivo: primeiro palco montado na cidade' },
      { caption: 'Arquivo: cartaz original colado nos bairros' },
    ],
  },
  {
    id: 'evolucao',
    period: '2013 — 2019',
    title: 'Dos salões aos grandes concertos e festivais de praia',
    paragraphs: [
      'Com a confiança do público, o palco cresceu. Chegaram os primeiros artistas internacionais, os festivais de praia e as produções com som, luz e estruturas de grande escala, sempre com equipas locais a bordo.',
      'A Nova Era passou a ser sinónimo de grandes noites na Beira. Criámos pontos de venda autorizados, uma operação de segurança própria e um padrão de recepção a artistas que se tornou a nossa assinatura.',
    ],
    highlights: ['Primeiros concertos internacionais', 'Festivais de praia com milhares de pessoas', 'Rede de pontos de venda autorizados'],
    photos: [
      { caption: 'Arquivo: festival de praia, palco ao pôr do sol' },
      { caption: 'Arquivo: chegada de artistas internacionais' },
    ],
  },
  {
    id: 'compromisso',
    period: '2020 — hoje',
    title: 'Compromisso com a cultura e as gerações futuras',
    paragraphs: [
      'Vinte anos depois, a missão mantém-se: levar entretenimento de qualidade à Beira e abrir espaço para quem vem a seguir. Damos palco a artistas locais, formamos jovens técnicos de som, luz e produção e apoiamos iniciativas culturais da cidade.',
      'A Nova Era é hoje uma marca de várias gerações: quem veio ao primeiro espetáculo traz agora os filhos. É por eles, e pelos que ainda não nasceram, que continuamos a construir a próxima noite.',
    ],
    highlights: ['Palco para artistas locais', 'Formação de jovens técnicos de produção', 'Apoio a iniciativas culturais da cidade'],
    photos: [
      { caption: 'Arquivo: equipa de produção em formação' },
      { caption: 'Arquivo: público de várias gerações' },
    ],
  },
];

export const MILESTONES: Milestone[] = [
  { year: '2006', title: 'Nasce a Nova Era', text: 'Primeiro espetáculo organizado por um grupo de amigos na Beira.' },
  { year: '2009', title: 'Casa cheia', text: 'Primeiro evento com lotação esgotada e fila à porta.' },
  { year: '2012', title: 'Palco próprio', text: 'Compra do primeiro sistema de som e luz da casa.' },
  { year: '2014', title: 'Primeiro artista internacional', text: 'A Nova Era traz uma voz internacional ao palco da cidade.' },
  { year: '2017', title: 'Festival de praia', text: 'Primeira edição de um festival de praia com milhares de pessoas.' },
  { year: '2020', title: 'Reinvenção', text: 'Transmissões ao vivo e apoio a artistas locais em tempos difíceis.' },
  { year: '2023', title: 'Formação de jovens', text: 'Arranca o programa de formação em som, luz e produção.' },
  { year: '2026', title: '20 anos', text: 'Duas décadas a escrever a história do entretenimento na Beira.' },
];

export interface PastEdition {
  id: string;
  title: string;
  date: string; // texto mostrado no cartão
  poster: string;
}

// Cartazes reais em /public/posters, do mais antigo para o mais recente.
export const PAST_EDITIONS: PastEdition[] = [
  { id: 'save-the-date-2026', title: 'El Concerto · Save the Date', date: '26 de junho de 2026', poster: '/posters/el-concerto-save-the-date.jpg' },
  { id: 'pelasta', title: 'Pelasta · King of Afro House', date: '23 de setembro · Mansão de Hassanito', poster: '/posters/pelasta.jpg' },
  { id: 'sunset-2023', title: 'O Primeiro Sunset Beira', date: '21 de janeiro de 2023', poster: '/posters/sunset-beira-2023.jpg' },
  { id: 'calema-2025', title: 'Calema ao Vivo', date: '15 de novembro de 2025', poster: '/posters/calema-2025.jpg' },
  { id: 'kabza-2026', title: 'The Music Set · Kabza de Small', date: '13 de fevereiro de 2026', poster: '/posters/kabza-de-small-2026.jpg' },
  { id: 'maphorisa-2026', title: 'The Music Set · Maphorisa', date: '17 de abril de 2026', poster: '/posters/maphorisa-2026.jpg' },
  { id: 'anna-joyce-2026', title: 'El Concerto · Anna Joyce', date: '28 de agosto de 2026', poster: '/posters/anna-joyce-2026.jpg' },
  { id: 'verao-africano', title: 'O Verão Africano · The Voice On', date: '27 de setembro · Casa dos Bicos', poster: '/posters/verao-africano-the-voice-on.jpg' },
];

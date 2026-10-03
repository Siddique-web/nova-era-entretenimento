import type { MerchItem } from '../types';

// Produtos e preços simulados. Para fotos reais, defina "src" (ex.: "/merch/camiseta.jpg").
export const MERCH: MerchItem[] = [
  {
    id: 'tee-music-set',
    name: 'Camiseta The Music Set',
    description: 'Algodão macio e corte reto. À frente, o lettering The Music Set; nas costas, o logotipo NË. Escolha a cor.',
    price: 1000,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'Novo',
    colors: [
      { id: 'branca', label: 'Branca', hex: '#FFFFFF', src: '/merch/camiseta-branca.jpg' },
      { id: 'preta', label: 'Preta', hex: '#111111', src: '/merch/camiseta-preta.jpg' },
      { id: 'vermelha', label: 'Vermelha', hex: '#F40D0D', src: '/merch/camiseta-vermelha.jpg' },
    ],
  },
  {
    id: 'tee-20',
    name: 'Camiseta 20 Anos',
    description: 'Edição comemorativa em algodão pesado, com monograma NË no peito.',
    price: 1200,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'Edição limitada',
  },
  {
    id: 'cap',
    name: 'Boné Nova Era',
    description: 'Aba curva, fecho ajustável e bordado frontal do monograma.',
    price: 800,
    sizes: ['Tamanho único'],
  },
  {
    id: 'hoodie',
    name: 'Hoodie NË',
    description: 'Interior felpudo, capuz forrado e bolso canguru. Para as noites frescas da Beira.',
    price: 2500,
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    tag: 'Novo',
  },
];

// Configurações gerais do site. Edite aqui os contactos reais da Nova Era.
export const SITE = {
  name: 'Nova Era Entretenimento',
  tagline: 'A Marca das Gerações na Beira',
  // Número de WhatsApp em formato internacional, sem "+" (valor simulado)
  whatsapp: '258840000000',
  email: 'geral@novaera.co.mz',
  phone: '+258 84 000 0000',
  address: 'Beira, Sofala — Moçambique',
  socials: {
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    youtube: 'https://youtube.com/',
  },
};

export const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Bilheteira', href: '#bilheteira' },
  { label: 'Eventos', href: '#eventos' },
  { label: 'Minha reserva', href: '#minha-reserva' },
  { label: 'Notícias', href: '#noticias' },
  { label: 'Nossa História', href: '#historia' },
  { label: 'Galeria', href: '#galeria' },
  { label: 'Merch', href: '#merch' },
];

// Formas de pagamento (valores simulados: troque pelos números e contas reais da Nova Era)
export interface PayMethod {
  id: string;
  label: string;
  /** Número de carteira móvel ou NIB/conta */
  value: string;
  holder: string;
  how: string;
  copy: string; // o que é copiado ao tocar em "Copiar"
}

export const PAY_METHODS: PayMethod[] = [
  {
    id: 'mpesa',
    label: 'M-Pesa',
    value: '84 000 0000',
    holder: 'Nova Era Entretenimento',
    how: 'Marque *150# › Transferir dinheiro › indique o número e o valor total.',
    copy: '840000000',
  },
  {
    id: 'emola',
    label: 'e-Mola',
    value: '86 000 0000',
    holder: 'Nova Era Entretenimento',
    how: 'Marque *898# › Transferir › indique o número e o valor total.',
    copy: '860000000',
  },
  {
    id: 'banco',
    label: 'Transferência bancária',
    value: 'NIB 0000 0000 0000 0000 0000 0',
    holder: 'Nova Era Entretenimento, Lda.',
    how: 'Faça a transferência no seu banco ou app e guarde o comprovativo.',
    copy: '0000000000000000000000000',
  },
];

// Painel de administração: #admin (palavra-passe real definida no servidor, ver README)
export const ADMIN_HASH = '#admin';

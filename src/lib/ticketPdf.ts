import type { Reservation } from '../types';
import { SITE } from '../data/site';
import { formatDateTime, formatLongDate, formatPrice } from './format';
import { jpegToPdf } from './pdf';

const W = 1240;
const H = 1754;
const RED = '#F40D0D';
const BLACK = '#000000';
const PAPER = '#F3F3F3';
const M = 70; // margem

const base = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;

const loadImage = (src: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });

const STATUS = {
  pendente: {
    label: 'PENDENTE',
    bg: '#FFB703',
    fg: '#000000',
    title: 'A aguardar confirmação do pagamento',
    text: 'Recebemos a sua reserva e o comprovativo. A equipa da Nova Era vai verificar o pagamento. Quando for confirmado, o estado passa a CONFIRMADO.',
  },
  confirmado: {
    label: 'CONFIRMADO',
    bg: '#13A750',
    fg: '#FFFFFF',
    title: 'Pagamento confirmado. Bilhete válido.',
    text: 'O seu pagamento foi verificado. Apresente este documento (impresso ou no telemóvel) e um documento de identificação à entrada do evento.',
  },
  rejeitado: {
    label: 'RECUSADO',
    bg: '#444444',
    fg: '#FFFFFF',
    title: 'Não conseguimos validar o pagamento',
    text: `O comprovativo enviado não pôde ser validado. Contacte-nos pelo WhatsApp ${SITE.phone} com o código desta reserva.`,
  },
} as const;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

async function renderCanvas(r: Reservation): Promise<HTMLCanvasElement> {
  // Garante que as fontes do site estão carregadas antes de desenhar
  try {
    await Promise.all([
      document.fonts.load('80px "Alfa Slab One"'),
      document.fonts.load('800 40px Montserrat'),
      document.fonts.load('400 30px Archivo'),
      document.fonts.load('700 30px Archivo'),
      document.fonts.load('800 30px Archivo'),
    ]);
  } catch {
    /* usa as fontes de reserva */
  }

  const [logo, poster] = await Promise.all([loadImage(base('logo-white.png')), r.poster ? loadImage(r.poster) : Promise.resolve(null)]);
  const st = STATUS[r.status];

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  ctx.textBaseline = 'alphabetic';

  const font = (weight: number | string, size: number, family = 'Archivo, Arial, sans-serif') => {
    ctx.font = `${weight} ${size}px ${family}`;
  };
  const text = (t: string, x: number, y: number, color: string, align: CanvasTextAlign = 'left') => {
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.fillText(t, x, y);
  };
  const spaced = (t: string, x: number, y: number, color: string, spacing: number) => {
    // letter-spacing (suportado nos navegadores modernos); sem suporte, desenha normal
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = `${spacing}px`;
    text(t, x, y, color);
    (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px';
  };

  // Fundo
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);

  // ---------- Cabeçalho preto ----------
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, 0, W, 230);
  ctx.fillStyle = RED;
  ctx.fillRect(0, 230, W, 12);
  if (logo) {
    const lh = 120;
    const lw = (logo.naturalWidth / logo.naturalHeight) * lh;
    ctx.drawImage(logo, M, 55, lw, lh);
  }
  font(800, 44, 'Montserrat, Archivo, sans-serif');
  text('NOVA ERA', W - M, 100, '#fff', 'right');
  font(600, 20, 'Montserrat, Archivo, sans-serif');
  ctx.textAlign = 'right';
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '8px';
  text('ENTRETENIMENTO', W - M + 8, 134, RED, 'right');
  (ctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing = '0px';
  font(700, 26);
  text('COMPROVATIVO DE RESERVA', W - M, 186, '#fff', 'right');

  // ---------- Estado ----------
  let y = 262;
  ctx.fillStyle = st.bg;
  ctx.fillRect(M, y, W - 2 * M, 104);
  font('400', 54, '"Alfa Slab One", Georgia, serif');
  text(st.label, M + 36, y + 70, st.fg);
  ctx.textAlign = 'right';
  font(800, 25);
  const titleLines = wrap(ctx, st.title, 440);
  titleLines.slice(0, 2).forEach((l, i) => text(l, W - M - 36, y + 46 + i * 32, st.fg, 'right'));

  // texto explicativo
  y += 104;
  ctx.fillStyle = PAPER;
  ctx.fillRect(M, y, W - 2 * M, 116);
  font(500, 24);
  const expl = wrap(ctx, st.text, W - 2 * M - 70);
  expl.slice(0, 3).forEach((l, i) => text(l, M + 35, y + 40 + i * 32, '#222'));

  // ---------- Código ----------
  y += 116 + 36;
  font(800, 22);
  spaced('CÓDIGO DA RESERVA', M, y, '#555', 3);
  y += 16;
  ctx.setLineDash([14, 10]);
  ctx.lineWidth = 4;
  ctx.strokeStyle = BLACK;
  ctx.strokeRect(M + 2, y + 2, W - 2 * M - 4, 116);
  ctx.setLineDash([]);
  font('400', 82, '"Alfa Slab One", Georgia, serif');
  text(r.code, W / 2, y + 85, RED, 'center');

  // ---------- Evento ----------
  y += 116 + 44;
  const posterW = 300;
  const posterH = 375;
  ctx.fillStyle = BLACK;
  ctx.fillRect(M, y, posterW, posterH);
  if (poster) {
    const ratio = Math.min(posterW / poster.naturalWidth, posterH / poster.naturalHeight);
    const dw = poster.naturalWidth * ratio;
    const dh = poster.naturalHeight * ratio;
    ctx.drawImage(poster, M + (posterW - dw) / 2, y + (posterH - dh) / 2, dw, dh);
  } else {
    ctx.fillStyle = RED;
    ctx.fillRect(M, y, posterW, posterH);
    font('400', 54, '"Alfa Slab One", Georgia, serif');
    wrap(ctx, r.eventTitle.toUpperCase(), posterW - 50).forEach((l, i) => text(l, M + 25, y + 90 + i * 60, '#fff'));
  }
  // cantos em "colchete" vermelhos
  ctx.strokeStyle = RED;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(M - 14, y + 40);
  ctx.lineTo(M - 14, y - 14);
  ctx.lineTo(M + 40, y - 14);
  ctx.stroke();

  const ex = M + posterW + 46;
  const ew = W - M - ex;
  font(800, 22);
  spaced(r.eventCategory.toUpperCase(), ex, y + 24, RED, 3);
  font('400', 46, '"Alfa Slab One", Georgia, serif');
  let ty = y + 82;
  wrap(ctx, r.eventTitle.toUpperCase(), ew)
    .slice(0, 3)
    .forEach((l) => {
      text(l, ex, ty, BLACK);
      ty += 52;
    });
  ty += 12;
  const detail = (label: string, value: string) => {
    font(800, 20);
    spaced(label.toUpperCase(), ex, ty, '#666', 2);
    font(700, 30);
    wrap(ctx, value, ew).forEach((l, i) => text(l, ex, ty + 34 + i * 34, BLACK));
    ty += 34 + wrap(ctx, value, ew).length * 34 + 16;
  };
  detail('Data', formatLongDate(r.eventDate));
  detail('Hora', r.eventTime);
  detail('Local', r.eventVenue);

  // ---------- Comprador ----------
  y += posterH + 40;
  ctx.fillStyle = PAPER;
  ctx.fillRect(M, y, W - 2 * M, 156);
  ctx.fillStyle = RED;
  ctx.fillRect(M, y, 10, 156);
  const col = (label: string, value: string, x: number, yy: number, maxW: number) => {
    font(800, 20);
    spaced(label.toUpperCase(), x, yy, '#666', 2);
    font(700, 29);
    wrap(ctx, value, maxW)
      .slice(0, 2)
      .forEach((l, i) => text(l, x, yy + 34 + i * 32, BLACK));
  };
  col('Nome', r.name, M + 45, y + 40, 480);
  col('Contacto', r.phone, M + 45 + 520, y + 40, 280);
  col('Pagamento via', r.method, M + 45, y + 108, 480);
  col('Reservado em', formatDateTime(r.createdAt), M + 45 + 520, y + 108, 520);

  // ---------- Bilhetes ----------
  y += 156 + 36;
  font(800, 22);
  spaced('BILHETES', M, y, '#555', 3);
  y += 14;
  ctx.fillStyle = BLACK;
  ctx.fillRect(M, y, W - 2 * M, 50);
  font(800, 21);
  spaced('LOTE', M + 24, y + 33, '#fff', 2);
  spaced('QTD.', M + 560, y + 33, '#fff', 2);
  spaced('PREÇO', M + 740, y + 33, '#fff', 2);
  spaced('SUBTOTAL', W - M - 24 - 130, y + 33, '#fff', 2);
  y += 50;
  r.items.forEach((it, i) => {
    ctx.fillStyle = i % 2 === 0 ? '#fff' : PAPER;
    ctx.fillRect(M, y, W - 2 * M, 56);
    font(800, 27);
    text(it.label.toUpperCase(), M + 24, y + 38, BLACK);
    font(700, 27);
    text(`${it.qty}×`, M + 560, y + 38, BLACK);
    text(formatPrice(it.unitPrice), M + 740, y + 38, BLACK);
    text(formatPrice(it.unitPrice * it.qty), W - M - 24, y + 38, BLACK, 'right');
    y += 56;
  });
  ctx.fillStyle = BLACK;
  ctx.fillRect(M, y, W - 2 * M, 4);
  y += 4;
  font(800, 24);
  text('TOTAL PAGO', M + 24, y + 54, BLACK);
  font('400', 48, '"Alfa Slab One", Georgia, serif');
  text(formatPrice(r.total), W - M - 24, y + 58, RED, 'right');

  // ---------- Rodapé preto ----------
  const fy = H - 150;
  ctx.fillStyle = RED;
  ctx.fillRect(0, fy - 10, W, 10);
  ctx.fillStyle = BLACK;
  ctx.fillRect(0, fy, W, H - fy);
  font(800, 26, 'Montserrat, Archivo, sans-serif');
  text('NOVA ERA ENTRETENIMENTO', M, fy + 54, '#fff');
  font(500, 23);
  text(`${SITE.phone}  ·  ${SITE.email}`, M, fy + 92, '#ddd');
  text(SITE.address, M, fy + 124, '#aaa');
  font(700, 21);
  text('Guarde este documento.', W - M, fy + 92, '#fff', 'right');
  text('Consulte o estado em "Minha reserva" no site.', W - M, fy + 124, RED, 'right');

  return canvas;
}

export async function buildTicketPdf(r: Reservation): Promise<Blob> {
  const canvas = await renderCanvas(r);
  const blob: Blob = await new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Falha ao gerar o PDF.'))), 'image/jpeg', 0.92),
  );
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return jpegToPdf(bytes, W, H, `Reserva ${r.code} - Nova Era Entretenimento`);
}

/** Gera o PDF e inicia o download no aparelho. */
export async function downloadTicketPdf(r: Reservation): Promise<void> {
  const blob = await buildTicketPdf(r);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Nova-Era-${r.code}-${r.status}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 30000);
}

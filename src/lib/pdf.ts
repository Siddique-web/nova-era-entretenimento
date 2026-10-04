/** Escritor mínimo de PDF: uma página A4 com uma imagem JPEG a toda a largura. Sem dependências. */
const A4_W = 595.28;
const A4_H = 841.89;

export function jpegToPdf(jpeg: Uint8Array, pxW: number, pxH: number, title: string): Blob {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let pos = 0;
  const push = (data: string | Uint8Array) => {
    const bytes = typeof data === 'string' ? enc.encode(data) : data;
    chunks.push(bytes);
    pos += bytes.length;
  };
  const obj = (n: number, body: string | Uint8Array[]) => {
    offsets[n] = pos;
    push(`${n} 0 obj\n`);
    if (typeof body === 'string') push(body);
    else body.forEach(push);
    push('\nendobj\n');
  };

  const safeTitle = title.replace(/[()\\]/g, '').replace(/[^\x20-\x7E]/g, '');
  const content = `q ${A4_W} 0 0 ${A4_H} 0 0 cm /Im0 Do Q`;

  push('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4_W} ${A4_H}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  obj(4, [
    enc.encode(
      `<< /Type /XObject /Subtype /Image /Width ${pxW} /Height ${pxH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`,
    ),
    jpeg,
    enc.encode('\nendstream'),
  ]);
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  obj(6, `<< /Title (${safeTitle}) /Producer (Nova Era Entretenimento) >>`);

  const xref = pos;
  push(`xref\n0 7\n0000000000 65535 f \n`);
  for (let i = 1; i <= 6; i += 1) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n${xref}\n%%EOF`);

  return new Blob(chunks as BlobPart[], { type: 'application/pdf' });
}

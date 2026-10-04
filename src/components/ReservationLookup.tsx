import { useEffect, useState } from 'react';
import { Download, Loader2, RefreshCw, Search } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import StatusBadge from './StatusBadge';
import type { Reservation } from '../types';
import { SITE } from '../data/site';
import { formatDateTime, formatLongDate, formatPrice, isValidMzPhone, whatsappLink } from '../lib/format';
import { lookupReservation } from '../lib/reservations';
import { downloadTicketPdf } from '../lib/ticketPdf';

const MESSAGES = {
  pendente: 'A equipa está a verificar o seu pagamento. Volte a consultar mais tarde: quando for confirmado, o estado muda para “Confirmado”.',
  confirmado: 'Pagamento confirmado! Descarregue o PDF actualizado: é o seu bilhete válido. Apresente-o à entrada do evento.',
  rejeitado: 'Não conseguimos validar o comprovativo enviado. Fale connosco pelo WhatsApp com o código da reserva.',
} as const;

export default function ReservationLookup() {
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<Reservation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);

  // Preenche com a última reserva feita neste aparelho
  useEffect(() => {
    try {
      const last = JSON.parse(localStorage.getItem('ne:last') ?? 'null') as { code: string; phone: string } | null;
      if (last) {
        setCode(last.code);
        setPhone(last.phone);
      }
    } catch {
      /* ignora */
    }
  }, []);

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    setNotFound(false);
    if (code.trim().length < 6) {
      setError('Escreva o código da reserva (ex.: NE-AB12CD).');
      return;
    }
    if (!isValidMzPhone(phone)) {
      setError('Use o mesmo contacto da reserva, por exemplo 84 123 4567.');
      return;
    }
    setBusy(true);
    try {
      const r = await lookupReservation(code, phone);
      setResult(r);
      setNotFound(!r);
    } finally {
      setBusy(false);
    }
  };

  const pdf = async () => {
    if (!result) return;
    setPdfBusy(true);
    try {
      await downloadTicketPdf(result);
    } finally {
      setPdfBusy(false);
    }
  };

  const inputCls =
    'mt-1.5 w-full border-2 border-black/20 bg-white px-4 py-3 text-base text-black transition-all duration-300 placeholder:text-black/40 focus:border-black focus:outline-none';

  return (
    <section id="minha-reserva" aria-labelledby="minha-reserva-titulo" className="bg-paper py-20 text-black sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="minha-reserva-titulo"
          title="Minha reserva"
          intro="Já reservou? Veja se o pagamento foi confirmado e descarregue o PDF actualizado."
        />
        <Reveal>
          <form onSubmit={search} noValidate className="mt-10 grid gap-5 border-l-8 border-brand bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end sm:p-6">
            <div>
              <label htmlFor="cons-codigo" className="text-sm font-bold uppercase tracking-wider">
                Código da reserva
              </label>
              <input
                id="cons-codigo"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="NE-AB12CD"
                autoCapitalize="characters"
                className={inputCls}
              />
            </div>
            <div>
              <label htmlFor="cons-tel" className="text-sm font-bold uppercase tracking-wider">
                Contacto usado
              </label>
              <input
                id="cons-tel"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="84 123 4567"
                className={inputCls}
              />
            </div>
            <button type="submit" disabled={busy} className="btn btn-red">
              {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Search size={18} aria-hidden="true" />}
              Consultar
            </button>
          </form>
        </Reveal>

        <div aria-live="polite" className="mt-6">
          {error && <p className="text-sm font-semibold text-brand">{error}</p>}
          {notFound && (
            <p className="border-l-4 border-brand bg-white p-4 text-sm font-semibold">
              Não encontrámos essa reserva. Confirme o código e o contacto. Se acabou de reservar, aguarde um instante e tente outra vez.
            </p>
          )}
          {result && (
            <article className="border-t-4 border-brand bg-white p-5 shadow-sm sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={result.status} large />
                <p className="font-display text-2xl tracking-wider">{result.code}</p>
              </div>
              <p className="mt-4 text-black/75">{MESSAGES[result.status]}</p>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Evento</dt>
                  <dd className="mt-0.5 font-semibold">{result.eventTitle}</dd>
                  <dd className="text-black/65">
                    {formatLongDate(result.eventDate)} · {result.eventTime} · {result.eventVenue}
                  </dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Reserva de</dt>
                  <dd className="mt-0.5 font-semibold">{result.name}</dd>
                  <dd className="text-black/65">{formatDateTime(result.createdAt)}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Bilhetes</dt>
                  <dd className="mt-0.5 font-semibold">{result.items.map((i) => `${i.qty}× ${i.label}`).join(' + ')}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Total pago</dt>
                  <dd className="mt-0.5 font-display text-2xl text-brand">{formatPrice(result.total)}</dd>
                </div>
              </dl>

              <div className="mt-6 flex flex-wrap gap-3">
                <button type="button" onClick={pdf} disabled={pdfBusy} className="btn btn-red">
                  {pdfBusy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
                  Descarregar PDF
                </button>
                <button type="button" onClick={() => void search()} className="btn btn-outline">
                  <RefreshCw size={18} aria-hidden="true" /> Actualizar estado
                </button>
                {result.status === 'rejeitado' && (
                  <a
                    className="btn btn-outline"
                    target="_blank"
                    rel="noreferrer"
                    href={whatsappLink(SITE.whatsapp, `Olá, Nova Era! A minha reserva ${result.code} foi recusada. Podem ajudar?`)}
                  >
                    WhatsApp
                  </a>
                )}
              </div>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}

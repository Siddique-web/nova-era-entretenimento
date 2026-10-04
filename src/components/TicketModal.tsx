import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  Copy,
  Download,
  FileText,
  ImagePlus,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import Poster from './Poster';
import StatusBadge from './StatusBadge';
import type { EventItem, Lot, LotId, Reservation } from '../types';
import { PAY_METHODS, SITE } from '../data/site';
import { formatLongDate, formatPrice, isValidMzPhone, makeReservationCode, whatsappLink } from '../lib/format';
import { compressImage } from '../lib/image';
import { createReservation } from '../lib/reservations';
import { downloadTicketPdf } from '../lib/ticketPdf';
import { clearDraft, loadDraft, useDraftSaver } from '../hooks/useDraft';

interface TicketModalProps {
  event: EventItem;
  onClose: () => void;
}

interface Errors {
  lots?: string;
  name?: string;
  phone?: string;
  proof?: string;
  submit?: string;
}

/** Quantidade escolhida por lote. Um lote sem entrada (ou com 0) está desmarcado. */
type Picks = Partial<Record<LotId, number>>;

const MAX_QTY = 10;

const maxFor = (lot: Lot): number => Math.min(MAX_QTY, lot.remaining);

export default function TicketModal({ event, onClose }: TicketModalProps) {
  // Recupera o que o utilizador já tinha preenchido (mesmo depois de sair do site para pagar)
  const [restored] = useState(() => loadDraft(event.id));
  const [picks, setPicks] = useState<Picks>(restored?.picks && Object.keys(restored.picks).length ? restored.picks : { normal: 1 });
  const [name, setName] = useState(restored?.name ?? '');
  const [phone, setPhone] = useState(restored?.phone ?? '');
  const [method, setMethod] = useState(restored?.method || PAY_METHODS[0].id);
  const [proof, setProof] = useState(restored?.proof ?? '');
  const [proofName, setProofName] = useState(restored?.proofName ?? '');
  const [showRestored, setShowRestored] = useState(Boolean(restored));
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState<Reservation | null>(null);
  const [pdfBusy, setPdfBusy] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const proofLost = useDraftSaver(event.id, { picks, name, phone, method, proof, proofName }, !done);

  const selected = event.lots
    .filter((l) => (picks[l.id] ?? 0) > 0)
    .map((l) => ({ lot: l, qty: picks[l.id] ?? 0, subtotal: l.price * (picks[l.id] ?? 0) }));
  const totalQty = selected.reduce((n, s) => n + s.qty, 0);
  const total = selected.reduce((n, s) => n + s.subtotal, 0);
  const summary = selected.map((s) => `${s.qty}x ${s.lot.label}`).join(' + ');

  // Bloqueia o scroll da página, fecha com Esc e mantém o foco dentro do modal
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !dialogRef.current) return;
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), select, a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      previous?.focus();
    };
  }, [onClose]);

  // Marcar / desmarcar um lote
  const toggleLot = (id: LotId) => {
    setPicks((prev) => {
      const next = { ...prev };
      if ((next[id] ?? 0) > 0) delete next[id];
      else next[id] = 1;
      return next;
    });
    setErrors((e) => ({ ...e, lots: undefined }));
  };

  // Alterar a quantidade de um lote já marcado
  const changeQty = (lot: Lot, delta: number) => {
    setPicks((prev) => {
      const current = prev[lot.id] ?? 0;
      if (current === 0) return prev;
      const qty = Math.min(maxFor(lot), Math.max(1, current + delta));
      return { ...prev, [lot.id]: qty };
    });
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const data = await compressImage(file);
      setProof(data);
      setProofName(file.name);
      setErrors((e) => ({ ...e, proof: undefined }));
    } catch (err) {
      setErrors((e) => ({ ...e, proof: err instanceof Error ? err.message : 'Imagem inválida.' }));
    }
  };

  const copyNumber = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* sem permissão: o número continua visível */
    }
  };

  const startOver = () => {
    clearDraft(event.id);
    setPicks({ normal: 1 });
    setName('');
    setPhone('');
    setProof('');
    setProofName('');
    setErrors({});
    setShowRestored(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (totalQty === 0) next.lots = 'Marque pelo menos um lote para reservar.';
    if (name.trim().length < 3) next.name = 'Escreva o seu nome completo.';
    if (!isValidMzPhone(phone)) next.phone = 'Use um número válido, por exemplo 84 123 4567.';
    if (!proof) next.proof = 'Anexe a captura de ecrã do pagamento para reservar.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setBusy(true);
    try {
      const pay = PAY_METHODS.find((m) => m.id === method) ?? PAY_METHODS[0];
      const reservation = await createReservation({
        code: makeReservationCode(),
        eventId: event.id,
        eventTitle: event.title,
        eventCategory: event.category,
        eventDate: event.date,
        eventTime: event.time,
        eventVenue: event.venue,
        poster: event.poster,
        items: selected.map((s) => ({ lotId: s.lot.id, label: s.lot.label, qty: s.qty, unitPrice: s.lot.price })),
        total,
        name: name.trim(),
        phone: phone.trim(),
        method: pay.label,
        proof,
      });
      clearDraft(event.id);
      try {
        localStorage.setItem('ne:last', JSON.stringify({ code: reservation.code, phone: reservation.phone }));
      } catch {
        /* ignora */
      }
      setDone(reservation);
      // O PDF sai logo que a reserva é feita
      setPdfBusy(true);
      downloadTicketPdf(reservation)
        .catch(() => undefined)
        .finally(() => setPdfBusy(false));
    } catch (err) {
      setErrors({ submit: err instanceof Error ? err.message : 'Não foi possível enviar a reserva. Tente outra vez.' });
    } finally {
      setBusy(false);
    }
  };

  const redownload = async () => {
    if (!done) return;
    setPdfBusy(true);
    try {
      await downloadTicketPdf(done);
    } finally {
      setPdfBusy(false);
    }
  };

  const message = done
    ? `Olá, Nova Era! Fiz a reserva ${done.code} para "${event.title}" (${formatLongDate(event.date)}): ${summary}. Total pago: ${formatPrice(
        done.total,
      )}. Nome: ${done.name}. Contacto: ${done.phone}. Já enviei o comprovativo no site.`
    : '';

  const payMethod = PAY_METHODS.find((m) => m.id === method) ?? PAY_METHODS[0];

  const fieldClass = (hasError: boolean) =>
    `mt-1.5 w-full border-2 bg-white px-4 py-3 text-base text-black transition-all duration-300 placeholder:text-black/40 focus:border-black focus:outline-none ${
      hasError ? 'border-brand' : 'border-black/20'
    }`;

  const stepBtn =
    'flex h-10 w-10 items-center justify-center border-2 border-black transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-black';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade bg-black/85" onClick={onClose} aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reserva-titulo"
        className="relative flex max-h-[94svh] w-full max-w-4xl animate-pop flex-col overflow-hidden border-t-4 border-brand bg-white text-black sm:max-h-[90svh] sm:flex-row sm:border-l-4 sm:border-t-0"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center bg-black text-white transition-all duration-300 hover:scale-110 hover:bg-brand"
        >
          <X size={20} />
        </button>

        <aside className="hidden w-64 shrink-0 bg-black p-6 text-white sm:block">
          <div className="aspect-[4/5] w-full overflow-hidden">
            <Poster
              lines={event.posterLines}
              tag={event.category}
              date={formatLongDate(event.date)}
              variant={event.variant} src={event.poster}
            />
          </div>
          <ul className="mt-5 space-y-3 text-sm text-white/80">
            <li className="flex gap-2">
              <CalendarDays size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <span>
                {formatLongDate(event.date)}
                <br />
                {event.time}
              </span>
            </li>
            <li className="flex gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <span>{event.venue}</span>
            </li>
          </ul>
        </aside>

        <div className="min-w-0 flex-1 overflow-y-auto p-5 sm:p-8">
          {done ? (
            <div className="py-2" aria-live="polite">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center bg-brand text-white">
                  <Check size={28} aria-hidden="true" />
                </span>
                <StatusBadge status={done.status} large />
              </div>
              <h2 id="reserva-titulo" className="display mt-5 text-3xl text-brand sm:text-4xl">
                Reserva recebida
              </h2>
              <p className="mt-3 text-black/75">
                Está <strong>pendente</strong>: a nossa equipa vai verificar o seu pagamento. Quando for confirmado, o estado
                passa a <strong>confirmado</strong> e o bilhete fica válido.
              </p>

              <p className="mt-5 inline-block border-2 border-dashed border-black px-5 py-3 font-display text-3xl tracking-wider">
                {done.code}
              </p>

              <div className="mt-6 flex gap-3 border-l-4 border-black bg-paper p-4 text-sm leading-relaxed">
                <FileText size={22} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                <p>
                  O PDF da reserva foi descarregado para o seu aparelho. Se não o encontrar, use o botão abaixo. Para ver se o
                  pagamento já foi confirmado, abra <strong>Minha reserva</strong> com o código e o seu contacto.
                </p>
              </div>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Evento</dt>
                  <dd className="mt-0.5 font-semibold">{event.title}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Nome</dt>
                  <dd className="mt-0.5 font-semibold">{done.name}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold uppercase tracking-wide text-black/55">Bilhetes</dt>
                  <dd className="mt-1">
                    <ul className="divide-y divide-black/10 border-y border-black/10">
                      {done.items.map((it) => (
                        <li key={it.lotId} className="flex items-center justify-between gap-3 py-2 font-semibold">
                          <span>
                            {it.qty} × {it.label}
                          </span>
                          <span>{formatPrice(it.unitPrice * it.qty)}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold uppercase tracking-wide text-black/55">Total pago</dt>
                  <dd className="mt-0.5 font-display text-3xl text-brand">{formatPrice(done.total)}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <button type="button" className="btn btn-red" onClick={redownload} disabled={pdfBusy}>
                  {pdfBusy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : <Download size={18} aria-hidden="true" />}
                  Descarregar PDF
                </button>
                <a href="#minha-reserva" onClick={onClose} className="btn btn-outline">
                  <Search size={18} aria-hidden="true" /> Ver estado
                </a>
                <a href={whatsappLink(SITE.whatsapp, message)} target="_blank" rel="noreferrer" className="btn btn-outline">
                  <MessageCircle size={18} aria-hidden="true" /> WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              {showRestored && (
                <div role="status" className="mb-5 flex flex-wrap items-center justify-between gap-3 border-l-4 border-brand bg-brand/5 p-3 text-sm">
                  <p className="font-semibold">Retomámos a sua reserva onde ficou. Os seus dados estão guardados neste aparelho.</p>
                  <button
                    type="button"
                    onClick={startOver}
                    className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wide text-black/70 underline decoration-2 underline-offset-4 hover:text-brand"
                  >
                    <RotateCcw size={14} aria-hidden="true" /> Começar de novo
                  </button>
                </div>
              )}
              <p className="text-sm font-bold uppercase tracking-wider text-black/55">{event.category}</p>
              <h2 id="reserva-titulo" className="display mt-1 pr-12 text-3xl text-brand sm:text-4xl">
                {event.title}
              </h2>
              <p className="mt-2 text-sm text-black/65 sm:hidden">
                {formatLongDate(event.date)} · {event.time} · {event.venue}
              </p>

              {/* Lotes: pode marcar vários, cada um com a sua quantidade, e desmarcar a qualquer momento */}
              <fieldset className="mt-6" aria-describedby="lotes-ajuda">
                <legend className="text-sm font-bold uppercase tracking-wider"><StepNo n={1} /> Escolha os bilhetes</legend>
                <p id="lotes-ajuda" className="mt-1 text-sm text-black/65">
                  Marque um ou mais lotes e defina a quantidade de cada um. Toque outra vez para desmarcar.
                </p>

                <div className="mt-3 space-y-3">
                  {event.lots.map((lot) => {
                    const qty = picks[lot.id] ?? 0;
                    const isOn = qty > 0;
                    const max = maxFor(lot);
                    return (
                      <div
                        key={lot.id}
                        className={`border-2 transition-all duration-300 ${
                          isOn
                            ? 'border-brand bg-brand/5 shadow-md'
                            : 'border-black/15 hover:-translate-y-0.5 hover:border-black/50 hover:shadow-md'
                        }`}
                      >
                        <label className="flex cursor-pointer items-start gap-3 p-4">
                          <input
                            type="checkbox"
                            checked={isOn}
                            onChange={() => toggleLot(lot.id)}
                            className="peer sr-only"
                          />
                          <span
                            aria-hidden="true"
                            className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border-2 transition-all duration-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-black ${
                              isOn ? 'border-brand bg-brand text-white' : 'border-black bg-white text-transparent'
                            }`}
                          >
                            <Check size={16} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-3">
                              <span className="font-display text-xl uppercase">{lot.label}</span>
                              <span className="font-extrabold">{formatPrice(lot.price)}</span>
                            </span>
                            <span className="mt-1 block text-sm leading-snug text-black/65">{lot.perks}</span>
                            <span
                              className={`mt-1.5 block text-xs font-bold ${
                                lot.remaining <= 30 ? 'text-brand' : 'text-black/55'
                              }`}
                            >
                              {lot.remaining <= 30 ? `Últimos ${lot.remaining} bilhetes` : `${lot.remaining} disponíveis`}
                            </span>
                          </span>
                        </label>

                        {isOn && (
                          <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-brand/20 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div role="group" aria-label={`Quantidade do lote ${lot.label}`} className="flex items-center">
                                <button
                                  type="button"
                                  onClick={() => changeQty(lot, -1)}
                                  disabled={qty <= 1}
                                  aria-label={`Menos um bilhete ${lot.label}`}
                                  className={stepBtn}
                                >
                                  <Minus size={16} />
                                </button>
                                <output aria-live="polite" className="w-12 text-center font-display text-2xl">
                                  {qty}
                                </output>
                                <button
                                  type="button"
                                  onClick={() => changeQty(lot, 1)}
                                  disabled={qty >= max}
                                  aria-label={`Mais um bilhete ${lot.label}`}
                                  className={stepBtn}
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleLot(lot.id)}
                                className="text-sm font-bold uppercase tracking-wide text-black/60 underline decoration-2 underline-offset-4 transition-all duration-300 hover:text-brand"
                              >
                                Desmarcar
                              </button>
                            </div>
                            <p className="text-sm font-bold">
                              Subtotal <span className="font-display text-lg text-brand">{formatPrice(lot.price * qty)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {errors.lots && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-brand">
                    {errors.lots}
                  </p>
                )}
                <p className="mt-2 text-xs text-black/55">Máximo de {MAX_QTY} bilhetes por lote.</p>
              </fieldset>

              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  <StepNo n={2} /> Os seus dados
                </h3>
                <div className="mt-3 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="res-nome" className="text-sm font-bold uppercase tracking-wider">
                      Nome completo
                    </label>
                    <input
                      id="res-nome"
                      type="text"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'res-nome-erro' : undefined}
                      placeholder="Ex.: Ana Macuácua"
                      className={fieldClass(Boolean(errors.name))}
                    />
                    {errors.name && (
                      <p id="res-nome-erro" className="mt-1.5 text-sm font-semibold text-brand">
                        {errors.name}
                      </p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="res-tel" className="text-sm font-bold uppercase tracking-wider">
                      Contacto (WhatsApp)
                    </label>
                    <input
                      id="res-tel"
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      aria-invalid={Boolean(errors.phone)}
                      aria-describedby={errors.phone ? 'res-tel-erro' : undefined}
                      placeholder="84 123 4567"
                      className={fieldClass(Boolean(errors.phone))}
                    />
                    {errors.phone && (
                      <p id="res-tel-erro" className="mt-1.5 text-sm font-semibold text-brand">
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Pagamento: instruções claras, o utilizador sai, paga e volta */}
              <section className="mt-8 bg-black p-5 text-white sm:p-6" aria-labelledby="pagar-titulo">
                <h3 id="pagar-titulo" className="text-sm font-bold uppercase tracking-wider">
                  <StepNo n={3} dark /> Faça o pagamento
                </h3>
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-white/60">Valor a pagar</p>
                <p className="font-display text-4xl text-brand sm:text-5xl">{formatPrice(total)}</p>

                <div role="radiogroup" aria-label="Forma de pagamento" className="mt-5 grid gap-2 sm:grid-cols-3">
                  {PAY_METHODS.map((m) => {
                    const on = m.id === method;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        role="radio"
                        aria-checked={on}
                        onClick={() => setMethod(m.id)}
                        className={`border-2 px-3 py-3 text-left text-sm font-extrabold uppercase tracking-wide transition-all duration-300 ${
                          on ? 'border-brand bg-brand text-white' : 'border-white/30 text-white hover:border-white'
                        }`}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 border-l-4 border-brand bg-white/5 p-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/60">{payMethod.id === 'banco' ? 'Conta' : 'Número'}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-display text-2xl tracking-wide sm:text-3xl">{payMethod.value}</p>
                    <button
                      type="button"
                      onClick={() => copyNumber(payMethod.copy)}
                      className="inline-flex items-center gap-2 border-2 border-white px-3 py-2 text-xs font-extrabold uppercase tracking-wider transition-all duration-300 hover:bg-white hover:text-black"
                    >
                      {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                  <p className="mt-2 text-sm font-semibold">{payMethod.holder}</p>
                  <p className="mt-1 text-sm text-white/75">{payMethod.how}</p>
                </div>

                <div className="mt-4 flex gap-3 bg-[#FFB703] p-4 text-black">
                  <AlertTriangle size={22} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <div className="text-sm leading-relaxed">
                    <p className="font-extrabold uppercase tracking-wide">Pode sair do site para pagar</p>
                    <p className="mt-1">
                      Tudo o que preencheu fica guardado neste aparelho. Faça o pagamento, tire uma <strong>captura de ecrã</strong> da
                      mensagem de confirmação, volte a esta página e anexe-a abaixo para concluir a reserva.
                    </p>
                  </div>
                </div>
              </section>

              {/* Comprovativo */}
              <section className="mt-8" aria-labelledby="comprovativo-titulo">
                <h3 id="comprovativo-titulo" className="text-sm font-bold uppercase tracking-wider">
                  <StepNo n={4} /> Anexe o comprovativo
                </h3>
                <p className="mt-1 text-sm text-black/65">Foto ou captura de ecrã da confirmação do pagamento. Só depois pode reservar.</p>

                <input
                  ref={fileRef}
                  id="res-prova"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => {
                    void onFile(e.target.files?.[0]);
                    e.target.value = '';
                  }}
                />
                {proof ? (
                  <div className="mt-3 flex items-center gap-4 border-2 border-black/15 p-3">
                    <img src={proof} alt="Comprovativo de pagamento anexado" className="h-24 w-24 shrink-0 bg-black object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-extrabold text-[#13A750]">
                        <Check size={16} aria-hidden="true" /> Comprovativo anexado
                      </p>
                      <p className="mt-0.5 truncate text-xs text-black/60">{proofName}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs font-bold uppercase tracking-wide">
                        <button type="button" onClick={() => fileRef.current?.click()} className="underline decoration-2 underline-offset-4 hover:text-brand">
                          Trocar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProof('');
                            setProofName('');
                          }}
                          className="inline-flex items-center gap-1 text-black/60 underline decoration-2 underline-offset-4 hover:text-brand"
                        >
                          <Trash2 size={13} aria-hidden="true" /> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="res-prova"
                    className={`mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-4 py-8 text-center transition-all duration-300 hover:border-brand hover:bg-brand/5 ${
                      errors.proof ? 'border-brand' : 'border-black/30'
                    }`}
                  >
                    <ImagePlus size={30} className="text-brand" aria-hidden="true" />
                    <span className="text-sm font-extrabold uppercase tracking-wide">Escolher captura de ecrã</span>
                    <span className="text-xs text-black/55">JPG, PNG ou foto da câmara</span>
                  </label>
                )}
                {proofLost && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-brand">
                    A foto é grande e não ficou guardada. Se sair do site, terá de a anexar outra vez.
                  </p>
                )}
                {errors.proof && (
                  <p role="alert" className="mt-2 text-sm font-semibold text-brand">
                    {errors.proof}
                  </p>
                )}
              </section>

              {/* Resumo e confirmação */}
              <div className="mt-8 border-t-2 border-black/10 pt-6">
                <p className="text-sm font-bold uppercase tracking-wider text-black/60">O seu pedido</p>
                {selected.length === 0 ? (
                  <p className="mt-2 text-sm text-black/60">Nenhum lote marcado.</p>
                ) : (
                  <ul className="mt-2 divide-y divide-black/10 border-y border-black/10 text-sm">
                    {selected.map((s) => (
                      <li key={s.lot.id} className="flex items-center justify-between gap-3 py-2 font-semibold">
                        <span>
                          {s.qty} × {s.lot.label}
                        </span>
                        <span>{formatPrice(s.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider text-black/60">
                      Total · {totalQty} {totalQty === 1 ? 'bilhete' : 'bilhetes'}
                    </p>
                    <p className="font-display text-3xl text-brand">{formatPrice(total)}</p>
                    <p className="text-xs text-black/55">Ao reservar, descarrega o PDF com o estado “pendente”.</p>
                  </div>
                  <button type="submit" disabled={busy} className="btn btn-red sm:min-w-[240px] disabled:opacity-60">
                    {busy ? <Loader2 size={18} className="animate-spin" aria-hidden="true" /> : null}
                    {busy ? 'A enviar…' : 'Reservar e gerar PDF'}
                  </button>
                </div>
                {errors.submit && (
                  <p role="alert" className="mt-3 text-sm font-semibold text-brand">
                    {errors.submit}
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function StepNo({ n, dark = false }: { n: number; dark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`mr-2 inline-flex h-6 w-6 items-center justify-center align-middle text-xs font-extrabold ${
        dark ? 'bg-brand text-white' : 'bg-black text-white'
      }`}
    >
      {n}
    </span>
  );
}

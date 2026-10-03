import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Check, MapPin, MessageCircle, Minus, Plus, X } from 'lucide-react';
import Poster from './Poster';
import type { EventItem, Lot, LotId } from '../types';
import { PICKUP_POINTS, SITE } from '../data/site';
import {
  formatLongDate,
  formatPrice,
  isValidMzPhone,
  makeReservationCode,
  whatsappLink,
} from '../lib/format';

interface TicketModalProps {
  event: EventItem;
  onClose: () => void;
}

interface Errors {
  lots?: string;
  name?: string;
  phone?: string;
  pickup?: string;
}

/** Quantidade escolhida por lote. Um lote sem entrada (ou com 0) está desmarcado. */
type Picks = Partial<Record<LotId, number>>;

const MAX_QTY = 10;

const maxFor = (lot: Lot): number => Math.min(MAX_QTY, lot.remaining);

export default function TicketModal({ event, onClose }: TicketModalProps) {
  const [picks, setPicks] = useState<Picks>({ normal: 1 });
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pickup, setPickup] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [code, setCode] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

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

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    if (totalQty === 0) next.lots = 'Marque pelo menos um lote para reservar.';
    if (name.trim().length < 3) next.name = 'Escreva o seu nome completo.';
    if (!isValidMzPhone(phone)) next.phone = 'Use um número válido, por exemplo 84 123 4567.';
    if (!pickup) next.pickup = 'Escolha onde quer levantar os bilhetes.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setCode(makeReservationCode());
  };

  const message = code
    ? `Olá, Nova Era! Fiz a reserva ${code} para "${event.title}" (${formatLongDate(event.date)}): ${summary}. Total: ${formatPrice(
        total,
      )}. Nome: ${name.trim()}. Telefone: ${phone.trim()}. Levantamento: ${pickup}.`
    : '';

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
          {code ? (
            <div className="py-4" aria-live="polite">
              <span className="flex h-14 w-14 items-center justify-center bg-brand text-white">
                <Check size={30} aria-hidden="true" />
              </span>
              <h2 id="reserva-titulo" className="display mt-5 text-3xl text-brand sm:text-4xl">
                Reserva confirmada
              </h2>
              <p className="mt-3 text-black/75">
                Guarde o seu código de reserva. Apresente-o, com o seu nome, no ponto de levantamento.
              </p>
              <p className="mt-5 inline-block border-2 border-dashed border-black px-5 py-3 font-display text-3xl tracking-wider">
                {code}
              </p>

              <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Evento</dt>
                  <dd className="mt-0.5 font-semibold">{event.title}</dd>
                </div>
                <div>
                  <dt className="font-bold uppercase tracking-wide text-black/55">Levantamento</dt>
                  <dd className="mt-0.5 font-semibold">{pickup}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold uppercase tracking-wide text-black/55">Bilhetes</dt>
                  <dd className="mt-1">
                    <ul className="divide-y divide-black/10 border-y border-black/10">
                      {selected.map((s) => (
                        <li key={s.lot.id} className="flex items-center justify-between gap-3 py-2 font-semibold">
                          <span>
                            {s.qty} × {s.lot.label}
                          </span>
                          <span>{formatPrice(s.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="font-bold uppercase tracking-wide text-black/55">Total a pagar</dt>
                  <dd className="mt-0.5 font-display text-3xl text-brand">{formatPrice(total)}</dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={whatsappLink(SITE.whatsapp, message)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-red"
                >
                  <MessageCircle size={18} aria-hidden="true" /> Enviar por WhatsApp
                </a>
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  Fechar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} noValidate>
              <p className="text-sm font-bold uppercase tracking-wider text-black/55">{event.category}</p>
              <h2 id="reserva-titulo" className="display mt-1 pr-12 text-3xl text-brand sm:text-4xl">
                {event.title}
              </h2>
              <p className="mt-2 text-sm text-black/65 sm:hidden">
                {formatLongDate(event.date)} · {event.time} · {event.venue}
              </p>

              {/* Lotes: pode marcar vários, cada um com a sua quantidade, e desmarcar a qualquer momento */}
              <fieldset className="mt-6" aria-describedby="lotes-ajuda">
                <legend className="text-sm font-bold uppercase tracking-wider">Escolha os lotes</legend>
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

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
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
                    Telefone / WhatsApp
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
                <div className="sm:col-span-2">
                  <label htmlFor="res-ponto" className="text-sm font-bold uppercase tracking-wider">
                    Ponto de levantamento na Beira
                  </label>
                  <select
                    id="res-ponto"
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    aria-invalid={Boolean(errors.pickup)}
                    aria-describedby={errors.pickup ? 'res-ponto-erro' : undefined}
                    className={fieldClass(Boolean(errors.pickup))}
                  >
                    <option value="">Escolha um ponto autorizado</option>
                    {PICKUP_POINTS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  {errors.pickup && (
                    <p id="res-ponto-erro" className="mt-1.5 text-sm font-semibold text-brand">
                      {errors.pickup}
                    </p>
                  )}
                </div>
              </div>

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
                    <p className="text-xs text-black/55">Pagamento no momento do levantamento.</p>
                  </div>
                  <button type="submit" className="btn btn-red sm:min-w-[220px]">
                    Confirmar reserva
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

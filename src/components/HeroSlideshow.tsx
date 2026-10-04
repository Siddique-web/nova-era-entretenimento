import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeftRight } from 'lucide-react';
import Poster from './Poster';
import type { EventItem } from '../types';
import type { NewsItem } from '../data/news';
import { formatDay, formatMonth, parseDate } from '../lib/format';

interface HeroSlideshowProps {
  news: NewsItem[]; // já ordenadas: a mais recente primeiro
  events: EventItem[];
  onBuy: (event: EventItem) => void;
}

/** Cada slide fica parado 4 segundos. A contagem só começa quando o slide já chegou ao ecrã. */
const SLIDE_MS = 4000;
/** Duração do deslize entre slides (os 4 s contam depois disto). */
const SLIDE_ANIM_MS = 700;
/** O primeiro slide aceita até 7 cartazes de eventos. */
const MAX_UPCOMING = 7;
/** Deslize mínimo (fração da largura) para mudar de slide. */
const SWIPE_RATIO = 0.16;

type Slide = { kind: 'events'; id: string } | { kind: 'news'; id: string; item: NewsItem; first: boolean };

interface DragState {
  id: number;
  x0: number;
  y0: number;
  x: number;
  t: number;
  vx: number;
  active: boolean;
  locked: boolean;
}

export default function HeroSlideshow({ news, events, onBuy }: HeroSlideshowProps) {
  // Eventos que ainda vão acontecer, do mais próximo para o mais distante (máx. 7)
  const upcoming = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events
      .filter((e) => parseDate(e.date).getTime() >= today.getTime())
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(0, MAX_UPCOMING);
  }, [events]);

  const slides = useMemo<Slide[]>(() => {
    const list: Slide[] = news.map((item, i) => ({ kind: 'news', id: item.id, item, first: i === 0 }));
    return upcoming.length > 0 ? [{ kind: 'events', id: 'proximos-eventos' }, ...list] : list;
  }, [news, upcoming]);

  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [touched, setTouched] = useState(false); // some a dica "deslize" depois do primeiro gesto
  const [cycle, setCycle] = useState(0); // sobe quando um gesto não muda de slide: reinicia a contagem

  const sectionRef = useRef<HTMLElement>(null);
  const offset = useRef(0);
  const blockClick = useRef(false);
  const drag = useRef<DragState>({ id: -1, x0: 0, y0: 0, x: 0, t: 0, vx: 0, active: false, locked: false });

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  // Avanço automático: 4 s em cada slide, contados a partir do momento em que ele chegou.
  // Fica parado enquanto o utilizador arrasta e recomeça (4 s completos) ao largar.
  useEffect(() => {
    if (dragging) return undefined;
    const t = window.setTimeout(() => setIndex((v) => (v + 1) % count), SLIDE_ANIM_MS + SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [index, count, dragging, cycle]);

  /* ---------- Deslizar com o dedo ou arrastar com o rato ---------- */
  const onPointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, t: performance.now(), vx: 0, active: true, locked: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d.active || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    if (!d.locked) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        d.active = false; // gesto vertical: deixa a página rolar
        return;
      }
      d.locked = true;
      blockClick.current = true;
      setDragging(true);
      setTouched(true);
      try {
        sectionRef.current?.setPointerCapture(e.pointerId);
      } catch {
        /* ignora */
      }
    }
    const now = performance.now();
    d.vx = (e.clientX - d.x) / Math.max(1, now - d.t);
    d.x = e.clientX;
    d.t = now;
    // Nas pontas o slide resiste (efeito elástico)
    const edge = (index === 0 && dx > 0) || (index === count - 1 && dx < 0);
    offset.current = edge ? dx * 0.3 : dx;
    setDragX(offset.current);
  };

  const endDrag = (cancelled: boolean) => {
    const d = drag.current;
    const wasLocked = d.locked;
    d.active = false;
    d.locked = false;
    if (!wasLocked) return;
    const w = sectionRef.current?.clientWidth || 1;
    const off = offset.current;
    const fast = Math.abs(d.vx) > 0.5 && Math.sign(d.vx) === Math.sign(off);
    if (!cancelled && (Math.abs(off) > w * SWIPE_RATIO || fast)) {
      const next = index + (off < 0 ? 1 : -1);
      if (next >= 0 && next < count) setIndex(next);
    }
    offset.current = 0;
    setDragX(0);
    setDragging(false);
    setCycle((c) => c + 1);
    window.setTimeout(() => {
      blockClick.current = false;
    }, 0);
  };

  // Imagem usada no fundo desfocado de cada slide
  const bgOf = (s: Slide): string | undefined =>
    s.kind === 'events' ? upcoming.find((e) => e.poster)?.poster : s.item.images[0].src;

  return (
    <section
      id="inicio"
      ref={sectionRef}
      aria-roledescription="carrossel"
      aria-label="Próximos eventos e notícias da Nova Era"
      className="relative isolate cursor-grab touch-pan-y select-none overflow-hidden bg-black active:cursor-grabbing"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={() => endDrag(false)}
      onPointerCancel={() => endDrag(true)}
      onDragStart={(e) => e.preventDefault()}
      onClickCapture={(e) => {
        if (blockClick.current) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') go(index - 1);
        if (e.key === 'ArrowRight') go(index + 1);
      }}
    >
      {/* Fundo desfocado da imagem do slide ativo */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        {slides.map((s, i) => {
          const bg = bgOf(s);
          return bg ? (
            <img
              key={s.id}
              src={bg}
              alt=""
              draggable={false}
              className={`absolute inset-0 h-full w-full object-cover blur-3xl transition-all duration-1000 ${
                i === index ? 'scale-125 opacity-60' : 'scale-150 opacity-0'
              }`}
            />
          ) : null;
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
      </div>

      {/* Faixa de slides lado a lado: acompanha o dedo e encaixa no slide seguinte */}
      <div
        className="flex will-change-transform"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${dragX}px), 0, 0)`,
          transition: dragging ? 'none' : `transform ${SLIDE_ANIM_MS}ms cubic-bezier(0.22, 0.7, 0.2, 1)`,
        }}
      >
        {slides.map((s, i) => {
          const active = i === index;
          const base =
            'mx-auto flex min-h-[100svh] w-full max-w-7xl flex-col items-center justify-center gap-6 px-4 pb-28 pt-28 sm:px-6 lg:px-24';

          if (s.kind === 'events') {
            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} de ${count}: próximos eventos`}
                aria-hidden={!active}
                className="w-full shrink-0 basis-full"
              >
                <div className={base}>
                  <div className="text-center text-white">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-brand">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden="true" />
                        Em breve
                      </span>
                      <span className="bg-brand px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">
                        {upcoming.length} {upcoming.length === 1 ? 'evento' : 'eventos'}
                      </span>
                    </div>
                    <h1 className="display mt-4 text-3xl sm:text-4xl lg:text-5xl">Próximos eventos na Beira</h1>
                    <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                      Escolha o seu cartaz e reserve o bilhete.
                    </p>
                  </div>

                  {/* Cartazes inteiros (4:5), sem cortes; até 7 por slide */}
                  <ul className="m-0 flex w-full list-none flex-wrap justify-center gap-3 p-0 sm:gap-4">
                    {upcoming.map((ev) => (
                      <li key={ev.id} className="w-[30%] sm:w-[22%] lg:w-[13.2%]">
                        <button
                          type="button"
                          onClick={() => onBuy(ev)}
                          tabIndex={active ? 0 : -1}
                          aria-label={`Reservar bilhete: ${ev.title}`}
                          className="group block w-full text-left"
                        >
                          <span className="block aspect-[4/5] overflow-hidden bg-black shadow-[0_18px_40px_-16px_rgba(244,13,13,0.7)] transition-all duration-300 group-hover:-translate-y-1 group-hover:scale-[1.04]">
                            <Poster
                              lines={ev.posterLines}
                              tag={ev.category}
                              date={`${formatDay(ev.date)} ${formatMonth(ev.date)}`}
                              variant={ev.variant}
                              src={ev.poster}
                            />
                          </span>
                          <span className="mt-1.5 block border-b-2 border-brand pb-1 text-[10px] font-extrabold uppercase leading-tight tracking-wide text-white sm:text-xs">
                            {formatDay(ev.date)} {formatMonth(ev.date)}
                            <span className="block truncate font-semibold normal-case text-white/70">{ev.title}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap justify-center gap-3">
                    <a href="#bilheteira" className="btn btn-red" tabIndex={active ? 0 : -1}>
                      Ver bilheteira
                    </a>
                    <a href="#eventos" className="btn btn-outline-light" tabIndex={active ? 0 : -1}>
                      Agenda completa
                    </a>
                  </div>
                </div>
              </div>
            );
          }

          const { item } = s;
          const event = item.eventId ? events.find((e) => e.id === item.eventId) : undefined;
          const img = item.images[0];
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} de ${count}: notícia`}
              aria-hidden={!active}
              className="w-full shrink-0 basis-full"
            >
              <div className={`${base} md:flex-row md:gap-12`}>
                {/* Imagem sempre inteira (object-contain), nunca cortada */}
                <div className="flex w-full shrink-0 justify-center md:w-[42%]">
                  <div className="brackets inline-block max-w-full shadow-[0_30px_80px_-20px_rgba(244,13,13,0.6)]">
                    <img
                      src={img.src}
                      alt={img.alt}
                      draggable={false}
                      className="block h-auto max-h-[36svh] w-auto max-w-full bg-black object-contain md:max-h-[62svh]"
                    />
                  </div>
                </div>

                <div className="max-w-xl text-center text-white md:text-left">
                  <div className="flex flex-wrap items-center justify-center gap-2 md:justify-start">
                    {s.first && (
                      <span className="inline-flex items-center gap-2 bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-brand">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden="true" />
                        Última notícia
                      </span>
                    )}
                    <span className="bg-brand px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider">{item.tag}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/70">{item.date}</span>
                  </div>
                  {i === 0 ? (
                    <h1 className="display mt-4 text-3xl sm:text-4xl lg:text-5xl">{item.title}</h1>
                  ) : (
                    <p className="display mt-4 text-3xl sm:text-4xl lg:text-5xl">{item.title}</p>
                  )}
                  <p className="mt-4 text-sm leading-relaxed text-white/85 sm:text-base">{item.excerpt}</p>
                  <div className="mt-6 flex flex-wrap justify-center gap-3 md:justify-start">
                    {event && (
                      <button type="button" className="btn btn-red" tabIndex={active ? 0 : -1} onClick={() => onBuy(event)}>
                        Reservar bilhete
                      </button>
                    )}
                    <a
                      href={`#noticia-${item.id}`}
                      className={`btn ${event ? 'btn-outline-light' : 'btn-red'}`}
                      tabIndex={active ? 0 : -1}
                    >
                      Ler notícia
                    </a>
                    <a href="#noticias" className="btn btn-outline-light" tabIndex={active ? 0 : -1}>
                      Todas as notícias
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Setas laterais */}
      <button
        type="button"
        aria-label="Slide anterior"
        onClick={() => go(index - 1)}
        className="absolute left-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/40 text-white transition-all duration-300 hover:scale-110 hover:border-brand hover:bg-brand sm:left-5 sm:flex"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        type="button"
        aria-label="Próximo slide"
        onClick={() => go(index + 1)}
        className="absolute right-2 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-black/40 text-white transition-all duration-300 hover:scale-110 hover:border-brand hover:bg-brand sm:right-5 sm:flex"
      >
        <ChevronRight size={22} />
      </button>

      {/* Dica de deslize: some depois do primeiro gesto */}
      {!touched && (
        <p
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-14 z-10 flex items-center justify-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-white/80"
        >
          <ChevronsLeftRight size={16} className="text-brand" /> Deslize para ver o próximo
        </p>
      )}

      {/* Indicadores: a barra vermelha enche em 4 s e mostra quando o slide vai trocar */}
      <div className="absolute inset-x-0 bottom-5 z-10 flex flex-col items-center gap-1 px-4">
        <div className="flex items-center gap-2" role="tablist" aria-label="Escolher slide">
          {slides.map((s, i) => (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={s.kind === 'events' ? 'Ir para: próximos eventos' : `Ir para: ${s.item.title}`}
              onClick={() => go(i)}
              className="group flex h-8 w-9 items-center sm:w-14"
            >
              <span className="relative block h-1 w-full overflow-hidden bg-white/35 transition-all duration-300 group-hover:h-1.5 group-hover:bg-white/60">
                {i === index && !dragging && (
                  <span
                    key={`${index}-${cycle}`}
                    className="absolute inset-0 origin-left scale-x-0 bg-brand"
                    style={{ animation: `progress-fill ${SLIDE_MS}ms linear ${SLIDE_ANIM_MS}ms forwards` }}
                  />
                )}
                {i === index && dragging && <span className="absolute inset-0 bg-brand" />}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[11px] font-bold tracking-widest text-white/70" aria-live="off">
          {String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
        </p>
      </div>
    </section>
  );
}

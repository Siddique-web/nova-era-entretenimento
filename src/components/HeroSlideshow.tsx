import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Poster from './Poster';
import type { EventItem } from '../types';
import type { NewsItem } from '../data/news';
import { formatDay, formatMonth, parseDate } from '../lib/format';

interface HeroSlideshowProps {
  news: NewsItem[]; // já ordenadas: a mais recente primeiro
  events: EventItem[];
  onBuy: (event: EventItem) => void;
}

/** Cada slide fica 7 segundos, o tempo de ler o título e o resumo. */
const SLIDE_MS = 7000;
/** O primeiro slide aceita até 7 cartazes de eventos. */
const MAX_UPCOMING = 7;

type Slide = { kind: 'events'; id: string } | { kind: 'news'; id: string; item: NewsItem; first: boolean };

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

  const go = useCallback((n: number) => setIndex(((n % count) + count) % count), [count]);

  // Temporizador contínuo: nunca pausa. Quando o utilizador muda de slide, o relógio recomeça.
  useEffect(() => {
    const t = window.setTimeout(() => setIndex((v) => (v + 1) % count), SLIDE_MS);
    return () => window.clearTimeout(t);
  }, [index, count]);

  // Imagem usada no fundo desfocado de cada slide
  const bgOf = (s: Slide): string | undefined =>
    s.kind === 'events' ? upcoming.find((e) => e.poster)?.poster : s.item.images[0].src;

  return (
    <section
      id="inicio"
      aria-roledescription="carrossel"
      aria-label="Próximos eventos e notícias da Nova Era"
      className="relative isolate overflow-hidden bg-black"
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
              className={`absolute inset-0 h-full w-full object-cover blur-3xl transition-all duration-1000 ${
                i === index ? 'scale-125 opacity-60' : 'scale-150 opacity-0'
              }`}
            />
          ) : null;
        })}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/90" />
      </div>

      {/* Slides empilhados na mesma célula para manter a altura estável */}
      <div className="mx-auto grid min-h-[100svh] max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-24">
        {slides.map((s, i) => {
          const active = i === index;
          const wrap = `col-start-1 row-start-1 flex flex-col items-center justify-center gap-6 transition-all duration-700 ease-out ${
            active ? 'translate-x-0 scale-100 opacity-100' : 'pointer-events-none translate-x-10 scale-[0.97] opacity-0'
          }`;

          if (s.kind === 'events') {
            return (
              <div
                key={s.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} de ${count}: próximos eventos`}
                aria-hidden={!active}
                className={wrap}
              >
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
            );
          }

          const { item } = s;
          const event = item.eventId ? events.find((e) => e.id === item.eventId) : undefined;
          const img = item.images[0];
          const isH1 = i === 0;
          return (
            <div
              key={s.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} de ${count}: notícia`}
              aria-hidden={!active}
              className={`${wrap} md:flex-row md:gap-12`}
            >
              {/* Imagem sempre inteira (object-contain), nunca cortada */}
              <div className="flex w-full shrink-0 justify-center md:w-[42%]">
                <div className="brackets inline-block max-w-full shadow-[0_30px_80px_-20px_rgba(244,13,13,0.6)]">
                  <img
                    src={img.src}
                    alt={img.alt}
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
                {isH1 ? (
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

      {/* Indicadores de progresso */}
      <div className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center px-4">
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
                {i === index && (
                  <span
                    key={index}
                    className="absolute inset-0 origin-left bg-brand"
                    style={{ animation: `progress-fill ${SLIDE_MS}ms linear forwards` }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Poster from './Poster';
import type { EventItem } from '../types';
import { formatLongDate, formatPrice } from '../lib/format';

interface TicketCarouselProps {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
}

/** Os bilhetes avançam sozinhos a cada 3 segundos. */
const AUTO_MS = 3000;

export default function TicketCarousel({ events, onSelect }: TicketCarouselProps) {
  const count = events.length;
  const trackRef = useRef<HTMLUListElement>(null);
  const raf = useRef<number | null>(null);
  const drag = useRef({ down: false, startX: 0, startLeft: 0, moved: false });
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [dragging, setDragging] = useState(false);

  const scrollToIndex = useCallback((n: number) => {
    const track = trackRef.current;
    const card = track?.children[n] as HTMLElement | undefined;
    if (!track || !card) return;
    track.scrollTo({
      left: card.offsetLeft - (track.clientWidth - card.clientWidth) / 2,
      behavior: 'smooth',
    });
  }, []);

  const nearestIndex = useCallback((): number => {
    const track = trackRef.current;
    if (!track) return 0;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const dist = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }, []);

  const onScroll = () => {
    if (raf.current !== null) return;
    raf.current = window.requestAnimationFrame(() => {
      raf.current = null;
      setActive(nearestIndex());
    });
  };

  useEffect(
    () => () => {
      if (raf.current !== null) window.cancelAnimationFrame(raf.current);
    },
    [],
  );

  // Avanço automático. O relógio recomeça sempre que o bilhete ativo muda (também quando o
  // utilizador desliza) e fica em pausa enquanto o rato está por cima, ao tocar ou ao arrastar.
  useEffect(() => {
    if (paused || dragging) return undefined;
    const t = window.setTimeout(() => scrollToIndex((active + 1) % count), AUTO_MS);
    return () => window.clearTimeout(t);
  }, [active, paused, dragging, count, scrollToIndex]);

  // Arrastar com o rato (no telemóvel o deslize é nativo)
  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !trackRef.current) return;
    drag.current = { down: true, startX: e.clientX, startLeft: trackRef.current.scrollLeft, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const d = drag.current;
    const track = trackRef.current;
    if (!d.down || !track) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 6) {
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved) track.scrollLeft = d.startLeft - dx;
  };

  const endDrag = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    if (d.moved) {
      setDragging(false);
      scrollToIndex(nearestIndex());
    }
  };

  const step = (dir: -1 | 1) => scrollToIndex(Math.min(count - 1, Math.max(0, active + dir)));

  const current = events[active] ?? events[0];
  const fromPrice = Math.min(...current.lots.map((l) => l.price));

  return (
    <div
      className="[--card:10.5rem] sm:[--card:12rem] lg:[--card:12.5rem]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
      onTouchCancel={() => setPaused(false)}
      onFocus={(e) => {
        if ((e.target as HTMLElement).matches(':focus-visible')) setPaused(true);
      }}
      onBlur={() => setPaused(false)}
    >
      <div className="relative">
        <ul
          ref={trackRef}
          onScroll={onScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClickCapture={(e) => {
            if (drag.current.moved) {
              e.preventDefault();
              e.stopPropagation();
              drag.current.moved = false;
            }
          }}
          aria-label="Bilhetes à venda"
          className={`no-scrollbar relative m-0 flex list-none select-none items-center gap-4 overflow-x-auto p-0 px-[calc(50%-var(--card)/2)] py-6 ${
            dragging ? 'cursor-grabbing snap-none' : 'cursor-grab snap-x snap-mandatory'
          }`}
        >
          {events.map((ev, i) => {
            const isActive = i === active;
            const from = Math.min(...ev.lots.map((l) => l.price));
            return (
              <li
                key={ev.id}
                className={`w-[var(--card)] shrink-0 snap-center transition-all duration-500 ${
                  isActive ? 'scale-100 opacity-100' : 'scale-[0.86] opacity-55'
                }`}
              >
                <button
                  type="button"
                  onClick={() => (isActive ? onSelect(ev) : scrollToIndex(i))}
                  aria-label={`${ev.title}, ${formatLongDate(ev.date)}. Desde ${formatPrice(from)}. ${
                    isActive ? 'Abrir reserva' : 'Mostrar este bilhete'
                  }`}
                  className="group block w-full overflow-hidden bg-black text-left shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-2xl focus-visible:outline-black"
                >
                  <div className="aspect-[4/5] w-full">
                    <Poster
                      lines={ev.posterLines}
                      tag={ev.category}
                      date={formatLongDate(ev.date)}
                      variant={ev.variant} src={ev.poster}
                    />
                  </div>
                  <span className="flex items-center justify-between gap-2 bg-black px-3 py-2.5 text-[11px] font-extrabold uppercase tracking-wide text-white transition-all duration-300 group-hover:bg-brand">
                    <span>Desde {formatPrice(from)}</span>
                    <span>Reservar</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-paper to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-paper to-transparent"
          aria-hidden="true"
        />
      </div>

      {/* Bilhete em destaque */}
      <div className="mt-2 flex flex-col gap-4 border-t-2 border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-wider text-brand">{current.category}</p>
          <p className="mt-1 font-display text-xl uppercase leading-tight sm:text-2xl">{current.title}</p>
          <p className="mt-1 text-sm text-black/65">
            {formatLongDate(current.date)} · {current.time} · {current.venue}
          </p>
        </div>
        <button type="button" onClick={() => onSelect(current)} className="btn btn-red shrink-0">
          Reservar · desde {formatPrice(fromPrice)}
        </button>
      </div>

      {/* Controlos */}
      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Bilhete anterior"
          disabled={active === 0}
          onClick={() => step(-1)}
          className="flex h-10 w-10 items-center justify-center border-2 border-black transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-black"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="flex items-center gap-1" role="group" aria-label="Escolher bilhete">
          {events.map((ev, i) => (
            <button
              key={ev.id}
              type="button"
              aria-label={`Ver ${ev.title}`}
              aria-current={i === active}
              onClick={() => scrollToIndex(i)}
              className="group flex h-8 items-center px-1"
            >
              <span
                className={`block h-1.5 transition-all duration-300 group-hover:bg-brand ${
                  i === active ? 'w-9 bg-brand' : 'w-4 bg-black/25'
                }`}
              />
            </button>
          ))}
        </div>

        <button
          type="button"
          aria-label="Próximo bilhete"
          disabled={active === count - 1}
          onClick={() => step(1)}
          className="flex h-10 w-10 items-center justify-center border-2 border-black transition-all duration-300 hover:scale-110 hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:scale-100 disabled:hover:bg-transparent disabled:hover:text-black"
        >
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

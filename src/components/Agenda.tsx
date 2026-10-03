import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import type { EventItem } from '../types';
import { formatDay, formatMonth, formatPrice, formatWeekday } from '../lib/format';

interface AgendaProps {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
}

export default function Agenda({ events, onSelect }: AgendaProps) {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section id="eventos" aria-labelledby="agenda-titulo" className="bg-paper py-20 text-black sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="agenda-titulo"
          title="Próximos eventos"
          intro="A agenda dos próximos concertos e festivais da Nova Era na Beira."
        />
        <ul className="mt-12 space-y-4">
          {sorted.map((ev, i) => {
            const from = Math.min(...ev.lots.map((l) => l.price));
            return (
              <Reveal as="li" key={ev.id} delay={i * 80} direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-4 border-l-8 border-brand bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-2xl sm:grid-cols-[auto_1fr_auto] sm:gap-x-8 sm:p-5">
                  <div className="w-20 bg-black py-3 text-center text-white sm:w-24">
                    <p className="font-display text-4xl leading-none sm:text-5xl">{formatDay(ev.date)}</p>
                    <p className="mt-1 text-sm font-extrabold uppercase tracking-widest text-brand">
                      {formatMonth(ev.date)}
                    </p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-extrabold uppercase tracking-wider text-black/55">{ev.category}</p>
                    <h3 className="display mt-1 text-2xl text-brand sm:text-3xl">{ev.title}</h3>
                    <p className="mt-2 text-sm font-semibold text-black/70">
                      <span className="capitalize">{formatWeekday(ev.date)}</span>, {ev.time} · {ev.venue}
                    </p>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end sm:justify-center">
                    <p className="text-sm font-bold">
                      Desde <span className="font-display text-xl text-brand">{formatPrice(from)}</span>
                    </p>
                    <button type="button" onClick={() => onSelect(ev)} className="btn btn-red">
                      Reservar
                    </button>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

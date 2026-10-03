import Reveal from './Reveal';
import TicketCarousel from './TicketCarousel';
import type { EventItem } from '../types';

interface BrandBlockProps {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
}

const STATS = [
  { value: '20', label: 'Anos de palco' },
  { value: '50+', label: 'Shows e festivais' },
  { value: 'Milhares', label: 'De vidas tocadas' },
];

export default function BrandBlock({ events, onSelect }: BrandBlockProps) {
  return (
    <section
      id="bilheteira"
      aria-labelledby="marca-titulo"
      className="relative overflow-hidden bg-white py-20 text-black sm:py-24"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:px-8">
        {/* Coluna esquerda: texto institucional */}
        <Reveal direction="left" className="min-w-0">
          <p className="inline-block bg-black px-3 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white">
            Beira · Moçambique
          </p>
          <h2 id="marca-titulo" className="display mt-5 text-5xl text-brand sm:text-6xl xl:text-7xl">
            A Marca das
            <br />
            Gerações
          </h2>
          <p className="mt-5 text-xl font-extrabold uppercase tracking-wide sm:text-2xl">Nova Era Entretenimento</p>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-black/70 sm:text-lg">
            Há vinte anos que a Nova Era enche a Beira de música. Começámos em salões pequenos e chegámos aos grandes
            concertos e festivais de praia, sempre com o mesmo cuidado com quem sobe ao palco e com quem canta na
            plateia.
          </p>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-black/70 sm:text-lg">
            Escolha o seu evento, reserve o bilhete e levante-o num ponto autorizado da cidade.
          </p>

          <dl className="mt-9 grid max-w-lg grid-cols-3 gap-4 border-l-4 border-brand pl-5">
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd className="font-display text-2xl leading-none text-brand sm:text-3xl">{s.value}</dd>
                <p className="mt-1.5 text-xs font-semibold leading-snug text-black/65 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </dl>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <button type="button" className="btn btn-red" onClick={() => onSelect(events[0])}>
              Reservar bilhete
            </button>
            <a href="#eventos" className="btn btn-outline">
              Próximos eventos
            </a>
            <a href="#historia" className="btn btn-outline">
              Nossa história
            </a>
          </div>
        </Reveal>

        {/* Coluna direita: carrossel de bilhetes */}
        <Reveal direction="right" delay={120} className="min-w-0">
          <div className="brackets bg-paper px-4 pb-6 pt-6 shadow-sm transition-all duration-300 hover:shadow-xl sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <h3 className="display text-2xl text-brand sm:text-3xl">Bilhetes à venda</h3>
              <p className="text-sm font-semibold text-black/60">{events.length} eventos disponíveis</p>
            </div>
            <p className="mt-1 text-sm text-black/65">
              Os bilhetes passam sozinhos. Deslize para ver mais e toque no bilhete para reservar.
            </p>
            <TicketCarousel events={events} onSelect={onSelect} />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

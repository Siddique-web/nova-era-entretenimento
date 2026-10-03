import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { PAST_EDITIONS } from '../data/past';

export default function PastEditions() {
  return (
    <section id="edicoes" aria-labelledby="edicoes-titulo" className="bg-paper py-20 text-black sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="edicoes-titulo"
          title="Edições anteriores"
          intro="Alguns dos grandes cartazes que já passaram pelo palco da Nova Era na Beira."
        />
        <ul className="mt-12 grid list-none grid-cols-2 items-start gap-4 p-0 sm:grid-cols-3 sm:gap-6">
          {PAST_EDITIONS.map((ed, i) => (
            <Reveal as="li" key={ed.id} direction="zoom" delay={i * 90}>
              <figure className="m-0 overflow-hidden bg-black shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl">
                <img src={ed.poster} alt={`Cartaz: ${ed.title}`} loading="lazy" className="block h-auto w-full" />
                <figcaption className="border-t-4 border-brand bg-black px-3 py-3 text-white">
                  <p className="text-xs font-extrabold uppercase leading-snug tracking-wide sm:text-sm">{ed.title}</p>
                  <p className="mt-1 text-[11px] font-semibold text-white/65 sm:text-xs">{ed.date}</p>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { NEWS } from '../data/news';
import type { EventItem } from '../types';

interface NewsProps {
  events: EventItem[];
  onSelect: (event: EventItem) => void;
}

export default function News({ events, onSelect }: NewsProps) {
  return (
    <section id="noticias" aria-labelledby="noticias-titulo" className="bg-white py-20 text-black sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="noticias-titulo"
          title="Notícias"
          intro="Anúncios, bilheteira e novidades dos palcos da Nova Era na Beira."
        />
        <div className="mt-12 space-y-8">
          {NEWS.map((item, i) => {
            const event = item.eventId ? events.find((e) => e.id === item.eventId) : undefined;
            return (
              <div key={item.id} id={`noticia-${item.id}`} className="scroll-mt-28">
              <Reveal as="article" direction={i % 2 === 0 ? 'left' : 'right'}>
                <div className="grid gap-5 border-l-8 border-brand bg-paper p-4 transition-all duration-300 hover:shadow-xl sm:grid-cols-[18rem_1fr] sm:gap-8 sm:p-6 lg:grid-cols-[20rem_1fr]">
                  <div className="space-y-3 self-start">
                    {item.images.map((img) => (
                      <img key={img.src} src={img.src} alt={img.alt} loading="lazy" className="block h-auto w-full bg-black" />
                    ))}
                  </div>
                  <div className="flex min-w-0 flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="bg-brand px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">
                        {item.tag}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-black/55">{item.date}</span>
                    </div>
                    <h3 className="display mt-4 text-2xl sm:text-3xl lg:text-4xl">{item.title}</h3>
                    <p className="mt-4 max-w-2xl text-base leading-relaxed text-black/75">{item.excerpt}</p>
                    {event && (
                      <div className="mt-6">
                        <button type="button" onClick={() => onSelect(event)} className="btn btn-red">
                          Reservar bilhete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

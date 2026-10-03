import Photo from './Photo';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { CHAPTERS, MILESTONES } from '../data/history';

export default function History() {
  return (
    <>
      <section id="historia" aria-labelledby="historia-titulo" className="bg-white py-20 text-black sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="historia-titulo"
            title="Nossa história"
            intro="Vinte anos de palco, de gente e de noites inesquecíveis. Assim se escreveu a Nova Era na Beira."
          />

          <div className="mt-14 space-y-8 sm:space-y-12">
            {CHAPTERS.map((chapter, i) => {
              const reversed = i % 2 === 1;
              return (
                <Reveal key={chapter.id}>
                  <article
                    aria-labelledby={`cap-${chapter.id}`}
                    className="grid items-center gap-8 border-t-8 border-brand bg-white p-5 shadow-[0_10px_40px_-12px_rgba(0,0,0,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_60px_-14px_rgba(244,13,13,0.35)] sm:p-8 lg:grid-cols-2 lg:gap-14 lg:p-10"
                  >
                    <div className={reversed ? 'lg:order-2' : ''}>
                      <p className="inline-block bg-black px-3 py-1.5 text-sm font-extrabold tracking-wider text-white">
                        {chapter.period}
                      </p>
                      <h3 id={`cap-${chapter.id}`} className="display mt-4 text-3xl text-brand sm:text-4xl">
                        {chapter.title}
                      </h3>
                      <div className="mt-5 space-y-4 text-base leading-relaxed text-black/75 sm:text-lg">
                        {chapter.paragraphs.map((p) => (
                          <p key={p}>{p}</p>
                        ))}
                      </div>
                      <ul className="mt-6 space-y-2.5 border-l-4 border-brand pl-4">
                        {chapter.highlights.map((h) => (
                          <li key={h} className="text-sm font-bold uppercase tracking-wide">
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className={`grid grid-cols-5 gap-3 ${reversed ? 'lg:order-1' : ''}`}>
                      <Photo
                        caption={chapter.photos[0].caption}
                        src={chapter.photos[0].src}
                        tone={i * 2}
                        className="col-span-3 aspect-[3/4]"
                      />
                      <Photo
                        caption={chapter.photos[1].caption}
                        src={chapter.photos[1].src}
                        tone={i * 2 + 1}
                        className="col-span-2 mt-10 aspect-[3/5]"
                      />
                    </div>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Linha do tempo em faixa preta, para dar ritmo à página */}
      <section aria-labelledby="timeline-titulo" className="bg-black py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading id="timeline-titulo" title="Linha do tempo" onDark />
          <ol className="relative mt-12 border-l-4 border-white/20">
            {MILESTONES.map((m) => (
              <Reveal as="li" key={m.year} direction="left" className="group relative pb-10 pl-8 last:pb-0 sm:pl-12">
                <span
                  className="absolute -left-[14px] top-1.5 h-6 w-6 border-4 border-black bg-brand transition-all duration-300 group-hover:scale-125"
                  aria-hidden="true"
                />
                <p className="font-display text-3xl text-brand sm:text-4xl">{m.year}</p>
                <h3 className="mt-1 text-lg font-extrabold uppercase tracking-wide">{m.title}</h3>
                <p className="mt-1 max-w-xl text-white/70">{m.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}

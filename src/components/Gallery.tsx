import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { GALLERY } from '../data/gallery';

export default function Gallery() {
  const [open, setOpen] = useState<number | null>(null);
  const count = GALLERY.length;

  const close = useCallback(() => setOpen(null), []);
  const go = useCallback((n: number) => setOpen(((n % count) + count) % count), [count]);

  useEffect(() => {
    if (open === null) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') go(open - 1);
      if (e.key === 'ArrowRight') go(open + 1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, go]);

  const current = open !== null ? GALLERY[open] : null;

  return (
    <section id="galeria" aria-labelledby="galeria-titulo" className="bg-white py-20 text-black sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="galeria-titulo"
          title="Galeria"
          intro="A chegada dos artistas, o staff uniformizado a postos e a energia de quem enche a plateia. Toque numa foto para a ver em ecrã inteiro."
        />

        {/* Mosaico: cada foto aparece inteira, com a sua proporção original */}
        <div className="mt-12 columns-2 gap-3 sm:gap-4 lg:columns-3">
          {GALLERY.map((item, i) => (
            <Reveal key={item.id} direction="zoom" delay={(i % 3) * 80} className="mb-3 break-inside-avoid sm:mb-4">
              <figure className="group m-0 bg-paper">
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  aria-label={`Ampliar: ${item.caption}`}
                  className="block w-full cursor-zoom-in overflow-hidden bg-black"
                >
                  <img
                    src={item.src}
                    alt={item.caption}
                    loading="lazy"
                    className="block h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </button>
                <figcaption className="border-b-4 border-brand px-3 py-2.5 text-xs font-bold leading-snug sm:text-sm">
                  {item.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>

      {current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.caption}
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={close}
        >
          <button
            type="button"
            onClick={close}
            aria-label="Fechar"
            className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center bg-white text-black transition-all duration-300 hover:bg-brand hover:text-white"
          >
            <X size={22} />
          </button>
          <div className="flex min-h-0 flex-1 items-center justify-center p-4 sm:px-20">
            <img
              src={current.src}
              alt={current.caption}
              className="max-h-full max-w-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <p className="px-4 pb-5 text-center text-sm font-bold text-white" onClick={(e) => e.stopPropagation()}>
            {current.caption} <span className="text-white/50">· {(open ?? 0) + 1}/{count}</span>
          </p>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={(e) => {
              e.stopPropagation();
              go((open ?? 0) - 1);
            }}
            className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-white bg-black/50 text-white transition-all duration-300 hover:border-brand hover:bg-brand sm:left-5"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            aria-label="Foto seguinte"
            onClick={(e) => {
              e.stopPropagation();
              go((open ?? 0) + 1);
            }}
            className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center border-2 border-white bg-black/50 text-white transition-all duration-300 hover:border-brand hover:bg-brand sm:right-5"
          >
            <ChevronRight size={22} />
          </button>
        </div>
      )}
    </section>
  );
}

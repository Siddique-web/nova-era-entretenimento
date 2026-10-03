import { useEffect, useRef, useState, type ReactNode } from 'react';

type Direction = 'up' | 'left' | 'right' | 'zoom';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Atraso em milissegundos, útil para entradas escalonadas. */
  delay?: number;
  direction?: Direction;
  as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * Faz o conteúdo aparecer com suavidade (opacidade + deslocamento) quando
 * entra no ecrã durante o scroll para baixo. Repete-se sempre: se o elemento sair
 * por baixo (o utilizador subiu), volta a esconder-se e aparece de novo na próxima descida.
 */
export default function Reveal({ children, className = '', delay = 0, direction = 'up', as = 'div' }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
          } else {
            // Só volta a esconder quando está abaixo do ecrã (scroll para cima);
            // se ficou para cima (scroll para baixo) continua visível.
            const viewH = entry.rootBounds?.height ?? window.innerHeight;
            if (entry.boundingClientRect.top > viewH * 0.5) setVisible(false);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as 'div';

  return (
    <Tag
      ref={ref}
      className={`reveal reveal-${direction} ${visible ? 'is-visible' : ''} ${className}`}
      style={delay && visible ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}

import type { ReactNode } from 'react';
import Reveal from './Reveal';

interface SectionHeadingProps {
  id?: string;
  title: string;
  intro?: ReactNode;
  /** Use em secções de fundo preto: o título passa a branco. */
  onDark?: boolean;
  className?: string;
}

export default function SectionHeading({ id, title, intro, onDark = false, className = '' }: SectionHeadingProps) {
  return (
    <Reveal className={`max-w-3xl ${className}`}>
      <h2 id={id} className={`display text-4xl sm:text-5xl lg:text-6xl ${onDark ? 'text-white' : 'text-brand'}`}>
        {title}
      </h2>
      <div className={`mt-4 h-1.5 w-20 ${onDark ? 'bg-brand' : 'bg-black'}`} aria-hidden="true" />
      {intro && (
        <p className={`mt-5 max-w-2xl text-base leading-relaxed sm:text-lg ${onDark ? 'text-white/75' : 'text-black/70'}`}>
          {intro}
        </p>
      )}
    </Reveal>
  );
}

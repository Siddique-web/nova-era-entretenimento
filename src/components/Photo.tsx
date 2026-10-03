import { Camera } from 'lucide-react';

interface PhotoProps {
  caption: string;
  src?: string;
  position?: string;
  tone?: number;
  className?: string;
}

const ANGLES = [135, 200, 250, 315, 160, 20];

/**
 * Fotografia com legenda. Sem "src", mostra um espaço reservado nas cores da marca.
 */
export default function Photo({ caption, src, position, tone = 0, className = '' }: PhotoProps) {
  const angle = ANGLES[tone % ANGLES.length];
  return (
    <figure className={`group relative m-0 overflow-hidden bg-ink-soft ${className}`}>
      {src ? (
        <img src={src} alt={caption} loading="lazy" className="h-full w-full object-cover" style={position ? { objectPosition: position } : undefined} />
      ) : (
        <div
          role="img"
          aria-label={caption}
          className="flex h-full w-full items-center justify-center"
          style={{
            background: `repeating-linear-gradient(${angle}deg, rgba(255,255,255,0.05) 0 2px, transparent 2px 14px), linear-gradient(${angle}deg, #000 0%, #2a0000 55%, #B80808 130%)`,
          }}
        >
          <Camera size={34} className="text-white/25" aria-hidden="true" />
        </div>
      )}
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/80 to-transparent px-3 pb-3 pt-10 text-xs font-semibold leading-snug text-white sm:text-sm">
        {caption}
      </figcaption>
    </figure>
  );
}

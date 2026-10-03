import { useId } from 'react';
import type { PosterVariant } from '../types';

interface PosterProps {
  lines: string[];
  tag: string;
  date: string;
  variant: PosterVariant;
  src?: string;
  className?: string;
}

/**
 * Cartaz gerado em SVG (vermelho / preto / branco).
 * Substitua por imagens reais quando tiver os cartazes oficiais.
 */
export default function Poster({ lines, tag, date, variant, src, className = '' }: PosterProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const n = lines.length;
  const lastY = 313;

  if (src) {
    return (
      <img
        src={src}
        alt={`Cartaz: ${lines.join(' ')}`}
        loading="lazy"
        draggable={false}
        className={`block h-full w-full bg-black object-contain ${className}`}
      />
    );
  }

  return (
    <svg
      viewBox="0 0 300 375"
      preserveAspectRatio="xMidYMid slice"
      className={`block h-full w-full ${className}`}
      role="img"
      aria-label={`Cartaz: ${lines.join(' ')}`}
    >
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="36%" r="75%">
          <stop offset="0" stopColor="#FF2A1F" />
          <stop offset="0.5" stopColor="#B80808" />
          <stop offset="1" stopColor="#000000" />
        </radialGradient>
        <linearGradient id={`fade${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.92" />
        </linearGradient>
      </defs>

      <rect width="300" height="375" fill={`url(#bg${uid})`} />

      {variant === 'sun' && (
        <g>
          <circle cx="150" cy="150" r="92" fill="#fff" opacity="0.92" />
          <circle cx="150" cy="150" r="118" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
          <circle cx="150" cy="150" r="146" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="0" y={190 + i * 14} width="300" height={4 + i * 2} fill="#000" opacity={0.85} />
          ))}
        </g>
      )}

      {variant === 'rings' && (
        <g fill="none" stroke="#fff">
          {[30, 60, 90, 120, 150].map((r, i) => (
            <circle key={r} cx="150" cy="140" r={r} strokeWidth={i % 2 === 0 ? 4 : 1.5} opacity={0.9 - i * 0.14} />
          ))}
          <circle cx="150" cy="140" r="14" fill="#fff" stroke="none" />
        </g>
      )}

      {variant === 'stripes' && (
        <g transform="rotate(-18 150 150)">
          {[-1, 0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x="-60" y={20 + i * 46} width="420" height="22" fill={i % 2 ? '#fff' : '#000'} opacity={i % 2 ? 0.9 : 0.7} />
          ))}
        </g>
      )}

      {variant === 'diagonal' && (
        <g>
          <polygon points="0,0 190,0 0,260" fill="#000" opacity="0.8" />
          <polygon points="300,60 300,300 80,300" fill="#fff" opacity="0.92" />
          <polygon points="300,60 300,110 215,300 150,300" fill="#F40D0D" opacity="0.9" />
        </g>
      )}

      {variant === 'burst' && (
        <g>
          {Array.from({ length: 18 }).map((_, i) => (
            <polygon
              key={i}
              points="150,150 -40,-30 -10,-60"
              fill={i % 2 ? '#fff' : '#000'}
              opacity={i % 2 ? 0.85 : 0.55}
              transform={`rotate(${i * 20} 150 150)`}
            />
          ))}
          <circle cx="150" cy="150" r="46" fill="#000" />
          <circle cx="150" cy="150" r="46" fill="none" stroke="#fff" strokeWidth="4" />
          <text x="150" y="164" textAnchor="middle" fontFamily="'Alfa Slab One', Georgia, serif" fontSize="40" fill="#fff">
            NË
          </text>
        </g>
      )}

      <rect x="0" y="170" width="300" height="205" fill={`url(#fade${uid})`} />

      <text x="20" y="32" fontFamily="Archivo, sans-serif" fontWeight="800" fontSize="10" letterSpacing="2.5" fill="#fff">
        {tag.toUpperCase()}
      </text>
      <text x="280" y="32" textAnchor="end" fontFamily="'Alfa Slab One', Georgia, serif" fontSize="14" fill="#fff">
        NË
      </text>

      {lines.map((line, i) => {
        const size = Math.min(46, 260 / (line.length * 0.74));
        return (
          <text
            key={`${line}${i}`}
            x="20"
            y={lastY - (n - 1 - i) * 50}
            fontFamily="'Alfa Slab One', Georgia, serif"
            fontSize={size}
            fill="#fff"
          >
            {line}
          </text>
        );
      })}

      <rect x="20" y="339" width="34" height="4" fill="#F40D0D" />
      <text x="20" y="361" fontFamily="Archivo, sans-serif" fontWeight="700" fontSize="11" letterSpacing="1.5" fill="#fff">
        {date}
      </text>
    </svg>
  );
}

interface LogoProps {
  className?: string;
}

/**
 * Logotipo NË em badge estruturado, com fundo preto sólido
 * e filete vermelho na base para manter o contraste em fundos claros.
 */
export default function Logo({ className = '' }: LogoProps) {
  return (
    <span
      className={`inline-flex h-[52px] items-center justify-center border-b-4 border-brand bg-black px-2.5 py-1.5 ${className}`}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-white.png`}
        alt="Nova Era Entretenimento — logotipo"
        className="h-full w-auto"
        draggable={false}
      />
    </span>
  );
}

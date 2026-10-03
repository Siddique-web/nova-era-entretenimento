import { useEffect, useState } from 'react';

const SHOW_MS = 2000; // o logotipo fica visível 2 segundos
const FADE_MS = 1000; // depois desaparece com um fade out suave

/**
 * Introdução leve: logotipo Nova Era 20 Anos em ecrã inteiro durante 2 segundos,
 * seguido de fade out suave. Aparece sempre que o site é aberto.
 */
export default function Splash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const leave = window.setTimeout(() => setLeaving(true), SHOW_MS);
    const done = window.setTimeout(() => setVisible(false), SHOW_MS + FADE_MS);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(done);
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (!visible) document.body.style.overflow = '';
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="A carregar o site da Nova Era Entretenimento"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-brand transition-opacity ease-in-out ${
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      }`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
    >
      <img
        src={`${import.meta.env.BASE_URL}logo-20anos-branco.png`}
        alt="Nova Era Entretenimento, 20 Anos"
        className="animate-splash-logo h-auto w-[min(72vw,420px)] select-none"
        draggable={false}
      />
    </div>
  );
}

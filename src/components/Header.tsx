import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NAV_LINKS } from '../data/site';
import { useScrolled } from '../hooks/useScrolled';

export default function Header() {
  const scrolled = useScrolled();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 border-b-4 border-brand bg-white text-black transition-all duration-300 ${
        scrolled || open ? 'shadow-lg' : 'shadow-none'
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="#inicio"
          aria-label="Nova Era Entretenimento — início"
          onClick={() => setOpen(false)}
          className="transition-all duration-300 hover:scale-105"
        >
          <span className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}logo-20anos-circulo.png`}
              alt="Nova Era, 20 Anos"
              width={56}
              height={56}
              className="h-12 w-12 shrink-0 sm:h-14 sm:w-14"
              draggable={false}
            />
            {/* Mesma família tipográfica do logotipo: sans geométrica pesada + linha espaçada */}
            <span className="flex flex-col font-logo uppercase text-brand">
              <span className="text-[19px] font-extrabold leading-none tracking-tight sm:text-2xl xl:text-[27px]">Nova Era</span>
              <span className="mt-1 text-[7.5px] font-semibold leading-none tracking-[0.34em] sm:text-[9px] xl:text-[10px]">
                Entretenimento
              </span>
            </span>
          </span>
        </a>

        <nav aria-label="Navegação principal" className="hidden xl:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="relative block whitespace-nowrap px-2.5 py-2 text-[13px] font-extrabold uppercase tracking-wider text-black transition-all duration-300 after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-[3px] after:origin-left after:scale-x-0 after:bg-brand after:transition-transform after:duration-300 hover:text-brand hover:after:scale-x-100"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <a href="#bilheteira" className="btn btn-red hidden whitespace-nowrap !py-2.5 sm:inline-flex">
            Comprar bilhete
          </a>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border-2 border-black transition-all duration-300 hover:bg-black hover:text-white xl:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <nav
          id="menu-mobile"
          aria-label="Menu móvel"
          className="fixed inset-x-0 bottom-0 top-[80px] animate-fade overflow-y-auto bg-white px-4 pb-10 pt-4 xl:hidden"
        >
          <ul className="divide-y divide-black/10">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block py-4 font-display text-2xl uppercase transition-all duration-300 hover:translate-x-2 hover:text-brand"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <a href="#bilheteira" onClick={() => setOpen(false)} className="btn btn-red mt-6 w-full">
            Comprar bilhete
          </a>
        </nav>
      )}
    </header>
  );
}

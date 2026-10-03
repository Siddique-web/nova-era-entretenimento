import { Facebook, Instagram, Mail, MapPin, Phone, Youtube } from 'lucide-react';
import Logo from './Logo';
import Reveal from './Reveal';
import { NAV_LINKS, SITE } from '../data/site';

const SOCIALS = [
  { label: 'Instagram', href: SITE.socials.instagram, Icon: Instagram },
  { label: 'Facebook', href: SITE.socials.facebook, Icon: Facebook },
  { label: 'YouTube', href: SITE.socials.youtube, Icon: Youtube },
];

export default function Footer() {
  return (
    <footer className="border-t-4 border-brand bg-black">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-[1.3fr_1fr_1.2fr] lg:px-8">
        <Reveal>
          <Logo />
          <p className="mt-5 max-w-xs text-white/70">
            {SITE.tagline}. Concertos, festivais e noites que ficam na memória de gerações.
          </p>
          <ul className="mt-6 flex gap-3">
            {SOCIALS.map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${label} da Nova Era`}
                  className="flex h-11 w-11 items-center justify-center border-2 border-white text-white transition-all duration-300 hover:-translate-y-1 hover:scale-110 hover:border-brand hover:bg-brand"
                >
                  <Icon size={20} />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={100}>
          <nav aria-label="Links rápidos">
            <h2 className="font-display text-xl uppercase text-white">Links rápidos</h2>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    className="inline-block font-semibold text-white/75 transition-all duration-300 hover:translate-x-1 hover:text-brand"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <Reveal delay={200}>
          <h2 className="font-display text-xl uppercase text-white">Contactos</h2>
          <ul className="mt-5 space-y-4 text-white/75">
            <li className="flex gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              {SITE.address}
            </li>
            <li className="flex gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <a
                href={`tel:${SITE.phone.replace(/\s/g, '')}`}
                className="transition-all duration-300 hover:text-white"
              >
                {SITE.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              <a href={`mailto:${SITE.email}`} className="transition-all duration-300 hover:text-white">
                {SITE.email}
              </a>
            </li>
          </ul>
        </Reveal>
      </div>

      <div className="border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Nova Era Entretenimento. Todos os direitos reservados.</p>
          <p>Beira, Moçambique</p>
        </div>
      </div>
    </footer>
  );
}

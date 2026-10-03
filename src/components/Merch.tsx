import { useState } from 'react';
import { MessageCircle, Shirt } from 'lucide-react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { MERCH } from '../data/merch';
import { SITE } from '../data/site';
import { formatPrice, whatsappLink } from '../lib/format';

function MerchCard({ item }: { item: (typeof MERCH)[number] }) {
  const [size, setSize] = useState(item.sizes[0]);
  const [colorId, setColorId] = useState(item.colors?.[0]?.id ?? '');
  const color = item.colors?.find((c) => c.id === colorId);
  const photo = color?.src ?? item.src;
  const sizeId = `tam-${item.id}`;
  const message = `Olá, Nova Era! Quero encomendar: ${item.name}${color ? `, cor ${color.label}` : ''} (${size}) — ${formatPrice(item.price)}.`;

  return (
    <article className="group flex h-full flex-col border-b-8 border-brand bg-white text-black shadow-md transition-all duration-300 hover:-translate-y-2 hover:scale-[1.03] hover:shadow-2xl">
      <div className="relative aspect-[16/15] overflow-hidden bg-black">
        {photo ? (
          // Foto inteira (frente e costas), sem cortes
          <img
            key={photo}
            src={photo}
            alt={color ? `${item.name}, cor ${color.label}` : item.name}
            loading="lazy"
            className="h-full w-full animate-fade object-contain"
          />
        ) : (
          <div
            role="img"
            aria-label={item.name}
            className="flex h-full w-full flex-col items-center justify-center"
            style={{ background: 'radial-gradient(circle at 50% 40%, #F40D0D 0%, #6e0000 55%, #000 100%)' }}
          >
            <Shirt size={86} strokeWidth={1.4} className="text-white transition-all duration-300 group-hover:scale-110" aria-hidden="true" />
            <span className="mt-2 font-display text-2xl text-white">NË</span>
          </div>
        )}
        {item.tag && (
          <span className="absolute left-0 top-4 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-black">
            {item.tag}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="display text-2xl text-brand">{item.name}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-black/70">{item.description}</p>
        <p className="mt-4 font-display text-2xl">{formatPrice(item.price)}</p>

        {item.colors && (
          <fieldset className="mt-4 border-0 p-0">
            <legend className="text-xs font-extrabold uppercase tracking-wider">
              Cor: <span className="text-brand">{color?.label}</span>
            </legend>
            <div className="mt-2 flex gap-3">
              {item.colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColorId(c.id)}
                  aria-pressed={c.id === colorId}
                  aria-label={`Cor ${c.label}`}
                  title={c.label}
                  className={`h-9 w-9 rounded-full border-2 border-black/25 transition-all duration-300 hover:scale-110 ${
                    c.id === colorId ? 'ring-2 ring-brand ring-offset-2' : ''
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </fieldset>
        )}

        <label htmlFor={sizeId} className="mt-4 text-xs font-extrabold uppercase tracking-wider">
          Tamanho
        </label>
        <select
          id={sizeId}
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="mt-1.5 border-2 border-black bg-white px-3 py-2.5 text-sm font-semibold transition-all duration-300 focus:border-brand"
        >
          {item.sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <a
          href={whatsappLink(SITE.whatsapp, message)}
          target="_blank"
          rel="noreferrer"
          className="btn btn-red mt-5"
        >
          <MessageCircle size={18} aria-hidden="true" /> Encomendar
        </a>
      </div>
    </article>
  );
}

export default function Merch() {
  return (
    <section id="merch" aria-labelledby="merch-titulo" className="bg-paper py-20 text-black sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id="merch-titulo"
          title="Merch oficial"
          intro="Vista a marca. Escolha a cor e o tamanho e envie a encomenda por WhatsApp; confirmamos o levantamento na Beira."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {MERCH.map((item, i) => (
            <Reveal key={item.id} delay={i * 100}>
              <MerchCard item={item} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

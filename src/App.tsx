import { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import HeroSlideshow from './components/HeroSlideshow';
import BrandBlock from './components/BrandBlock';
import Agenda from './components/Agenda';
import News from './components/News';
import History from './components/History';
import PastEditions from './components/PastEditions';
import Gallery from './components/Gallery';
import Merch from './components/Merch';
import Footer from './components/Footer';
import TicketModal from './components/TicketModal';
import Splash from './components/Splash';
import ReservationLookup from './components/ReservationLookup';
import AdminPanel from './components/AdminPanel';
import { ADMIN_HASH } from './data/site';
import { EVENTS } from './data/events';
import { NEWS } from './data/news';
import type { EventItem } from './types';

export default function App() {
  const [selected, setSelected] = useState<EventItem | null>(null);
  const close = useCallback(() => setSelected(null), []);
  const [isAdmin, setIsAdmin] = useState(() => window.location.hash === ADMIN_HASH);

  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash === ADMIN_HASH);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  if (isAdmin) return <AdminPanel />;

  return (
    <>
      <Splash />
      <a
        href="#bilheteira"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:bg-white focus:px-4 focus:py-2 focus:font-bold focus:text-black"
      >
        Saltar para a bilheteira
      </a>
      <Header />
      <main>
        <HeroSlideshow news={NEWS} events={EVENTS} onBuy={setSelected} />
        <BrandBlock events={EVENTS} onSelect={setSelected} />
        <Agenda events={EVENTS} onSelect={setSelected} />
        <News events={EVENTS} onSelect={setSelected} />
        <ReservationLookup />
        <History />
        <PastEditions />
        <Gallery />
        <Merch />
      </main>
      <Footer />
      {selected && <TicketModal key={selected.id} event={selected} onClose={close} />}
    </>
  );
}

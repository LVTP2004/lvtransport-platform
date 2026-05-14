import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type NavId = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact';

const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';

const airports = ['Brussels Airport', 'Charleroi', 'Schiphol', 'Eindhoven', 'Antwerp Airport'];

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [estimate, setEstimate] = useState({ from: 'Antwerpen Centrum', destination: 'Brussels Airport', passengers: 2 });
  const [booking, setBooking] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', passengers: 1, notes: '' });
  const [activeStatus, setActiveStatus] = useState(0);

  const statuses = ['Boeking bevestigd', 'Chauffeur toegewezen', 'Onderweg naar pickup', 'Passagier aan boord', 'Aankomst op bestemming'];

  useEffect(() => {
    const timer = setInterval(() => setActiveStatus((v) => (v + 1) % statuses.length), 2600);
    return () => clearInterval(timer);
  }, []);

  const distance = useMemo(() => {
    const seed = (estimate.from.length + estimate.destination.length) % 28;
    return 12 + seed;
  }, [estimate]);
  const price = useMemo(() => Math.round(38 + distance * 2.9 + estimate.passengers * 4), [distance, estimate.passengers]);

  const scrollTo = (id: NavId) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false);
  };

  const navItems: Array<{ id: NavId; label: string }> = [
    { id: 'home', label: 'Home' },
    { id: 'booking', label: 'Boeken' },
    { id: 'prijzen', label: 'Prijzen' },
    { id: 'tracking', label: 'Volg uw taxi' },
    { id: 'diensten', label: 'Diensten' },
    { id: 'vip', label: 'LV VIP' },
    { id: 'contact', label: 'Contact' }
  ];

  return <div className='premium-shell min-h-screen text-white'>
    <div className='world-map-bg' />
    <div className='mx-auto max-w-7xl px-4 py-5 sm:px-6'>
      <header className='glass-panel sticky top-3 z-50 rounded-3xl px-4 py-3'>
        <nav className='flex items-center gap-3'>
          <img src='/brand/lv-logo-header.svg' className='h-10' alt='LV Transport' />
          <div className='hidden flex-1 items-center justify-center gap-1 lg:flex'>
            {navItems.map((item) => <button key={item.id} className='nav-btn' onClick={() => scrollTo(item.id)}>{item.label}</button>)}
          </div>
          <div className='ml-auto hidden items-center gap-2 lg:flex'>
            <a className='surface-btn' href={DRIVER_SURFACE_URL}>Driver</a><a className='surface-btn' href={ADMIN_SURFACE_URL}>Admin</a>
          </div>
          <button className='hamburger lg:hidden' onClick={() => setMobileOpen((v) => !v)}>☰</button>
        </nav>
        <div className={`mobile-menu ${mobileOpen ? 'mobile-menu--open' : ''}`}>
          {navItems.map((item) => <button key={item.id} className='mobile-nav-btn' onClick={() => scrollTo(item.id)}>{item.label}</button>)}
          <a className='mobile-nav-btn' href={DRIVER_SURFACE_URL}>Driver</a><a className='mobile-nav-btn' href={ADMIN_SURFACE_URL}>Admin</a>
        </div>
      </header>

      <section id='home' className='glass-panel mt-4 rounded-3xl p-6 sm:p-10'>
        <p className='text-xs uppercase tracking-[0.34em] text-lv-champagne'>Premium Mobility • Antwerpen & België</p>
        <h1 className='mt-4 text-4xl font-semibold leading-tight sm:text-6xl'>Premium vervoer in Antwerpen en heel België</h1>
        <p className='mt-4 max-w-3xl text-lv-mist'>Executive vervoer, luchthavenritten en zakelijke mobiliteit met realtime opvolging, premium chauffeurs en discrete servicekwaliteit.</p>
        <div className='mt-6 flex flex-wrap gap-3'><Button onClick={() => scrollTo('booking')}>Boek uw rit</Button><Button variant='secondary' onClick={() => scrollTo('prijzen')}>Bekijk prijzen</Button><Button variant='secondary' onClick={() => scrollTo('tracking')}>Volg uw taxi</Button></div>
        <div className='mt-7 grid gap-3 lg:grid-cols-[1.4fr_1fr]'>
          <div className='map-sim'><div className='map-route' /><div className='map-node map-node--a' /><div className='map-node map-node--b' /><div className='map-cab' /></div>
          <aside className='glass-sub rounded-2xl p-4'>
            <h3 className='text-lg font-semibold'>Smart Price Estimator</h3>
            <div className='mt-3 space-y-2 text-sm'>
              <input className='estimate-input' value={estimate.from} onChange={(e) => setEstimate({ ...estimate, from: e.target.value })} placeholder='Vertrek' />
              <input className='estimate-input' value={estimate.destination} onChange={(e) => setEstimate({ ...estimate, destination: e.target.value })} placeholder='Bestemming / luchthaven' />
              <select className='estimate-input' value={estimate.passengers} onChange={(e) => setEstimate({ ...estimate, passengers: Number(e.target.value) })}>{[1, 2, 3, 4, 5, 6].map((v) => <option key={v}>{v}</option>)}</select>
            </div>
            <p className='mt-3 text-lv-mist'>Geschatte afstand: <b>{distance} km</b> • Indicatieve prijs: <b className='text-lv-champagne'>€{price}</b></p>
          </aside>
        </div>
      </section>

      <section id='booking' className='glass-panel mt-4 rounded-3xl p-6'> <h2 className='text-3xl font-semibold'>Boek uw rit</h2>
        <div className='mt-4 grid gap-3 sm:grid-cols-2'>{Object.entries(booking).map(([k, v]) => <label key={k} className={`field-wrap ${k === 'notes' ? 'sm:col-span-2' : ''}`}><span>{k}</span><input type={k === 'date' ? 'date' : k === 'time' ? 'time' : k === 'passengers' ? 'number' : 'text'} value={v as string | number} min={1} max={8} onChange={(e) => setBooking({ ...booking, [k]: k === 'passengers' ? Number(e.target.value) : e.target.value })} /></label>)}</div>
        <div className='mt-4'><Button>Reserveer rit</Button></div>
      </section>

      <section id='prijzen' className='glass-panel mt-4 rounded-3xl p-6'><h2 className='text-3xl font-semibold'>Premium routeprijzen</h2>
        <div className='route-carousel mt-4'>{[['Brussels Airport', '€95'], ['Charleroi', '€165'], ['Gent', '€125'], ['Rotterdam', '€295'], ['Schiphol', '€345'], ['Eindhoven', '€255'], ['Brugge', '€175'], ['Leuven', '€145'], ['Hasselt', '€160']].map(([r, p]) => <article key={r} className='route-card'><p>{r}</p><b>{p}</b></article>)}</div>
      </section>

      <section id='tracking' className='glass-panel mt-4 rounded-3xl p-6'><h2 className='text-3xl font-semibold'>Volg uw taxi realtime</h2>
        <div className='mt-3 flex gap-3'><input className='estimate-input' maxLength={6} placeholder='Reservatiecode' value={trackingCode} onChange={(e) => setTrackingCode(e.target.value.replace(/\D/g, '').slice(0, 6))} /><Button variant='secondary'>Track</Button></div>
        <div className='mt-4 space-y-2'>{statuses.map((s, i) => <div key={s} className={`status-line ${i <= activeStatus ? 'status-line--active' : ''}`}>{s}{i === activeStatus && <span> • ETA {14 - i * 2} min</span>}</div>)}</div>
      </section>

      <section id='diensten' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{['Taxi Antwerpen', 'Luchthavenvervoer', 'Zakelijk vervoer', 'LV VIP'].map((s) => <article key={s} className='glass-panel service-card rounded-2xl p-5'><h3 className='text-lg font-semibold'>{s}</h3><p className='mt-2 text-sm text-lv-mist'>{s === 'Luchthavenvervoer' ? airports.join(' • ') : s === 'Zakelijk vervoer' ? 'Facturatie, maandcontracten en executive corporate rides.' : s === 'LV VIP' ? 'Priority booking, premium chauffeurs en loyalty voordelen.' : '24/7 premium stadsritten en intercity comfort.'}</p></article>)}</section>

      <section id='vip' className='glass-panel mt-4 rounded-3xl p-6'><h2 className='text-3xl font-semibold'>LV VIP Membership</h2><p className='mt-2 text-lv-mist'>Prioriteit bij boekingen, toegewezen premium drivers, vaste accountmanager en exclusieve tarieven voor frequente executive verplaatsingen.</p></section>

      <section className='glass-panel mt-4 rounded-3xl p-6'><h2 className='text-3xl font-semibold'>Wat klanten zeggen</h2><div className='route-carousel mt-4'>{['“Perfect op tijd voor Schiphol, top service.”', '“Onze directie gebruikt LV wekelijks.”', '“VIP-abonnement is het verschil.”', '“Beste luchthavenvervoer in Antwerpen.”'].map((q) => <article key={q} className='route-card'><p>★★★★★</p><p>{q}</p></article>)}</div></section>

      <section className='mt-4 grid gap-4 lg:grid-cols-2'>
        <article className='glass-panel rounded-3xl p-6'><h2 className='text-2xl font-semibold'>Admin Control Tower</h2><p className='mt-2 text-lv-mist'>Beheer prijzen, homepage content, routes, VIP content, reviews, footertekst en operationele aankondigingen.</p></article>
        <article className='glass-panel rounded-3xl p-6'><h2 className='text-2xl font-semibold'>Driver App</h2><p className='mt-2 text-lv-mist'>Toegewezen ritten, accept/reject acties, navigatie, ritprogressie en realtime statusupdates voor passagiers.</p></article>
      </section>

      <footer id='contact' className='glass-panel my-4 rounded-3xl p-6 text-sm'><div className='grid gap-4 md:grid-cols-3'><div><img src='/brand/lv-logo-header.svg' className='h-9' /></div><div><p>📞 +32 466 48 79 36</p><p>✉️ info@lvtransport.be</p><p>🌐 www.lvtransport.be</p><p>🧾 BTW: BE 1036.807.066</p></div><div><p>© 2026 LV Transport. Alle rechten voorbehouden.</p><p>Legal notice • All rights reserved</p></div></div></footer>
    </div>
    <MoniAssistant />
  </div>;
}

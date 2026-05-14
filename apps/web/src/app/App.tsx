import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type RouteKey = 'home' | 'boeken' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin' | '404';

const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';

const navItems: Array<{ path: string; label: string; section: string }> = [
  { path: '/', label: 'Home', section: 'hero' },
  { path: '/boeken', label: 'Boeken', section: 'booking' },
  { path: '/prijzen', label: 'Prijzen', section: 'prijzen' },
  { path: '/tracking', label: 'Volg uw taxi', section: 'tracking' },
  { path: '/diensten', label: 'Diensten', section: 'diensten' },
  { path: '/vip', label: 'LV VIP', section: 'vip' },
  { path: '/contact', label: 'Contact', section: 'footer' }
];

const resolveRoute = (pathname: string): RouteKey => {
  const p = pathname.toLowerCase();
  if (['/', '/home'].includes(p)) return 'home';
  if (['/boeken', '/booking'].includes(p)) return 'boeken';
  if (p === '/prijzen') return 'prijzen';
  if (['/tracking', '/volg-uw-taxi'].includes(p)) return 'tracking';
  if (p === '/diensten') return 'diensten';
  if (p === '/vip') return 'vip';
  if (p === '/contact') return 'contact';
  if (['/driver', '/driver.html'].includes(p)) return 'driver';
  if (['/admin', '/admin.html', '/tower'].includes(p)) return 'admin';
  return '404';
};

export function App() {
  const [route, setRoute] = useState<RouteKey>(() => resolveRoute(window.location.pathname));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [booking, setBooking] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', passengers: '1', notes: '' });
  const [estimate, setEstimate] = useState({ distance: '18 km', price: '€74 - €96', airport: 'Nee' });

  const priceRoutes = useMemo(() => [
    ['Antwerpen → Brussels Airport', '€95'], ['Antwerpen → Charleroi', '€165'], ['Antwerpen → Schiphol', '€310'], ['Antwerpen → Eindhoven', '€220'],
    ['Antwerpen → Gent', '€125'], ['Antwerpen → Brugge', '€160'], ['Antwerpen → Leuven', '€150'], ['Antwerpen → Hasselt', '€140'], ['Antwerpen → Rotterdam', '€210']
  ], []);

  const navigate = (path: string, section?: string) => {
    history.pushState({}, '', path);
    setRoute(resolveRoute(path));
    setMobileOpen(false);
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  useEffect(() => {
    const onPopState = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const text = `${booking.pickup} ${booking.destination}`.toLowerCase();
    const airport = /(airport|zaventem|charleroi|schiphol|eindhoven|antwerp)/.test(text);
    const distance = airport ? '44 km' : booking.destination ? '22 km' : '18 km';
    const price = airport ? '€95 - €170' : booking.destination ? '€78 - €110' : '€74 - €96';
    setEstimate({ distance, price, airport: airport ? 'Ja' : 'Nee' });
  }, [booking.pickup, booking.destination]);

  if (route === 'driver' || route === 'admin') {
    const isDriver = route === 'driver';
    return <div className='premium-shell min-h-screen p-6 text-white'>
      <section id={isDriver ? 'driver' : 'admin'} className='glass-panel mx-auto max-w-5xl rounded-3xl p-8'>
        <h1 className='text-3xl font-semibold'>{isDriver ? 'Driver Operations App' : 'Admin Control Tower'}</h1>
        <p className='mt-2 text-lv-mist'>{isDriver ? 'Toegewezen ritten, accepteren/weigeren, realtime status en routeprogressie voor chauffeurs.' : 'Beheer prijzen, homepage-teksten, routes, VIP-content, reviews, footertekst en operationele meldingen.'}</p>
        <a className='mt-6 inline-flex rounded-xl border border-lv-gold/50 px-4 py-2' href={isDriver ? DRIVER_SURFACE_URL : ADMIN_SURFACE_URL}>Open beveiligde {isDriver ? 'Driver' : 'Admin'} omgeving</a>
      </section></div>;
  }

  return <div className='premium-shell min-h-screen px-4 py-4 text-white sm:px-6'><div className='mx-auto max-w-6xl space-y-5'>
    <header className='glass-panel sticky top-3 z-30 rounded-3xl p-4'>
      <nav className='hidden items-center gap-2 md:flex'>
        <img src='/brand/lv-logo-header.svg' className='h-10' alt='LV Transport' />
        <div className='mx-auto flex gap-2'>{navItems.map((n) => <button key={n.path} onClick={() => navigate(n.path, n.section)} className='nav-btn'>{n.label}</button>)}</div>
        <div className='flex gap-2'><button className='nav-btn-muted' onClick={() => navigate('/driver')}>Driver</button><button className='nav-btn-muted' onClick={() => navigate('/admin')}>Admin</button></div>
      </nav>
      <div className='flex items-center justify-between md:hidden'><img src='/brand/lv-logo-header.svg' className='h-9' alt='LV Transport' /><button className='nav-btn' onClick={() => setMobileOpen((v) => !v)}>☰</button></div>
      {mobileOpen && <div className='mobile-menu mt-3 md:hidden'>{navItems.map((n) => <button key={n.path} className='mobile-link' onClick={() => navigate(n.path, n.section)}>{n.label}</button>)}<div className='mt-2 flex gap-2'><button className='nav-btn-muted w-full' onClick={() => navigate('/driver')}>Driver</button><button className='nav-btn-muted w-full' onClick={() => navigate('/admin')}>Admin</button></div></div>}
    </header>

    <section id='hero' className='glass-panel hero-panel rounded-3xl p-6 sm:p-10'>
      <p className='text-sm uppercase tracking-[0.25em] text-lv-champagne'>Executive mobility • Antwerpen & België</p>
      <h1 className='mt-3 text-4xl font-semibold sm:text-6xl'>Premium vervoer in Antwerpen en heel België</h1>
      <p className='mt-4 max-w-3xl text-lv-mist'>Direct boeken, realtime opvolgen en vaste premium service voor luchthavens, zakelijke ritten en VIP-vervoer.</p>
      <div className='mt-6 flex flex-wrap gap-3'><Button onClick={() => navigate('/boeken', 'booking')}>Boek uw rit</Button><Button variant='secondary' onClick={() => navigate('/prijzen', 'prijzen')}>Bekijk prijzen</Button><Button variant='secondary' onClick={() => navigate('/tracking', 'tracking')}>Volg uw taxi</Button></div>
      <div className='mt-6 grid gap-3 md:grid-cols-3'>
        <label className='field-wrap'><span>Van</span><input value={booking.pickup} onChange={(e) => setBooking({ ...booking, pickup: e.target.value })} placeholder='Antwerpen, hotel, kantoor...' /></label>
        <label className='field-wrap'><span>Naar</span><input value={booking.destination} onChange={(e) => setBooking({ ...booking, destination: e.target.value })} placeholder='Luchthaven of bestemming...' /></label>
        <div className='rounded-2xl border border-lv-gold/35 bg-black/45 p-4 text-sm'><p>Airport detectie: <b>{estimate.airport}</b></p><p>Afstand: <b>{estimate.distance}</b></p><p>Schatting: <b className='text-lv-champagne'>{estimate.price}</b></p></div>
      </div>
    </section>

    <section id='diensten' className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{[['Taxi Antwerpen','24/7 stedelijke ritten met premium comfort.'],['Luchthavenvervoer','Brussels, Charleroi, Schiphol, Eindhoven, Antwerp Airport.'],['Zakelijk vervoer','Facturen, maandelijkse billing en contractritten.'],['LV VIP','Prioriteit, premium chauffeurs en abonnementsvoordelen.']].map(([t,d]) => <article key={t} className='glass-panel service-card rounded-2xl p-5'><h3 className='text-lg font-semibold'>{t}</h3><p className='mt-2 text-sm text-lv-mist'>{d}</p></article>)}</section>

    <section id='prijzen' className='glass-panel rounded-3xl p-6'><h2 className='text-2xl font-semibold'>Premium routeprijzen</h2><div className='route-carousel mt-4'>{priceRoutes.concat(priceRoutes).map(([r,p],i) => <div key={r+i} className='route-card'><p className='text-sm text-lv-mist'>{r}</p><p className='text-2xl font-semibold text-lv-champagne'>{p}</p></div>)}</div></section>

    <section id='booking' className='glass-panel rounded-3xl p-6'><h2 className='text-2xl font-semibold'>Boek uw rit</h2><div className='mt-4 grid gap-3 sm:grid-cols-2'>{[['name','Naam'],['phone','Telefoon'],['pickup','Pickup'],['destination','Bestemming'],['date','Datum'],['time','Tijd'],['passengers','Passagiers'],['notes','Notities']].map(([key,label]) => <label key={key} className={`field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`}><span>{label}</span><input type={key==='date'||key==='time'?'text':'text'} value={booking[key as keyof typeof booking]} onChange={(e)=>setBooking({...booking,[key]:e.target.value})} /></label>)}</div><div className='mt-4'><Button>Reserveer rit</Button></div></section>

    <section id='tracking' className='glass-panel rounded-3xl p-6'><h2 className='text-2xl font-semibold'>Volg uw taxi</h2><div className='mt-3 flex gap-3'><input className='w-full rounded-xl border border-lv-gold/30 bg-black/20 px-4 py-3' maxLength={6} placeholder='Boekingscode' value={trackingCode} onChange={(e) => setTrackingCode(e.target.value.replace(/\D/g, '').slice(0, 6))} /><Button variant='secondary'>Track</Button></div><div className='mt-4 rounded-2xl border border-lv-gold/30 bg-black/40 p-4'><p>Status: Chauffeur onderweg</p><p>ETA: 9 minuten</p></div></section>

    <footer id='footer' className='glass-panel grid rounded-3xl p-6 text-sm md:grid-cols-3'><div><img src='/brand/lv-logo-header.svg' className='h-10' alt='LV Transport' /></div><div><p>📞 +32 466 48 79 36</p><p>✉ info@lvtransport.be</p><p>🌐 www.lvtransport.be</p><p>BTW BE 1036.807.066</p></div><div><p>© 2026 LV Transport. Alle rechten voorbehouden.</p><p>Legal notice</p><p>All rights reserved</p></div></footer>

    <MoniAssistant />
  </div></div>;
}

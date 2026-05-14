import { FormEvent, useEffect, useMemo, useState } from 'react';
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
type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'contact' | 'vip' | 'moni' | 'maps' | 'driver' | 'admin' | 'dashboard';
type BookingRecord = {
  code: string;
  name: string;
  phone: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  serviceType: string;
  notes: string;
  createdAt: string;
};

const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

const routeMap: Record<string, RouteKey> = {
  '/': 'home',
  '/booking': 'booking',
  '/prijzen': 'prijzen',
  '/tracking': 'tracking',
  '/diensten': 'diensten',
  '/contact': 'contact',
  '/moni-ride': 'moni',
  '/maps': 'maps',
  '/driver': 'driver',
  '/admin': 'admin',
  '/dashboard': 'dashboard'
};

const navItems = [
  { label: 'Boeken', path: '/booking', section: 'booking' },
  { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
  { label: 'Volg uw taxi', path: '/tracking', section: 'tracking' },
  { label: 'Diensten', path: '/diensten', section: 'diensten' },
  { label: 'LV VIP', path: '/dashboard', section: 'vip' },
  { label: 'Contact', path: '/contact', section: 'contact' }
];

  const navigate = (path: string, section?: string) => {
    history.pushState({}, '', path);
    setRoute(resolveRoute(path));
    setMobileOpen(false);
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  };

  useEffect(() => {
    const onPopState = () => setRoute(resolveRoute(window.location.pathname));
const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;

export function App() {
  const [route, setRoute] = useState<RouteKey>(() => routeMap[window.location.pathname] ?? 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [rideCode, setRideCode] = useState('');
  const [confirm, setConfirm] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState('Tracking wordt gekoppeld aan uw ritcode zodra de rit bevestigd is.');
  const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
  const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });

  useEffect(() => {
    const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
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
    const section = route === 'dashboard' ? 'vip' : route;
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [route]);

  const price = useMemo(() => {
    const base = 28;
    const perKm = calc.isNight ? 2.8 : 2.3;
    const airportFee = calc.airport ? 12 : 0;
    const businessFee = calc.business ? 8 : 0;
    return Math.round(base + calc.km * perKm + airportFee + businessFee);
  }, [calc]);

  const navigate = (path: string, section?: string) => {
    window.history.pushState({}, '', path);
    setRoute(routeMap[path] ?? 'home');
    setMenuOpen(false);
    if (section) {
      setTimeout(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 30);
    }
  };

  const onSubmitBooking = async (event: FormEvent) => {
    event.preventDefault();
    const code = createRideCode();
    const payload: BookingRecord = { ...form, code, createdAt: new Date().toISOString() };

    const stored = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...stored].slice(0, 25)));

    let apiText = 'Opgeslagen op uw toestel.';
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        apiText = response.ok ? 'Rit ook doorgestuurd naar LV Transport.' : 'Backend tijdelijk onbereikbaar, lokaal bewaard.';
      }
    } catch {
      apiText = 'Backend tijdelijk onbereikbaar, lokaal bewaard.';
    }

    setRideCode(code);
    setConfirm(`Bedankt ${form.name || 'klant'}, uw ritaanvraag is ontvangen. Ritcode: ${code}. ${apiText}`);
  };

  const whatsappText = encodeURIComponent(
    `Nieuwe ritaanvraag ${rideCode || 'LV?????'}. Naam: ${form.name}. Pickup: ${form.pickup}. Bestemming: ${form.destination}. Datum: ${form.date} ${form.time}. Service: ${form.serviceType}.`
  );

  return <div className='premium-shell min-h-screen text-white'>
    <div className='mx-auto max-w-6xl px-4 py-4 sm:px-6'>
      <header className='glass-panel sticky top-3 z-40 rounded-3xl p-4'>
        <nav className='hidden items-center gap-3 md:flex'>
          <button onClick={() => navigate('/', 'hero')}><img src='/brand/lv-logo-header.svg' className='h-9' alt='LV Transport logo' /></button>
          <div className='mx-auto flex gap-2'>{navItems.map((item) => <button key={item.path} className='nav-btn' onClick={() => navigate(item.path, item.section)}>{item.label}</button>)}</div>
          <button className='nav-btn-muted' onClick={() => navigate('/driver')}>Driver</button>
          <button className='nav-btn-muted' onClick={() => navigate('/admin')}>Admin</button>
        </nav>
        <div className='flex items-center justify-between md:hidden'>
          <img src='/brand/lv-logo-header.svg' className='h-8' alt='LV Transport' />
          <button className='nav-btn' onClick={() => setMenuOpen((v) => !v)}>☰</button>
        </div>
        {menuOpen && <div className='mobile-menu mt-3 md:hidden'>{navItems.map((item) => <button key={item.path} className='mobile-link' onClick={() => navigate(item.path, item.section)}>{item.label}</button>)}<div className='mt-2 grid grid-cols-2 gap-2'><button className='nav-btn-muted' onClick={() => navigate('/driver')}>Driver</button><button className='nav-btn-muted' onClick={() => navigate('/admin')}>Admin</button></div></div>}
      </header>

      <section id='hero' className='glass-panel mt-4 rounded-3xl p-6 sm:p-10'>
        <p className='text-sm uppercase tracking-[0.2em] text-lv-champagne'>Antwerpen, België • 24/7 service</p>
        <h1 className='mt-3 text-4xl font-semibold sm:text-6xl'>LV Transport</h1>
        <h2 className='mt-2 text-xl text-lv-mist sm:text-3xl'>Premium Taxi & Airport Service Antwerpen</h2>
        <p className='mt-4 max-w-3xl text-lv-mist'>Luchthavenvervoer, privéritten en business/VIP verplaatsingen met professionele chauffeurs in Antwerpen en heel België.</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Button onClick={() => navigate('/booking', 'booking')}>Reserveer nu</Button>
          <Button variant='secondary' onClick={() => navigate('/prijzen', 'prijzen')}>Bereken prijs</Button>
          <Button variant='secondary' onClick={() => navigate('/tracking', 'tracking')}>Volg uw taxi</Button>
        </div>
      </section>

      <section id='booking' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Boekingsaanvraag</h3>
        <form className='mt-4 grid gap-3 sm:grid-cols-2' onSubmit={onSubmitBooking}>
          {['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) => <label key={key} className={`field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`}><span>{key}</span><input required={key !== 'notes'} value={form[key as keyof typeof form]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} /></label>)}
          <div className='sm:col-span-2 flex flex-wrap gap-3'><Button type='submit'>Reserveer nu</Button>{rideCode && <p className='self-center rounded-xl border border-lv-gold/40 bg-black/40 px-3 py-2 text-sm'>Ritcode: <b>{rideCode}</b></p>}</div>
        </form>
        {confirm && <p className='mt-3 rounded-xl border border-lv-gold/35 bg-black/35 p-3 text-sm text-lv-mist'>{confirm}</p>}
        <a className='mt-3 inline-block nav-btn' href={`https://wa.me/32466487936?text=${whatsappText}`} target='_blank' rel='noreferrer'>Boek via WhatsApp</a>
      </section>

      <section id='prijzen' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Prijs berekenen</h3>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          <label className='field-wrap'><span>Afstand (km)</span><input type='number' min={1} max={250} value={calc.km} onChange={(e) => setCalc({ ...calc, km: Number(e.target.value || 1) })} /></label>
          <label className='field-wrap'><span>Nacht</span><input type='checkbox' checked={calc.isNight} onChange={(e) => setCalc({ ...calc, isNight: e.target.checked })} /></label>
          <label className='field-wrap'><span>Luchthaven</span><input type='checkbox' checked={calc.airport} onChange={(e) => setCalc({ ...calc, airport: e.target.checked })} /></label>
          <label className='field-wrap'><span>Business</span><input type='checkbox' checked={calc.business} onChange={(e) => setCalc({ ...calc, business: e.target.checked })} /></label>
        </div>
        <p className='mt-4 text-lg'>Geschatte prijs: <b className='text-lv-champagne'>€{price}</b> (minimumtarief €28)</p>
        <p className='text-sm text-lv-mist'>Indicatieve berekening. Definitieve prijs wordt bevestigd door LV Transport.</p>
      </section>

      <section id='tracking' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Volg uw taxi</h3>
        <div className='mt-3 flex gap-2'><input className='estimate-input' placeholder='LV12345' value={trackingInput} onChange={(e) => setTrackingInput(e.target.value.toUpperCase())} /><Button variant='secondary' onClick={() => setTrackingResult(trackingInput ? `Rit ${trackingInput}: bevestiging in verwerking.` : 'Voer een ritcode in.')}>Controleer</Button></div>
        <p className='mt-3 rounded-xl border border-lv-gold/30 bg-black/35 p-3 text-sm text-lv-mist'>{trackingResult}</p>
        <p className='mt-2 text-xs text-lv-mist'>Tracking wordt gekoppeld aan uw ritcode zodra de rit bevestigd is.</p>
      </section>

      <section id='diensten' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5'>
        {['Airport transfer', 'Private rides', 'Business/VIP', 'Long-distance rides', '24/7 planned rides'].map((service) => <article key={service} className='glass-panel service-card rounded-2xl p-4'><h4 className='font-semibold'>{service}</h4></article>)}
      </section>

      <section id='vip' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Business & LV VIP</h3><p className='mt-3 text-lv-mist'>Voor zakelijke klanten: vaste routes, maandelijkse facturen, VIP frequent client ondersteuning en prioriteitsservice voor kritieke verplaatsingen.</p></section>
      <section id='moni' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Moni Ride assistant</h3><p className='mt-2 text-lv-mist'>Moni helpt u snel met boeken, prijsberekening, tracking, luchthavenritten en VIP/business vragen.</p></section>

      <footer id='contact' className='glass-panel my-4 rounded-3xl p-6 text-sm'><p>info@lvtransport.be • lvtransport.be • Antwerpen, België</p></footer>

      <MoniAssistant />
    </div>
    {(route === 'driver' || route === 'admin') && <div className='fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm'>{route === 'driver' ? <a href={DRIVER_SURFACE_URL}>Open Driver omgeving</a> : <a href={ADMIN_SURFACE_URL}>Open Admin omgeving</a>}</div>}
  </div>;
}

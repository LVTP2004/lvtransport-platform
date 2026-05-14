import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { BookingLifecycle, isImmutableLifecycleStatus } from '@lvtransport/realtime';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin';
type BookingStatus = 'draft' | 'submitted' | 'confirmed' | BookingLifecycle;

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
  status: BookingStatus;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';

const routeMap: Record<string, RouteKey> = {
  '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin'
};

const navItems = [
  { label: 'Boeken', path: '/booking', section: 'booking' },
  { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
  { label: 'Rit volgen', path: '/tracking', section: 'tracking' },
  { label: 'Diensten', path: '/diensten', section: 'diensten' },
  { label: 'LV VIP', path: '/vip', section: 'vip' },
  { label: 'Contact', path: '/contact', section: 'contact' }
];

const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;

const normalizeLifecycle = (status: BookingStatus): BookingLifecycle | null => {
  const map: Record<string, BookingLifecycle> = {
    draft: BookingLifecycle.PENDING,
    submitted: BookingLifecycle.PENDING,
    confirmed: BookingLifecycle.ASSIGNED,
    assigned: BookingLifecycle.ASSIGNED,
    accepted: BookingLifecycle.ACCEPTED,
    en_route: BookingLifecycle.EN_ROUTE,
    arrived: BookingLifecycle.ARRIVED,
    in_progress: BookingLifecycle.IN_PROGRESS,
    completed: BookingLifecycle.COMPLETED,
    cancelled: BookingLifecycle.CANCELLED,
    failed: BookingLifecycle.FAILED,
    pending: BookingLifecycle.PENDING
  };
  return map[String(status).toLowerCase()] ?? null;
};


export function App() {
  const [route, setRoute] = useState<RouteKey>(() => routeMap[window.location.pathname] ?? 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
  const [confirm, setConfirm] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om realtime lifecycle-status te controleren.');

  const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
  const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);

  useEffect(() => {
    const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string, section?: string) => {
    window.history.pushState({}, '', path);
    setRoute(routeMap[path] ?? 'home');
    setMenuOpen(false);
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  };

  const onSubmitBooking = async (event: FormEvent) => {
    event.preventDefault();
    const code = createRideCode();
    const payload: BookingRecord = { ...form, code, createdAt: new Date().toISOString(), status: 'submitted' };
    const dedupeKey = `web-booking-${payload.phone}-${payload.date}-${payload.time}-${payload.pickup}`;
    const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    if (sessionStorage.getItem(dedupeKey)) {
      setConfirm('Dubbele verzending geblokkeerd. Uw eerdere boeking werd al verwerkt.');
      return;
    }
    localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));
    sessionStorage.setItem(dedupeKey, payload.code);

    let message = `Bedankt ${form.name || 'klant'}, uw rit ${code} is ingediend.`;
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        message += response.ok ? ' Sync met dispatch bevestigd.' : ' API tijdelijk offline: veilige lokale fallback actief.';
      } else {
        message += ' API endpoint ontbreekt: veilige lokale fallback actief.';
      }
    } catch {
      message += ' Synchronisatie tijdelijk verstoord, rit veilig lokaal opgeslagen.';
    }
    setConfirm(message);
  };

  const checkTracking = () => {
    const normalized = trackingInput.trim().toUpperCase();
    if (!/^LV\d{5}$/.test(normalized)) return setTrackingResult('Ongeldige code. Gebruik formaat LV12345.');

    const records = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    const ride = records.find((record) => record.code === normalized);
    if (!ride) return setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);

    const immutable = ride.status === 'completed' || ride.status === 'cancelled';
    setTrackingResult(`Rit ${ride.code}: status ${ride.status.toUpperCase()} • ${immutable ? 'afgesloten (immutable)' : 'actieve lifecycle'}.`);
    const lifecycle = normalizeLifecycle(ride.status);
    if (!lifecycle) return setTrackingResult(`Rit ${ride.code}: status onbekend, neem contact op met dispatch.`);
    const immutable = isImmutableLifecycleStatus(lifecycle);
    setTrackingResult(`Rit ${ride.code}: status ${lifecycle.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
  };

  return <div className='premium-shell min-h-screen text-white'>
    <div className='mx-auto max-w-6xl px-4 py-4 sm:px-6'>
      <header className='glass-panel sticky top-3 z-40 rounded-3xl p-3 sm:p-4'>
        <div className='flex items-center gap-2'>
          <button onClick={() => navigate('/', 'hero')}><img src='/brand/lv-logo-header.svg' className='h-9' alt='LV Transport logo' /></button>
          <button className='hamburger md:hidden' onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? 'Sluit' : 'Menu'}</button>
          <nav className='ml-auto hidden items-center gap-2 md:flex'>
            {navItems.map((item) => <button key={item.path} className='nav-btn' onClick={() => navigate(item.path, item.section)}>{item.label}</button>)}
            <button className='surface-btn' onClick={() => navigate('/driver')}>Driver</button>
            <button className='surface-btn' onClick={() => navigate('/admin')}>Admin</button>
          </nav>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
          {navItems.map((item) => <button key={item.path} className='mobile-nav-btn' onClick={() => navigate(item.path, item.section)}>{item.label}</button>)}
          <button className='mobile-nav-btn' onClick={() => navigate('/driver')}>Driver omgeving</button>
          <button className='mobile-nav-btn' onClick={() => navigate('/admin')}>Admin omgeving</button>
        </div>
      </header>

      <section id='hero' className='glass-panel hero-panel mt-4 rounded-3xl p-6 sm:p-10'>
        <p className='text-xs uppercase tracking-[0.25em] text-lv-champagne'>LV Transport Platform</p>
        <h1 className='mt-3 text-4xl font-semibold sm:text-6xl'>Premium vervoer in Antwerpen en België</h1>
        <p className='mt-4 max-w-3xl text-lv-mist'>Airport, VIP en zakelijke ritten met operationele opvolging, realtime statuscommunicatie en dispatch-ready lifecycle.</p>
        <div className='mt-6 flex flex-wrap gap-2'>
          <button className='nav-btn' onClick={() => navigate('/booking', 'booking')}>Start boeking</button>
          <button className='nav-btn' onClick={() => navigate('/tracking', 'tracking')}>Volg uw rit</button>
        </div>
      </section>

      <section id='booking' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Boekingsaanvraag</h3>
        <p className='mt-2 text-sm text-lv-mist'>Uw aanvraag wordt lokaal veilig vastgelegd en indien beschikbaar direct met dispatch gesynchroniseerd.</p>
        <form className='mt-4 grid gap-3 sm:grid-cols-2' onSubmit={onSubmitBooking}>
          {['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) =>
            <label key={key} className={`field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`}>
              <span>{key}</span>
              <input required={key !== 'notes'} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} />
            </label>
          )}
          <div className='sm:col-span-2'><Button type='submit'>Reserveer nu</Button></div>
        </form>
        {confirm && <p className='mt-3 status-line status-line--active'>{confirm}</p>}
      </section>

      <section id='prijzen' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Prijs berekenen</h3>
        <div className='mt-4 grid gap-3 md:grid-cols-2'>
          <label className='field-wrap'><span>Afstand (km)</span><input type='number' min={1} value={calc.km} onChange={(event) => setCalc({ ...calc, km: Number(event.target.value) || 0 })} /></label>
          <div className='flex flex-col gap-2 rounded-2xl border border-lv-gold/25 bg-black/30 p-4 text-sm'>
            <label><input type='checkbox' checked={calc.airport} onChange={(event) => setCalc({ ...calc, airport: event.target.checked })} /> Airport toeslag</label>
            <label><input type='checkbox' checked={calc.business} onChange={(event) => setCalc({ ...calc, business: event.target.checked })} /> Business service</label>
            <label><input type='checkbox' checked={calc.isNight} onChange={(event) => setCalc({ ...calc, isNight: event.target.checked })} /> Nachtregeling</label>
          </div>
        </div>
        <p className='mt-4 text-lg'>Geschatte prijs: <b className='text-lv-champagne'>€{price}</b></p>
      </section>

      <section id='tracking' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Volg uw taxi</h3>
        <div className='mt-3 flex flex-col gap-2 sm:flex-row'>
          <input className='estimate-input' placeholder='LV12345' value={trackingInput} onChange={(event) => setTrackingInput(event.target.value)} />
          <Button variant='secondary' onClick={checkTracking}>Controleer status</Button>
        </div>
        <p className='mt-3 status-line'>{trackingResult}</p>
      </section>

      <section id='diensten' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {['Airport transfers', 'Private rides', 'Business & VIP', '24/7 dispatch opvolging'].map((service) =>
          <article key={service} className='glass-panel service-card rounded-2xl p-4'>{service}</article>
        )}
      </section>

      <section id='vip' className='glass-panel mt-4 rounded-3xl p-6 text-lv-mist'>Prioriteitsservice, facturatie, vaste accountmanager en gecentraliseerde operationele opvolging voor bedrijven en frequente reizigers.</section>
      <footer id='contact' className='glass-panel my-4 rounded-3xl p-6 text-sm'>info@lvtransport.be • +32 466 48 79 36 • Antwerpen • België</footer>

      <MoniAssistant />
      {(route === 'driver' || route === 'admin') && <div className='fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm'>
        {route === 'driver' ? <a href={DRIVER_SURFACE_URL}>Open Driver omgeving</a> : <a href={ADMIN_SURFACE_URL}>Open Admin omgeving</a>}
      </div>}
    </div>
  </div>;
}

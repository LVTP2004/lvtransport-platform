import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin';
type BookingStatus = 'draft' | 'submitted' | 'confirmed' | 'assigned' | 'completed' | 'cancelled';

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
  { label: 'Volg uw taxi', path: '/tracking', section: 'tracking' },
  { label: 'Diensten', path: '/diensten', section: 'diensten' },
  { label: 'LV VIP', path: '/vip', section: 'vip' },
  { label: 'Contact', path: '/contact', section: 'contact' }
];

const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;

export function App() {
  const [route, setRoute] = useState<RouteKey>(() => routeMap[window.location.pathname] ?? 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
  const [confirm, setConfirm] = useState('');
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om lifecycle-status te valideren.');

  const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
  const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);

  useEffect(() => {
    const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    if (route !== 'home') document.getElementById(route)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [route]);

  const navigate = (path: string, section?: string) => {
    window.history.pushState({}, '', path);
    setRoute(routeMap[path] ?? 'home');
    setMenuOpen(false);
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
  };

  const onSubmitBooking = async (event: FormEvent) => {
    event.preventDefault();
    const code = createRideCode();
    const payload: BookingRecord = { ...form, code, createdAt: new Date().toISOString(), status: 'submitted' };
    const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));

    let message = `Bedankt ${form.name || 'klant'}, uw rit ${code} is ingediend.`;
    try {
      if (API_BASE_URL) {
        const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        message += response.ok ? ' De aanvraag is gesynchroniseerd met dispatch.' : ' API offline: lokale fallback actief.';
      } else {
        message += ' API endpoint ontbreekt: lokale fallback actief.';
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
    const ride = records.find((r) => r.code === normalized);
    if (!ride) return setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);
    const immutable = ride.status === 'completed' || ride.status === 'cancelled';
    setTrackingResult(`Rit ${ride.code}: status ${ride.status.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
  };

  return <div className='premium-shell min-h-screen text-white'><div className='mx-auto max-w-6xl px-4 py-4 sm:px-6'>
    <header className='glass-panel sticky top-3 z-40 rounded-3xl p-4'>
      <nav className='hidden items-center gap-3 md:flex'>
        <button onClick={() => navigate('/', 'hero')}><img src='/brand/lv-logo-header.svg' className='h-9' alt='LV Transport logo' /></button>
        <div className='mx-auto flex gap-2'>{navItems.map((item) => <button key={item.path} className='nav-btn' onClick={() => navigate(item.path, item.section)}>{item.label}</button>)}</div>
        <button className='nav-btn-muted' onClick={() => navigate('/driver')}>Driver</button><button className='nav-btn-muted' onClick={() => navigate('/admin')}>Admin</button>
      </nav>
    </header>
    <section id='hero' className='glass-panel mt-4 rounded-3xl p-6 sm:p-10'><h1 className='text-4xl font-semibold sm:text-6xl'>Premium vervoer in Antwerpen en België</h1><p className='mt-4 max-w-3xl text-lv-mist'>Airport, VIP en zakelijke ritten met realtime operationele opvolging.</p></section>
    <section id='booking' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Boekingsaanvraag</h3><form className='mt-4 grid gap-3 sm:grid-cols-2' onSubmit={onSubmitBooking}>{['name','phone','pickup','destination','date','time','serviceType','notes'].map((k)=><label key={k} className={`field-wrap ${k==='notes'?'sm:col-span-2':''}`}><span>{k}</span><input required={k!=='notes'} value={form[k as keyof typeof form]} onChange={(e)=>setForm({...form,[k]:e.target.value})} /></label>)}<div className='sm:col-span-2'><Button type='submit'>Reserveer nu</Button></div></form>{confirm && <p className='mt-3 status-line status-line--active'>{confirm}</p>}</section>
    <section id='prijzen' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Prijs berekenen</h3><p className='mt-4 text-lg'>Geschatte prijs: <b className='text-lv-champagne'>€{price}</b></p></section>
    <section id='tracking' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Volg uw taxi</h3><div className='mt-3 flex gap-2'><input className='estimate-input' placeholder='LV12345' value={trackingInput} onChange={(e)=>setTrackingInput(e.target.value)} /><Button variant='secondary' onClick={checkTracking}>Controleer</Button></div><p className='mt-3 status-line'>{trackingResult}</p></section>
    <section id='diensten' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{['Airport transfer','Private rides','Business/VIP','24/7 dispatch'].map((service)=><article key={service} className='glass-panel service-card rounded-2xl p-4'>{service}</article>)}</section>
    <section id='vip' className='glass-panel mt-4 rounded-3xl p-6'>Prioriteitsservice, facturatie en vaste accountmanager voor bedrijven.</section>
    <footer id='contact' className='glass-panel my-4 rounded-3xl p-6 text-sm'>info@lvtransport.be • +32 466 48 79 36 • Antwerpen</footer>
    <MoniAssistant />
    {(route === 'driver' || route === 'admin') && <div className='fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm'>{route === 'driver' ? <a href={DRIVER_SURFACE_URL}>Open Driver omgeving</a> : <a href={ADMIN_SURFACE_URL}>Open Admin omgeving</a>}</div>}
  </div></div>;
}

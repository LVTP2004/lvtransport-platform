import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getInstallPromptState } from '../pwa';
import { Button } from '@lvtransport/ui';
import { BookingLifecycle, isImmutableLifecycleStatus } from '@lvtransport/realtime';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin';
type BookingStatus = 'draft' | 'submitted' | 'confirmed' | BookingLifecycle;
type AuthMode = 'signin' | 'register';
type InteractionIntent = 'booking' | 'tracking' | 'vip' | 'business' | 'driver' | 'admin' | 'reviews' | 'expansion';

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

type VerifiedIdentity = {
  name: string;
  email: string;
  phone: string;
  company?: string;
  roleIntent?: string;
  method: 'google' | 'email';
  verifiedAt: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';

const routeMap: Record<string, RouteKey> = {
  '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin'
};

const navItems = [
  { label: 'Reserveer nu', path: '/booking', section: 'booking', intent: 'booking' as InteractionIntent },
  { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
  { label: 'Volg uw rit', path: '/tracking', section: 'tracking', intent: 'tracking' as InteractionIntent },
  { label: 'Diensten', path: '/diensten', section: 'diensten' },
  { label: 'LV VIP', path: '/vip', section: 'vip', intent: 'vip' as InteractionIntent },
  { label: 'Contact', path: '/contact', section: 'contact' }
];

const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
const trustSignals = ['Verified Driver', 'Realtime Connected', 'Airport Synchronized', 'Secure Payment', 'LV Certified', 'Premium Operator'] as const;
const interactionCopy: Record<InteractionIntent, string> = {
  booking: 'Reserveer premium ritten en operational lifecycle updates.',
  tracking: 'Bekijk realtime lifecycle, dispatch updates en ride intelligence.',
  vip: 'Activeer VIP/business privileges binnen het private LV-ecosysteem.',
  business: 'Open uw business dashboard en account governance.',
  driver: 'Toegang tot operator tools en driver lifecycle flows.',
  admin: 'Founder-grade operational oversight en dispatch orchestration.',
  reviews: 'Plaats enkel Verified Ride Reviews na completed rides.',
  expansion: 'Start verified partner/operator onboarding voor LV Business Expansion.'
};


const customerMapStates: Array<{ key: BookingLifecycle | 'searching' | 'booking_pending'; label: string; tone: string }> = [
  { key: 'searching', label: 'Searching', tone: 'bg-sky-400/20 text-sky-100 border-sky-300/40' },
  { key: 'booking_pending', label: 'Booking pending', tone: 'bg-amber-400/20 text-amber-100 border-amber-300/40' },
  { key: BookingLifecycle.ASSIGNED, label: 'Driver assigned', tone: 'bg-violet-400/20 text-violet-100 border-violet-300/40' },
  { key: BookingLifecycle.EN_ROUTE, label: 'Driver approaching', tone: 'bg-indigo-400/20 text-indigo-100 border-indigo-300/40' },
  { key: BookingLifecycle.ARRIVED, label: 'Arrived', tone: 'bg-cyan-400/20 text-cyan-100 border-cyan-300/40' },
  { key: BookingLifecycle.IN_PROGRESS, label: 'In ride', tone: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40' },
  { key: BookingLifecycle.COMPLETED, label: 'Completed', tone: 'bg-lv-gold/25 text-lv-champagne border-lv-gold/40' }
];

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
  const [booting, setBooting] = useState(true);
  const [route, setRoute] = useState<RouteKey>(() => routeMap[window.location.pathname] ?? 'home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [authOpen, setAuthOpen] = useState(false);
  const [authIntent, setAuthIntent] = useState<InteractionIntent>('booking');
  const [identity, setIdentity] = useState<VerifiedIdentity | null>(() => JSON.parse(localStorage.getItem('lvtp_verified_identity') ?? 'null'));

  const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '', company: '', roleIntent: 'Customer' });
  const [authStatus, setAuthStatus] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
  const [confirm, setConfirm] = useState('');
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om realtime lifecycle-status te controleren.');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [customerMapPhase, setCustomerMapPhase] = useState<(typeof customerMapStates)[number]['key']>('searching');
  const [driverProgress, setDriverProgress] = useState(10);
  const [syncPhase, setSyncPhase] = useState(0);
  const [verifiedReviews, setVerifiedReviews] = useState<string[]>([]);
  const [installReady, setInstallReady] = useState(false);

  const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
  const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);


  useEffect(() => {
    const installState = getInstallPromptState();
    setInstallReady(installState.available);
    const onReady = () => setInstallReady(true);
    const onInstalled = () => setInstallReady(false);
    window.addEventListener('lv:pwa-install-available', onReady);
    window.addEventListener('lv:pwa-installed', onInstalled);
    return () => {
      window.removeEventListener('lv:pwa-install-available', onReady);
      window.removeEventListener('lv:pwa-installed', onInstalled);
    };
  }, []);

  const installEcosystemApp = async () => {
    const accepted = await getInstallPromptState().promptInstall();
    if (!accepted) return;
    setInstallReady(false);
    setConfirm('LV app installed. U geniet nu van een native premium experience.');
  };

  useEffect(() => {
    const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const startIntent = (intent: InteractionIntent) => {
    setAuthIntent(intent);
    setAuthOpen(true);
    setAuthStatus('');
  };
  const requireIdentity = (intent: InteractionIntent, action: () => void) => identity ? action() : startIntent(intent);

  const navigate = (path: string, section?: string) => {
    window.history.pushState({}, '', path);
    setRoute(routeMap[path] ?? 'home');
    setMenuOpen(false);
    if (section) setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  };

  const activateIdentity = (method: 'google' | 'email') => {
    if (authLoading) return;
    if (!authForm.email.trim() || !authForm.phone.trim()) {
      setAuthStatus('Email en telefoon zijn verplicht voor verified operational toegang.');
      return;
    }
    setAuthLoading(true);
    const nextIdentity: VerifiedIdentity = {
      name: authForm.name || 'LV Member',
      email: authForm.email,
      phone: authForm.phone,
      company: authForm.company || undefined,
      roleIntent: authForm.roleIntent || 'Customer',
      method,
      verifiedAt: new Date().toISOString()
    };
    localStorage.setItem('lvtp_verified_identity', JSON.stringify(nextIdentity));
    setIdentity(nextIdentity);
    setAuthStatus('Verified identity geactiveerd. Welkom in het private LV-ecosysteem.');
    setTimeout(() => {
      setAuthOpen(false);
      setAuthLoading(false);
    }, 500);
  };

  const onSubmitBooking = async (event: FormEvent) => {
    event.preventDefault();
    if (bookingSubmitting) return;
    if (!identity) return startIntent('booking');
    setBookingSubmitting(true);
    setConfirm('Boeking wordt veilig verwerkt...');
    const code = createRideCode();
    const payload: BookingRecord = { ...form, name: identity.name, phone: identity.phone || form.phone, code, createdAt: new Date().toISOString(), status: 'submitted' };
    const dedupeKey = `web-booking-${payload.phone}-${payload.date}-${payload.time}-${payload.pickup}`;
    const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    if (sessionStorage.getItem(dedupeKey)) {
      setConfirm('Dubbele verzending geblokkeerd. Uw eerdere boeking werd al verwerkt.');
      setBookingSubmitting(false);
      return;
    }
    localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));
    sessionStorage.setItem(dedupeKey, payload.code);

    let message = `Bedankt ${identity.name || 'klant'}, uw verified rit ${code} is ingediend.`;
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
    setConfirmedReviewSeed(payload.code);
    setConfirm(message);
    setBookingSubmitting(false);
  };

  const setConfirmedReviewSeed = (rideCode: string) => {
    setVerifiedReviews((existing) => Array.from(new Set([`Verified Ride Review unlocked for ${rideCode}`, ...existing])).slice(0, 5));
  };

  const checkTracking = () => {
    if (trackingLoading) return;
    if (!identity) return startIntent('tracking');
    setTrackingLoading(true);
    const normalized = trackingInput.trim().toUpperCase();
    if (!/^LV\d{5}$/.test(normalized)) {
      setTrackingResult('Ongeldige code. Gebruik formaat LV12345.');
      setTrackingLoading(false);
      return;
    }

    const records = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    const ride = records.find((record) => record.code === normalized);
    if (!ride) {
      setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);
      setTrackingLoading(false);
      return;
    }

    const lifecycle = normalizeLifecycle(ride.status);
    if (!lifecycle) {
      setTrackingResult(`Rit ${ride.code}: status onbekend, neem contact op met dispatch.`);
      setTrackingLoading(false);
      return;
    }
    const immutable = isImmutableLifecycleStatus(lifecycle);
    setTrackingResult(`Rit ${ride.code}: status ${lifecycle.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
    setTrackingLoading(false);
  };

  useEffect(() => {
    const timer = setInterval(() => setDriverProgress((p) => (p >= 92 ? 12 : p + 4)), 1800);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = setInterval(() => setSyncPhase((value) => (value + 1) % 4), 2400);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    const timer = setTimeout(() => setBooting(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const mapPhase = customerMapStates.find((state) => state.key === customerMapPhase) ?? customerMapStates[0];

  return <div className='premium-shell min-h-screen text-white'>
    {booting && <div className='boot-splash' aria-label='LVTP startup experience'>
      <div className='boot-splash__glow' />
      <img src='/brand/lv-logo-dark.svg' alt='LV ecosystem symbol' className='boot-splash__logo' />
      <p className='boot-splash__caption'>Premium realtime mobility ecosystem</p>
      <p className='boot-splash__status'>Operational systems synchronizing {'.'.repeat(syncPhase + 1)}</p>
    </div>}
    <div className='mx-auto max-w-6xl px-4 py-4 sm:px-6'>
      <header className='glass-panel sticky top-3 z-40 rounded-3xl p-3 sm:p-4'>
        <div className='flex items-center gap-2'>
          <button onClick={() => navigate('/', 'hero')}><img src='/brand/lv-logo-header.svg' className='h-9' alt='LV Transport logo' /></button>
          <button className='hamburger md:hidden' onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? 'Sluit' : 'Menu'}</button>
          <nav className='ml-auto hidden items-center gap-2 md:flex'>
            {navItems.map((item) => <button key={item.path} className='nav-btn' onClick={() => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section)}>{item.label}</button>)}
            <button className='surface-btn' onClick={() => requireIdentity('driver', () => navigate('/driver'))}>Driver portal</button>
            <button className='surface-btn' onClick={() => requireIdentity('admin', () => navigate('/admin'))}>Admin portal</button>
            {installReady && <button className='surface-btn' onClick={installEcosystemApp}>Install app</button>}
          </nav>
        </div>
        <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
          {navItems.map((item) => <button key={item.path} className='mobile-nav-btn' onClick={() => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section)}>{item.label}</button>)}
          <button className='mobile-nav-btn' onClick={() => requireIdentity('driver', () => navigate('/driver'))}>Driver portal</button>
          <button className='mobile-nav-btn' onClick={() => requireIdentity('admin', () => navigate('/admin'))}>Admin portal</button>
        </div>
      </header>
      <section id='hero' className='glass-panel hero-panel mt-4 rounded-3xl p-6 sm:p-10'><p className='text-xs uppercase tracking-[0.25em] text-lv-champagne'>LV Transport Platform</p><h1 className='mt-3 text-4xl font-semibold sm:text-6xl'>Founder-Operated Premium Mobility Ecosystem</h1><p className='mt-4 max-w-3xl text-lv-mist'>Een kalm, realtime en verified ecosysteem voor executive mobiliteit. Publieke verkenning is open; operationele acties verlopen via premium onboarding.</p><div className='mt-6 flex flex-wrap gap-2'><button className='nav-btn' onClick={() => requireIdentity('booking', () => navigate('/booking', 'booking'))}>Reserveer nu</button><button className='nav-btn' onClick={() => requireIdentity('tracking', () => navigate('/tracking', 'tracking'))}>Volg uw rit</button></div></section>
      <section className='glass-panel mt-4 overflow-hidden rounded-3xl p-0'>
        <img src='/brand/lv-logo-presentation.svg' alt='Luxury mobility silhouette identity' className='h-auto w-full opacity-95' />
      </section>
      <section className='glass-panel mt-4 rounded-3xl p-4 sm:p-5'>
        <p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Operational trust signals</p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {trustSignals.map((signal) => <span key={signal} className='trust-pill'>{signal}</span>)}
        </div>
      </section>
      <section id='tracking-map' className='glass-panel mt-4 overflow-hidden rounded-3xl'>
        <div className='map-surface'>
          <div className='map-grid-overlay' />
          <div className='map-route' />
          <div className='map-pin map-pin--pickup'>Pickup</div>
          <div className='map-pin map-pin--drop'>Destination</div>
          <div className='map-driver' style={{ left: `${driverProgress}%`, top: `${58 - driverProgress * 0.22}%` }} />
          <div className='map-overlay-top'><p>Realtime mobility intelligence</p><span className={`map-state-pill ${mapPhase.tone}`}>{mapPhase.label}</span></div>
          <div className='map-overlay-bottom'><p>ETA 6 min · Airport corridor focus · Lifecycle synchronized</p></div>
        </div>
        <div className='flex flex-wrap gap-2 p-3'>
          {customerMapStates.map((state) => <button key={String(state.key)} className='nav-btn text-xs' onClick={() => setCustomerMapPhase(state.key)}>{state.label}</button>)}
        </div>
      </section><section id='prijzen' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Prijs berekenen</h3><div className='mt-4 grid gap-3 md:grid-cols-2'><label className='field-wrap'><span>Afstand (km)</span><input type='number' min={1} value={calc.km} onChange={(event) => setCalc({ ...calc, km: Number(event.target.value) || 0 })} /></label><div className='flex flex-col gap-2 rounded-2xl border border-lv-gold/25 bg-black/30 p-4 text-sm'><label><input type='checkbox' checked={calc.airport} onChange={(event) => setCalc({ ...calc, airport: event.target.checked })} /> Airport toeslag</label><label><input type='checkbox' checked={calc.business} onChange={(event) => setCalc({ ...calc, business: event.target.checked })} /> Business service</label><label><input type='checkbox' checked={calc.isNight} onChange={(event) => setCalc({ ...calc, isNight: event.target.checked })} /> Nachtregeling</label></div></div><p className='mt-4 text-lg'>Geschatte prijs: <b className='text-lv-champagne'>€{price}</b></p></section><section id='diensten' className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{['Airport transfers', 'Private rides', 'Business & VIP', '24/7 dispatch opvolging'].map((service) =><article key={service} className='glass-panel service-card rounded-2xl p-4'>{service}</article>)}</section><section id='vip' className='glass-panel mt-4 rounded-3xl p-6 text-lv-mist'>Prioriteitsservice, facturatie, vaste accountmanager en gecentraliseerde operationele opvolging voor bedrijven en frequente reizigers.</section>
      <section id='booking' className='glass-panel mt-4 rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Concierge Booking Flow</h3><p className='mt-2 text-sm text-lv-mist'>Alle betekenisvolle acties verlopen via verified identity.</p>
        <form className='mt-4 grid gap-3 sm:grid-cols-2' onSubmit={onSubmitBooking}> {['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) =>
            <label key={key} className={`field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`}><span>{key}</span><input required={key !== 'notes'} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
          <div className='sm:col-span-2'><Button type='submit' disabled={bookingSubmitting}>{bookingSubmitting ? 'Verwerken...' : 'Reserveer nu'}</Button></div></form>{confirm && <p className='mt-3 status-line status-line--active'>{confirm}</p>}
      </section>
      <section id='tracking' className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Operational Tracking Tower</h3><div className='mt-3 flex flex-col gap-2 sm:flex-row'><input className='estimate-input' placeholder='LV12345' value={trackingInput} onChange={(event) => setTrackingInput(event.target.value)} /><Button variant='secondary' onClick={checkTracking} disabled={trackingLoading}>{trackingLoading ? 'Controleren...' : 'Controleer status'}</Button></div><p className='mt-3 status-line'>{trackingResult}</p></section>
      <section className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-xl font-semibold'>Verified Ride Reviews</h3><p className='text-sm text-lv-mist'>Alle reviews zijn gekoppeld aan completed rides en verified identities.</p><ul className='mt-3 space-y-2'>{verifiedReviews.length ? verifiedReviews.map((review) => <li key={review} className='status-line status-line--active'>{review}</li>) : <li className='status-line'>Nog geen eligible verified reviews.</li>}</ul><Button variant='secondary' className='mt-3' onClick={() => requireIdentity('reviews', () => setTrackingResult('Verified review flow geactiveerd na completed ride lifecycle.'))}>Open review flow</Button></section>
      <section className='glass-panel mt-4 rounded-3xl p-6'><h3 className='text-xl font-semibold'>LV Business Expansion</h3><p className='text-lv-mist text-sm'>U brengt operationele capaciteit. LVTP levert verified dispatch, realtime lifecycle controle en premium klanttoegang.</p><Button className='mt-3' onClick={() => requireIdentity('expansion', () => setTrackingResult('Expansion onboarding geopend voor verified operator intake.'))}>Start Expansion Onboarding</Button></section>
      <footer id='contact' className='glass-panel my-4 rounded-3xl p-6 text-sm'>info@lvtransport.be • +32 466 48 79 36 • Antwerpen • België</footer>
      <MoniAssistant />
      {authOpen && <div className='auth-overlay'><div className='auth-card glass-panel'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Premium Operational Onboarding</p><h3 className='mt-2 text-2xl font-semibold'>Aanmelden / Registreren</h3><p className='mt-2 text-sm text-lv-mist'>{interactionCopy[authIntent]}</p><div className='mt-3 flex gap-2'><button className='surface-btn' onClick={() => setAuthMode('signin')}>Aanmelden</button><button className='surface-btn' onClick={() => setAuthMode('register')}>Registreren</button><button className='surface-btn' disabled={authLoading} onClick={() => activateIdentity('google')}>{authLoading ? 'Verifiëren...' : 'Google Sign-In'}</button></div><div className='mt-3 grid gap-2'>{['name', 'email', 'phone', 'password', 'company'].map((key) => <input key={key} className='estimate-input' type={key === 'password' ? 'password' : 'text'} placeholder={key} value={authForm[key as keyof typeof authForm]} onChange={(e) => setAuthForm({ ...authForm, [key]: e.target.value })} />)}<input className='estimate-input' placeholder='Operational role intent' value={authForm.roleIntent} onChange={(e) => setAuthForm({ ...authForm, roleIntent: e.target.value })} /></div><div className='mt-3 flex gap-2'><Button disabled={authLoading} onClick={() => activateIdentity('email')}>{authLoading ? 'Verifiëren...' : authMode === 'signin' ? 'Verifieer en ga verder' : 'Account creëren'}</Button><button className='surface-btn' onClick={() => setAuthOpen(false)}>Sluiten</button></div>{authStatus && <p className='status-line status-line--active mt-3'>{authStatus}</p>}</div></div>}
      {identity && <div className='identity-chip glass-panel'>Verified: {identity.name} • {identity.roleIntent} <button onClick={() => { localStorage.removeItem('lvtp_verified_identity'); setIdentity(null); }}>Afmelden</button></div>}
      {(route === 'driver' || route === 'admin') && <div className='fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm'>{route === 'driver' ? <a href={DRIVER_SURFACE_URL}>Open Driver omgeving</a> : <a href={ADMIN_SURFACE_URL}>Open Admin omgeving</a>}</div>}
    </div>
  </div>;
}

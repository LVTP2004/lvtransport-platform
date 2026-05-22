import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { ProtectedRoute } from '../modules/auth/route-guards/protected-route';
import { webAuthProvider, webAuthService } from '../modules/auth/services/auth-client.service';
import { AccountStatus, type AuthState, type UserAccount, UserRole } from '@lvtransport/auth';

type Step = 1 | 2 | 3;
type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number };
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3 },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6 },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10 }
];

const formatDateTime = (value: string) => (!value ? 'Select schedule' : new Date(value).toLocaleString('en-US'));
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { getInstallPromptState } from '../pwa';
import { Button } from '@lvtransport/ui';
import { BookingLifecycle, isImmutableLifecycleStatus } from '@lvtransport/realtime';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
import { OperationsConsole } from '../pages/OperationsConsole';

type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin' | 'operations';
import { CommandCenter } from '../pages/CommandCenter';
import { AuditReplay } from '../pages/AuditReplay';
import { WarRoom } from '../pages/WarRoom';

type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'investigation' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin';
type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin' | 'command-center' | 'audit-replay' | 'war-room';
type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin' | 'replay-theater' | 'governance' | 'topology';
type Step = 1 | 2 | 3;
type Provider = 'stripe' | 'payconiq';
type RouteKey = 'home' | 'booking' | 'prijzen' | 'tracking' | 'diensten' | 'vip' | 'contact' | 'driver' | 'admin';
type BookingStatus = 'draft' | 'submitted' | 'confirmed' | BookingLifecycle;
type AuthMode = 'signin' | 'register';
type InteractionIntent = 'booking' | 'tracking' | 'investigation' | 'vip' | 'business' | 'driver' | 'admin' | 'reviews' | 'expansion';

type BookingRecord = {
  code: string;
  id?: string;
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



type InvestigationArtifact = {
  id: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  requestId?: string;
  category?: string;
  timestamp?: string;
  sourceFile?: string;
  sourceCategory?: string;
  lineageReference?: string;
  replayReference?: string;
  transitionReference?: string;
  runbookReference?: string;
  incidentId?: string;
  notificationFailureId?: string;
};

type InvestigationFilters = {
  entityType: string; entityId: string; correlationId: string; requestId: string; category: string; sourceFile: string; from: string; to: string;
};

const readOperationalArtifacts = (): InvestigationArtifact[] => {
  const fromWindow = (window as Window & { __LV_OPERATIONAL_MEMORY__?: unknown }).__LV_OPERATIONAL_MEMORY__;
  const fromScript = document.getElementById('lv-operational-memory')?.textContent;
  const fromStorage = localStorage.getItem('lv_operational_memory_artifacts');
  const candidates: unknown[] = [fromWindow, fromScript, fromStorage];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      const parsed = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
      const list = Array.isArray(parsed) ? parsed : Array.isArray((parsed as { artifacts?: unknown[] })?.artifacts) ? (parsed as { artifacts: unknown[] }).artifacts : null;
      if (!list) continue;
      return list
        .map((item, index) => ({ ...(item as Record<string, unknown>), id: String((item as { id?: string }).id ?? `artifact-${index}`) }))
        .filter((item) => typeof item.id === 'string') as InvestigationArtifact[];
    } catch {
      continue;
    }
  }
  return [];
};
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';

const routeMap: Record<string, RouteKey> = {
  '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin', '/operations': 'operations'
  '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/investigation': 'investigation', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin'
  '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin', '/command-center': 'command-center', '/audit-replay': 'audit-replay', '/war-room': 'war-room'
  '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin', '/replay-theater': 'replay-theater', '/governance': 'governance', '/topology': 'topology'
};


function TrackingPage() {
  const trackingCode = window.location.pathname.split('/').filter(Boolean).at(-1) ?? '';
  return (
    <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-3xl glass-panel rounded-3xl p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">Public tracking</p>
        <h1 className="mt-3 text-3xl font-semibold">Track your ride</h1>
        <p className="mt-3 text-sm text-lv-mist">Tracking code lookup flow is prepared for API integration.</p>
        <div className="mt-4 rounded-2xl border border-lv-gold/20 bg-black/30 p-4 text-sm text-lv-mist">
          Tracking code: <strong className="text-white">{trackingCode || 'missing code'}</strong>
        </div>
      </div>
    </div>
  );
}
const primaryNavItems = [
  { label: 'Home', path: '/', section: 'hero' },
  { label: 'Booking', path: '/booking', section: 'booking', intent: 'booking' as InteractionIntent },
  { label: 'Tracking', path: '/tracking', section: 'tracking', intent: 'tracking' as InteractionIntent },
  { label: 'Investigation', path: '/investigation', section: 'investigation', intent: 'investigation' as InteractionIntent },
  { label: 'Diensten', path: '/diensten', section: 'diensten' },
  { label: 'Contact', path: '/contact', section: 'contact' }
];
const secondaryItems: Array<{ label: string; path?: '/driver' | '/admin'; section?: 'tracking-map' }> = [{ label: 'Maps', section: 'tracking-map' }, { label: 'Driver', path: '/driver' }, { label: 'Admin', path: '/admin' }];

const utilityNavItems = [
  { label: 'Replay Theater', path: '/replay-theater' },
  { label: 'Governance', path: '/governance' },
  { label: 'Topology', path: '/topology' },
  { label: 'Driver', path: '/driver', intent: 'driver' as InteractionIntent },
  { label: 'Admin', path: '/admin', intent: 'admin' as InteractionIntent },
  { label: 'Operations', path: '/operations' },
  { label: 'Maps', path: '/tracking-map', section: 'tracking-map' },
  { label: 'Moni Ride', path: '/vip', section: 'vip', intent: 'vip' as InteractionIntent }
];

const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
const trustSignals = ['Verified Driver', 'Realtime Connected', 'Airport Synchronized', 'Secure Payment', 'LV Certified', 'Premium Operator'] as const;
const interactionCopy: Record<InteractionIntent, string> = {
  booking: 'Reserveer premium ritten en operational lifecycle updates.',
  tracking: 'Bekijk realtime lifecycle, dispatch updates en ride intelligence.',
  investigation: 'Inspecteer operationele continuiteit met read-only evidence en lineage.',
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

export function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true });
  const [user, setUser] = useState<UserAccount | undefined>();
  const [email, setEmail] = useState('customer@lvtransport.dev');
  const [password, setPassword] = useState('password123');
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [businessVip, setBusinessVip] = useState(true);

  if (window.location.pathname.startsWith('/tracking')) {
    return <TrackingPage />;
  }

  const baseFare = useMemo(() => {
    const distanceFactor = Math.max(14, (pickup.length + destination.length) * 0.8);
    const passengerFactor = passengers > 3 ? (passengers - 3) * 6 : 0;
    const airportFee = airportTransfer ? 18 : 0;
    const vipFee = businessVip ? 24 : 0;
    const total = (distanceFactor + passengerFactor + airportFee + vipFee) * vehicle.priceMultiplier;
    return Math.round(total);
  }, [airportTransfer, businessVip, destination.length, passengers, pickup.length, vehicle.priceMultiplier]);

  const nextStep = () => setStep((v) => (v < 3 ? ((v + 1) as Step) : v));
  const prevStep = () => setStep((v) => (v > 1 ? ((v - 1) as Step) : v));

  return (
    <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="glass-panel mb-6 rounded-3xl p-5 sm:p-7">
          <p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Booking</p>
          <h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Premium ride booking, built for enterprise pace.</h1>
          <p className="mt-3 max-w-2xl text-sm text-lv-mist sm:text-base">
            Smart routing-ready UI prepared for future maps, places autocomplete, and dispatch APIs.
          </p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rounded-3xl p-4 sm:p-6">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-lv-mist">Step {step} of 3</p>
              <div className="flex w-32 gap-2">
                {[1, 2, 3].map((i) => (
                  <span key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-lv-gold' : 'bg-white/15'}`} />
                ))}
              </div>
            </div>
  useEffect(() => { webAuthService.getInitialState().then(setAuthState); }, []);

  const baseFare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup.length, destination.length, passengers, airportTransfer, businessVip, vehicle.priceMultiplier]);

  const login = async () => {
    const tokens = await webAuthService.signIn({ email, password });
    const session = await webAuthProvider.getSession(tokens.accessToken);
    const profile = await webAuthProvider.getUserProfile(tokens.accessToken);
    setAuthState({ isAuthenticated: true, isLoading: false, tokens, session });
    setUser(profile);
  };
  const logout = async () => { if (authState.session) await webAuthService.signOut(authState.session.sessionId); setAuthState({ isAuthenticated: false, isLoading: false }); setUser(undefined); };

  const canAccess = authState.isAuthenticated && user?.status === AccountStatus.ACTIVE && user.roles.includes(UserRole.CUSTOMER);

  if (!authState.isAuthenticated) return <div className="min-h-screen bg-lv-black text-white p-8"><h1 className="text-2xl mb-4">Customer Login</h1><input className="text-black p-2 mr-2" value={email} onChange={(e)=>setEmail(e.target.value)} /><input className="text-black p-2 mr-2" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} /><Button onClick={login}>Sign in</Button></div>;

  return <ProtectedRoute allowed={canAccess} fallback={<div className="min-h-screen bg-lv-black text-white p-8">Account not active for customer booking.<Button onClick={logout}>Logout</Button></div>}><div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><Button variant="secondary" onClick={logout}>Logout</Button><p className='mt-2 text-sm'>Onboarding: {user?.onboardingStep}</p><p>{user?.profile.firstName} {user?.profile.lastName}</p><div className="mx-auto w-full max-w-6xl"><header className="glass-panel mb-6 rounded-3xl p-5 sm:p-7"><p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Booking</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Premium ride booking, built for enterprise pace.</h1></header><section><label><input value={pickup} onChange={(e)=>setPickup(e.target.value)} /></label><label><input value={destination} onChange={(e)=>setDestination(e.target.value)} /></label><label><input type='datetime-local' value={dateTime} onChange={(e)=>setDateTime(e.target.value)} /></label><p>${baseFare} {formatDateTime(dateTime)}</p></section></div></div></ProtectedRoute>;
  const [provider, setProvider] = useState<Provider>('stripe');
  const [paymentState, setPaymentState] = useState<'idle' | 'checkout_prepared' | 'session_created' | 'confirmed'>('idle');

  const baseFare = useMemo(() => Math.round(Math.max(14, (pickup.length + destination.length) * 0.8) * vehicle.priceMultiplier + (passengers > 3 ? (passengers - 3) * 6 : 0)), [destination.length, passengers, pickup.length, vehicle.priceMultiplier]);

  const confirmFlow = () => {
    setPaymentState('checkout_prepared');
    setTimeout(() => setPaymentState('session_created'), 200);
    setTimeout(() => setPaymentState('confirmed'), 450);
  };

  return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl"><header className="glass-panel mb-6 rounded-3xl p-5 sm:p-7"><p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Booking</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Premium ride booking, built for enterprise pace.</h1></header><section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="glass-panel rounded-3xl p-4 sm:p-6"><div className="mb-6 flex items-center justify-between"><p className="text-sm text-lv-mist">Step {step} of 3</p></div>{step===1&&<div className="space-y-4"><label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e)=>setPickup(e.target.value)} /></label><label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e)=>setDestination(e.target.value)} /></label></div>}{step===2&&<div className="space-y-4"><div className="field-wrap"><span>Passengers</span><div className="mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3"><button className="control-btn" onClick={()=>setPassengers((v)=>Math.max(1,v-1))}>−</button><strong className="text-lg">{passengers}</strong><button className="control-btn" onClick={()=>setPassengers((v)=>Math.min(12,v+1))}>+</button></div></div>{vehicles.map((item)=><button key={item.name} onClick={()=>setVehicle(item)} className={`vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`}>{item.name}</button>)}</div>}{step===3&&<div className="space-y-4"><p className="text-sm text-lv-mist">Payment provider (test mode)</p><div className="grid grid-cols-2 gap-3"><button onClick={()=>setProvider('stripe')} className={`vehicle-card ${provider==='stripe' ? 'vehicle-card--active' : ''}`}>Stripe Test</button><button onClick={()=>setProvider('payconiq')} className={`vehicle-card ${provider==='payconiq' ? 'vehicle-card--active' : ''}`}>Payconiq Placeholder</button></div><div className="rounded-2xl border border-lv-gold/20 bg-black/30 p-4 text-sm text-lv-mist">No real card charge. No card data stored. Session IDs are test placeholders only.</div></div>}<div className="mt-6 flex gap-3"><Button variant="secondary" className="flex-1" onClick={() => setStep((v) => (v > 1 ? ((v - 1) as Step) : v))}>Back</Button>{step<3?<Button className="flex-1" onClick={() => setStep((v) => (v < 3 ? ((v + 1) as Step) : v))}>Continue</Button>:<Button className="flex-1 shadow-gold-md" onClick={confirmFlow}>Confirm booking + test pay</Button>}</div></div><aside className="space-y-6"><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Price estimate</p><p className="mt-3 text-4xl font-semibold">${baseFare}</p><p className="mt-1 text-sm text-lv-mist">Provider: {provider}</p></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Payment confirmation</p><p className="mt-3 text-sm text-lv-mist">State: {paymentState}</p>{paymentState==='confirmed'&&<div className="mt-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm">Payment captured in test mode. Booking lifecycle remains compatible.</div>}</article></aside></section></div></div>;
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
  const [operationalArtifacts, setOperationalArtifacts] = useState<InvestigationArtifact[]>([]);
  const [investigationFilters, setInvestigationFilters] = useState<InvestigationFilters>({ entityType: '', entityId: '', correlationId: '', requestId: '', category: '', sourceFile: '', from: '', to: '' });


  useEffect(() => {
    setOperationalArtifacts(readOperationalArtifacts());
  }, []);

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
    if (!API_BASE_URL) {
      setConfirm('Boeking kan niet verzonden worden: API endpoint ontbreekt. Contacteer dispatch.');
      setBookingSubmitting(false);
      return;
    }
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
    const payload: BookingRecord = { ...form, name: identity.name, phone: identity.phone || form.phone, code, createdAt: new Date().toISOString(), status: 'submitted' };
    const dedupeKey = `web-booking-${payload.phone}-${payload.date}-${payload.time}-${payload.pickup}`;
    if (sessionStorage.getItem(dedupeKey)) {
      setConfirm('Dubbele verzending geblokkeerd. Uw eerdere boeking werd al verwerkt.');
      setBookingSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!response.ok) {
        setConfirm('Boeking niet opgeslagen in dispatch. Probeer opnieuw of contacteer support.');
        setBookingSubmitting(false);
        return;
      }
      const result = await response.json() as { id?: string; referenceCode?: string; status?: string };
      const referenceCode = result.referenceCode ?? payload.code;
      sessionStorage.setItem(dedupeKey, referenceCode);
      setConfirmedReviewSeed(referenceCode);
      setConfirm(`Bedankt ${identity.name || 'klant'}, uw rit ${referenceCode} is bevestigd in dispatch.`);
    } catch {
      setConfirm('Boeking niet verzonden door netwerkfout. Geen lokale fallback gebruikt. Probeer opnieuw.');
    }
    setBookingSubmitting(false);
  };

  const setConfirmedReviewSeed = (rideCode: string) => {
    setVerifiedReviews((existing) => Array.from(new Set([`Verified Ride Review unlocked for ${rideCode}`, ...existing])).slice(0, 5));
  };

  const checkTracking = async () => {
    if (trackingLoading) return;
    if (!identity) return startIntent('tracking');
    setTrackingLoading(true);
    const normalized = trackingInput.trim().toUpperCase();
    if (!/^LV\d{5}$/.test(normalized)) return setTrackingResult('Ongeldige code. Gebruik formaat LV12345.');
    const records = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]') as BookingRecord[];
    const ride = records.find((r) => r.code === normalized);
    if (!ride) return setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);
    const lifecycle = normalizeLifecycle(ride.status);
    if (!lifecycle) return setTrackingResult(`Rit ${ride.code}: status onbekend, neem contact op met dispatch.`);
    const immutable = isImmutableLifecycleStatus(lifecycle);
    setTrackingResult(`Rit ${ride.code}: status ${lifecycle.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
    if (!normalized) {
      setTrackingResult('Voer een trackingcode in uit uw bevestiging.');
      setTrackingLoading(false);
      return;
    }
    if (!API_BASE_URL) {
      setTrackingResult('Tracking niet beschikbaar: API endpoint ontbreekt. Contacteer dispatch.');
      setTrackingLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/tracking/booking/${normalized}`);
      if (!response.ok) {
        setTrackingResult(`Rit ${normalized} niet gevonden in operationele database.`);
        setTrackingLoading(false);
        return;
      }
      const payload = await response.json() as { data?: { code?: string; status?: string } };
      const ride = payload.data;
      if (!ride?.code || !ride?.status) {
        setTrackingResult(`Rit ${normalized}: onvolledige trackingdata, contacteer dispatch.`);
        setTrackingLoading(false);
        return;
      }
      const lifecycle = normalizeLifecycle(ride.status as BookingStatus);
      if (!lifecycle) {
        setTrackingResult(`Rit ${ride.code}: status onbekend, neem contact op met dispatch.`);
        setTrackingLoading(false);
        return;
      }
      const immutable = isImmutableLifecycleStatus(lifecycle);
      setTrackingResult(`Rit ${ride.code}: status ${lifecycle.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
    } catch {
      setTrackingResult('Tracking tijdelijk niet bereikbaar door netwerkfout. Probeer opnieuw.');
    }
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

  const filteredArtifacts = useMemo(() => operationalArtifacts.filter((item) => {
    const timestamp = item.timestamp ? new Date(item.timestamp).getTime() : null;
    const from = investigationFilters.from ? new Date(investigationFilters.from).getTime() : null;
    const to = investigationFilters.to ? new Date(investigationFilters.to).getTime() : null;
    return (!investigationFilters.entityType || item.entityType === investigationFilters.entityType)
      && (!investigationFilters.entityId || item.entityId === investigationFilters.entityId)
      && (!investigationFilters.correlationId || item.correlationId === investigationFilters.correlationId)
      && (!investigationFilters.requestId || item.requestId === investigationFilters.requestId)
      && (!investigationFilters.category || item.category === investigationFilters.category)
      && (!investigationFilters.sourceFile || item.sourceFile === investigationFilters.sourceFile)
      && (!from || (timestamp !== null && timestamp >= from))
      && (!to || (timestamp !== null && timestamp <= to));
  }), [operationalArtifacts, investigationFilters]);


  const replayArtifacts = filteredArtifacts.filter((item) => item.replayReference);
  const transitionArtifacts = filteredArtifacts.filter((item) => item.transitionReference);

  const mapPhase = customerMapStates.find((state) => state.key === customerMapPhase) ?? customerMapStates[0];
  const playUiSound = (tone: 'success' | 'click' = 'click') => {
    const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = tone === 'success' ? 620 : 460;
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.025, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + (tone === 'success' ? 0.18 : 0.08));
    osc.start(now);
    osc.stop(now + (tone === 'success' ? 0.2 : 0.1));
  };

  return <div className='premium-shell min-h-screen text-white'>
    {booting && <div className='boot-splash' aria-label='LVTP startup experience'>
      <div className='boot-splash__glow' />
      <img src='/brand/lv-logo-dark.svg' alt='LV ecosystem symbol' className='boot-splash__logo' />
      <p className='boot-splash__caption'>Premium realtime mobility ecosystem</p>
      <p className='boot-splash__status'>Operational systems synchronizing {'.'.repeat(syncPhase + 1)}</p>
    </div>}
    <div className='mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-6 sm:py-6'>
      <header className='glass-panel sticky top-3 z-40 rounded-3xl p-3 sm:p-4'>
        <div className='flex items-center gap-2'>
          <button onClick={() => navigate('/', 'hero')}><img src='/brand/lv-logo-header.svg' className='h-9' alt='LV Transport logo' /></button>
          <button className='hamburger md:hidden' onClick={() => setMenuOpen((value) => !value)}>{menuOpen ? 'Sluit' : 'Menu'}</button>
          <nav className='ml-auto hidden items-center gap-2 md:flex'>
            <div className='nav-group-primary'>
              {primaryNavItems.map((item) => <button key={item.path} className='nav-btn nav-btn--primary' onClick={() => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section)}>{item.label}</button>)}
            </div>
            <div className='nav-group-utility'>
              {utilityNavItems.map((item) => <button key={item.label} className='nav-btn nav-btn--utility' onClick={() => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section)}>{item.label}</button>)}
              {installReady && <button className='nav-btn nav-btn--utility' onClick={installEcosystemApp}>Install app</button>}
            </div>
          </nav>
        </div>
        <div className={`mobile-menu-overlay ${menuOpen ? 'mobile-menu-overlay--open' : ''}`} onClick={() => setMenuOpen(false)} />
        <div className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}>
          <p className='mobile-menu-title'>Primary</p>
          {primaryNavItems.map((item) => <button key={item.path} className='mobile-nav-btn mobile-nav-btn--primary' onClick={() => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section)}>{item.label}</button>)}
          <p className='mobile-menu-title'>Tools</p>
          {utilityNavItems.map((item) => <button key={item.label} className='mobile-nav-btn mobile-nav-btn--utility' onClick={() => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section)}>{item.label}</button>)}
          {installReady && <button className='mobile-nav-btn mobile-nav-btn--utility' onClick={installEcosystemApp}>Install app</button>}
        </div>
      </header>

      {route === 'command-center' && <CommandCenter />}
      {route === 'audit-replay' && <AuditReplay />}
      {route === 'war-room' && <WarRoom />}
      <section id='hero' className='glass-panel hero-panel rounded-3xl p-6 sm:p-10'><p className='text-xs uppercase tracking-[0.25em] text-lv-champagne'>LV Transport Platform</p><h1 className='mt-3 text-4xl font-semibold sm:text-6xl'>Calm Luxury Mobility, Realtime Intelligence</h1><p className='mt-4 max-w-3xl text-lv-mist'>Een emotioneel premium, realtime en verified ecosysteem voor executive mobiliteit met concierge-grade coordinatie en operationele rust.</p><div className='mt-6 flex flex-wrap gap-3'><button className='nav-btn nav-btn--primary' onClick={() => requireIdentity('booking', () => navigate('/booking', 'booking'))}>Reserveer nu</button><button className='nav-btn nav-btn--secondary' onClick={() => requireIdentity('tracking', () => navigate('/tracking', 'tracking'))}>Volg uw rit</button></div></section>
      <section className='glass-panel overflow-hidden rounded-3xl p-0'>
        <img src='/brand/lv-logo-presentation.svg' alt='Luxury mobility silhouette identity' className='h-auto w-full opacity-95' />
      </section>
      <section className='glass-panel rounded-3xl p-4 sm:p-5'>
        <p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Operational trust signals</p>
        <div className='mt-3 flex flex-wrap gap-2'>
          {trustSignals.map((signal) => <span key={signal} className='trust-pill'>{signal}</span>)}
        </div>
      </section>
      <section id='tracking-map' className='glass-panel overflow-hidden rounded-3xl'>
        <div className='map-surface'>
          <div className='map-grid-overlay' />
          <div className='map-route' />
          <div className='map-pin map-pin--pickup'>Pickup</div>
          <div className='map-pin map-pin--drop'>Destination</div>
          <div className='map-driver' style={{ left: `${driverProgress}%`, top: `${58 - driverProgress * 0.22}%` }} />
          <div className='map-overlay-top'><p>Realtime mobility intelligence</p><span className={`map-state-pill ${mapPhase.tone}`}>{mapPhase.label}</span></div>
          <div className='map-overlay-bottom'><p>ETA 6 min · Airport corridor synchronized · Concierge lifecycle live</p></div>
        </div>
        <div className='flex flex-wrap gap-2 p-3'>
          {customerMapStates.map((state) => <button key={String(state.key)} className='nav-btn nav-btn--secondary text-xs' onClick={() => setCustomerMapPhase(state.key)}>{state.label}</button>)}
        </div>
      </section><section id='prijzen' className='glass-panel rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Prijs berekenen</h3><div className='mt-4 grid gap-3 md:grid-cols-2'><label className='field-wrap'><span>Afstand (km)</span><input type='number' min={1} value={calc.km} onChange={(event) => setCalc({ ...calc, km: Number(event.target.value) || 0 })} /></label><div className='flex flex-col gap-2 rounded-2xl border border-lv-gold/25 bg-black/30 p-4 text-sm'><label><input type='checkbox' checked={calc.airport} onChange={(event) => setCalc({ ...calc, airport: event.target.checked })} /> Airport toeslag</label><label><input type='checkbox' checked={calc.business} onChange={(event) => setCalc({ ...calc, business: event.target.checked })} /> Business service</label><label><input type='checkbox' checked={calc.isNight} onChange={(event) => setCalc({ ...calc, isNight: event.target.checked })} /> Nachtregeling</label></div></div><p className='mt-4 text-lg'>Geschatte prijs: <b className='text-lv-champagne'>€{price}</b></p></section><section id='diensten' className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{['Airport transfers', 'Private rides', 'Business & VIP', '24/7 dispatch opvolging'].map((service) =><article key={service} className='glass-panel service-card rounded-2xl p-4'>{service}</article>)}</section><section id='vip' className='glass-panel rounded-3xl p-6 text-lv-mist'>Prioriteitsservice, facturatie, vaste accountmanager en gecentraliseerde operationele opvolging voor bedrijven en frequente reizigers.</section>
      <section id='booking' className='glass-panel rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Concierge Booking Flow</h3><p className='mt-2 text-sm text-lv-mist'>Alle betekenisvolle acties verlopen via verified identity.</p>
        <form className='mt-4 grid gap-3 sm:grid-cols-2' onSubmit={onSubmitBooking}> {['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) =>
            <label key={key} className={`field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`}><span>{key}</span><input required={key !== 'notes'} value={form[key as keyof typeof form]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} /></label>)}
          <div className='sm:col-span-2'><Button type='submit' disabled={bookingSubmitting} onClick={() => playUiSound('click')}>{bookingSubmitting ? 'Verwerken...' : 'Reserveer nu'}</Button></div></form>{confirm && <p className='mt-3 status-line status-line--active'>{confirm}</p>}
      </section>
      <section id='tracking' className='glass-panel rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Operational Tracking Tower</h3><div className='mt-3 flex flex-col gap-3 sm:flex-row'><input className='estimate-input estimate-input--tracking' placeholder='LV12345' value={trackingInput} onChange={(event) => setTrackingInput(event.target.value)} /><Button className='tracking-cta' onClick={checkTracking} disabled={trackingLoading}>{trackingLoading ? 'Synchronisatie...' : 'Controleer status'}</Button></div><p className='mt-3 status-line'>{trackingResult}</p></section>
      <section className='glass-panel rounded-3xl p-6'><h3 className='text-xl font-semibold'>Verified Ride Reviews</h3><p className='text-sm text-lv-mist'>Alle reviews zijn gekoppeld aan completed rides en verified identities.</p><ul className='mt-3 space-y-2'>{verifiedReviews.length ? verifiedReviews.map((review) => <li key={review} className='status-line status-line--active'>{review}</li>) : <li className='status-line'>Nog geen eligible verified reviews.</li>}</ul><Button variant='secondary' className='mt-3' onClick={() => requireIdentity('reviews', () => setTrackingResult('Verified review flow geactiveerd na completed ride lifecycle.'))}>Open review flow</Button></section>
      <section className='glass-panel rounded-3xl p-6'><h3 className='text-xl font-semibold'>LV Business Expansion</h3><p className='text-lv-mist text-sm'>U brengt operationele capaciteit. LVTP levert verified dispatch, realtime lifecycle controle en premium klanttoegang.</p><Button className='mt-3' onClick={() => requireIdentity('expansion', () => setTrackingResult('Expansion onboarding geopend voor verified operator intake.'))}>Start Expansion Onboarding</Button></section>
      {route === 'operations' && <OperationsConsole />}

      <section id='investigation' className='glass-panel rounded-3xl p-6'>
        <h3 className='text-2xl font-semibold'>Operational Investigation Workspace</h3>
        <p className='mt-2 text-sm text-lv-mist'>Read-only evidence workspace for entity, correlation, request, replay, incident, notification failure and source lineage inspection.</p>
        <div className='mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
          {(['entityType','entityId','correlationId','requestId','category','sourceFile'] as const).map((key) => <label key={key} className='field-wrap'><span>{key}</span><input value={investigationFilters[key]} onChange={(event) => setInvestigationFilters({ ...investigationFilters, [key]: event.target.value })} /></label>)}
          <label className='field-wrap'><span>timestamp from</span><input type='datetime-local' value={investigationFilters.from} onChange={(event) => setInvestigationFilters({ ...investigationFilters, from: event.target.value })} /></label>
          <label className='field-wrap'><span>timestamp to</span><input type='datetime-local' value={investigationFilters.to} onChange={(event) => setInvestigationFilters({ ...investigationFilters, to: event.target.value })} /></label>
        </div>
        {!operationalArtifacts.length && <div className='mt-4 status-line'>Degraded state: no operational-memory artifacts detected. Timeline, lineage, replay and runbook references remain unavailable until evidence is provided.</div>}
        {!!operationalArtifacts.length && <>
          <p className='mt-4 text-xs uppercase tracking-[0.16em] text-lv-champagne'>Evidence panels</p>
          <div className='mt-2 grid gap-3 lg:grid-cols-2'>
            <article className='investigation-panel'><h4>Timeline ({filteredArtifacts.length})</h4>{filteredArtifacts.slice(0, 20).map((item) => <div key={item.id} className='status-line mt-2'><p>{item.timestamp ?? 'Unknown timestamp'} · {item.category ?? 'uncategorized'}</p><p className='text-xs text-lv-mist'>source: {item.sourceFile ?? 'n/a'} · lineage: {item.lineageReference ?? 'n/a'} · correlation/request: {item.correlationId ?? '-'} / {item.requestId ?? '-'}</p><p className='text-xs text-lv-mist'>runbook: {item.runbookReference ?? 'not matched'} · replay/transition: {item.replayReference ?? '-'} / {item.transitionReference ?? '-'}</p></div>)}</article>
            <article className='investigation-panel'><h4>Source lineage</h4><ul>{filteredArtifacts.map((item) => <li key={`${item.id}-lineage`} className='status-line mt-2'>{item.sourceCategory ?? 'unknown'} · {item.sourceFile ?? 'n/a'} · {item.lineageReference ?? 'n/a'}</li>)}</ul></article>
            <article className='investigation-panel'><h4>Replay history</h4><ul>{replayArtifacts.length ? replayArtifacts.map((item) => <li key={`${item.id}-replay`} className='status-line mt-2'>{item.entityType ?? 'entity'} {item.entityId ?? 'n/a'} · {item.replayReference}</li>) : <li className='status-line mt-2'>No replay references in filtered evidence.</li>}</ul></article>
            <article className='investigation-panel'><h4>Transition history</h4><ul>{transitionArtifacts.length ? transitionArtifacts.map((item) => <li key={`${item.id}-transition`} className='status-line mt-2'>{item.transitionReference} · {item.correlationId ?? 'no correlation id'}</li>) : <li className='status-line mt-2'>No transition references in filtered evidence.</li>}</ul></article>
            <article className='investigation-panel'><h4>Runbook references</h4><ul>{filteredArtifacts.map((item) => <li key={`${item.id}-runbook`} className='status-line mt-2'>{item.runbookReference ?? 'No deterministic runbook match'}</li>)}</ul></article>
            <article className='investigation-panel'><h4>Missing data / degraded state</h4><ul className='space-y-2 text-sm text-lv-mist'><li>Incident records: {filteredArtifacts.some((item) => item.incidentId) ? 'available' : 'not present in current artifacts'}</li><li>Notification failures: {filteredArtifacts.some((item) => item.notificationFailureId) ? 'available' : 'not present in current artifacts'}</li><li>Correlation coverage: {filteredArtifacts.filter((item) => item.correlationId).length}/{filteredArtifacts.length}</li><li>Request coverage: {filteredArtifacts.filter((item) => item.requestId).length}/{filteredArtifacts.length}</li></ul></article>
          </div>
        </>}
      </section>
      <section id='replay-theater' className='glass-panel rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Deterministic Replay Theater</h3><p className='text-sm text-lv-mist'>Immutable playback navigation, evidence snapshots, lineage overlays, governance markers.</p><ul className='mt-3 space-y-2 text-sm'><li>Sequence A-001 → A-002 → A-003</li><li>Execution chain is append-only and ordered by immutable event index.</li><li>Degraded mode: renders cached snapshot-only playback.</li></ul></section>
      <section id='governance' className='glass-panel rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Executive Governance Cockpit</h3><p className='text-sm text-lv-mist'>Read-only governance invariants, approval boundaries, runtime health, cognition limitations, replay governance.</p><ul className='mt-3 space-y-2 text-sm'><li>Integrity warnings are evidence-linked.</li><li>Immutable governance logs only.</li><li>No override controls or mutation authority.</li></ul></section>
      <section id='topology' className='glass-panel rounded-3xl p-6'><h3 className='text-2xl font-semibold'>Operational Topology Explorer</h3><p className='text-sm text-lv-mist'>Evidence-first relationship maps for entities, replay chains, synchronization paths, governance dependencies, and incident lineage.</p><p className='mt-2 text-sm'>No inferred edges. No speculative topology streams.</p></section>
      <footer id='contact' className='glass-panel rounded-3xl p-6 text-sm'>info@lvtransport.be • +32 466 48 79 36 • Antwerpen • België</footer>
      <MoniAssistant />
      {authOpen && <div className='auth-overlay'><div className='auth-card glass-panel'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Premium Operational Onboarding</p><h3 className='mt-2 text-2xl font-semibold'>Aanmelden / Registreren</h3><p className='mt-2 text-sm text-lv-mist'>{interactionCopy[authIntent]}</p><div className='mt-3 flex gap-2'><button className='surface-btn' onClick={() => setAuthMode('signin')}>Aanmelden</button><button className='surface-btn' onClick={() => setAuthMode('register')}>Registreren</button><button className='surface-btn' disabled={authLoading} onClick={() => activateIdentity('google')}>{authLoading ? 'Verifiëren...' : 'Google Sign-In'}</button></div><div className='mt-3 grid gap-2'>{['name', 'email', 'phone', 'password', 'company'].map((key) => <input key={key} className='estimate-input' type={key === 'password' ? 'password' : 'text'} placeholder={key} value={authForm[key as keyof typeof authForm]} onChange={(e) => setAuthForm({ ...authForm, [key]: e.target.value })} />)}<input className='estimate-input' placeholder='Operational role intent' value={authForm.roleIntent} onChange={(e) => setAuthForm({ ...authForm, roleIntent: e.target.value })} /></div><div className='mt-3 flex gap-2'><Button disabled={authLoading} onClick={() => activateIdentity('email')}>{authLoading ? 'Verifiëren...' : authMode === 'signin' ? 'Verifieer en ga verder' : 'Account creëren'}</Button><button className='surface-btn' onClick={() => setAuthOpen(false)}>Sluiten</button></div>{authStatus && <p className='status-line status-line--active mt-3'>{authStatus}</p>}</div></div>}
      {identity && <div className='identity-chip glass-panel'>Verified: {identity.name} • {identity.roleIntent} <button onClick={() => { localStorage.removeItem('lvtp_verified_identity'); setIdentity(null); }}>Afmelden</button></div>}
      {(route === 'driver' || route === 'admin') && <div className='fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm'>{route === 'driver' ? <a href={DRIVER_SURFACE_URL}>Open Driver omgeving</a> : <a href={ADMIN_SURFACE_URL}>Open Admin omgeving</a>}</div>}
    </div>
  </div>;
}

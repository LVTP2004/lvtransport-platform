import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';
type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number; serviceType: ServiceType };
type BookingConfirmation = { id: string; referenceCode: string; status: string };
type BookingEventType = 'draft_restored' | 'submit_started' | 'submit_succeeded' | 'submit_failed' | 'draft_cleared' | 'session_recovered';
type BookingEvent = { type: BookingEventType; at: string; meta?: Record<string, string | number | boolean> };
type BookingDraft = { step: Step; pickup: string; destination: string; dateTime: string; passengers: number; vehicleName: string; airportTransfer: boolean; businessVip: boolean; confirmation: BookingConfirmation | null; requestKey: string | null; events: BookingEvent[] };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const SESSION_KEY = 'lvtransport.mobile.session.v1';
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];

const formatDateTime = (value: string) => !value ? 'Select schedule' : new Date(value).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const nowIso = () => new Date().toISOString();
const loadDraft = () => { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as BookingDraft : null; } catch { return null; } };

export function App() {
  const restored = loadDraft();
  const [step, setStep] = useState<Step>(restored?.step ?? 1);
  const [pickup, setPickup] = useState(restored?.pickup ?? '');
  const [destination, setDestination] = useState(restored?.destination ?? '');
  const [dateTime, setDateTime] = useState(restored?.dateTime ?? '');
  const [passengers, setPassengers] = useState(restored?.passengers ?? 1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles.find((v) => v.name === restored?.vehicleName) ?? vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(restored?.airportTransfer ?? false);
  const [businessVip, setBusinessVip] = useState(restored?.businessVip ?? false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(restored?.confirmation ?? null);
  const [requestKey, setRequestKey] = useState<string | null>(restored?.requestKey ?? null);
  const [events, setEvents] = useState<BookingEvent[]>(restored?.events ?? []);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [installReady, setInstallReady] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const inFlightKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const draft: BookingDraft = { step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [step, pickup, destination, dateTime, passengers, vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events]);

  const appendEvent = (type: BookingEventType, meta?: BookingEvent['meta']) => setEvents((prev) => [...prev.slice(-49), { type, at: nowIso(), meta }]);
  useEffect(() => { if (restored) appendEvent('draft_restored', { hasConfirmation: Boolean(restored.confirmation) }); }, []);

  useEffect(() => {
    const sessionPayload = { lastSeenAt: nowIso(), path: window.location.pathname, step, online: navigator.onLine };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
  }, [step]);

  useEffect(() => {
    const prior = sessionStorage.getItem(SESSION_KEY);
    if (prior) appendEvent('session_recovered', { recovered: true });
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    const onInstall = () => setInstallReady(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('lv:pwa-install-available', onInstall);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') sessionStorage.setItem(SESSION_KEY, JSON.stringify({ lastSeenAt: nowIso(), step, online: navigator.onLine }));
    });
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); window.removeEventListener('lv:pwa-install-available', onInstall); };
  }, [step]);

  const baseFare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup.length, destination.length, passengers, airportTransfer, businessVip, vehicle.priceMultiplier]);
  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;

  const submitBooking = async () => {
    if (loading || !isOnline) return;
    if (!pickup || !destination || !dateTime) {
      setError('Please complete pickup, destination, and schedule before confirming.');
      return;
    }
    const dedupeKey = requestKey ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    if (inFlightKeyRef.current === dedupeKey) return;
    inFlightKeyRef.current = dedupeKey; setRequestKey(dedupeKey); setError(''); setInfo('Submitting your booking securely...'); setLoading(true); appendEvent('submit_started', { dedupeKey, step });
    try {
      const response = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey }, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'Unable to create booking');
      setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
      setInfo('Booking created successfully.');
      appendEvent('submit_succeeded', { dedupeKey, bookingId: payload.booking.id });
    } catch (e) {
      appendEvent('submit_failed', { dedupeKey });
      setError(e instanceof Error ? e.message : 'Unable to create booking');
    } finally { inFlightKeyRef.current = null; setLoading(false); }
  };

  const resetDraft = () => { localStorage.removeItem(STORAGE_KEY); appendEvent('draft_cleared'); window.location.reload(); };

  return <div className='premium-shell min-h-screen px-3 py-4 text-white sm:px-6 lg:px-8'><div className='mx-auto w-full max-w-6xl space-y-4'>
    <header className='glass-panel rounded-3xl p-4 sm:p-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <p className='logo-mark'>LV TRANSPORT</p>
          <p className='mt-2 text-sm text-lv-mist'>Executive mobility platform · Antwerp · Airport & Business</p>
        </div>
        <div className='network-dot-grid hidden md:block' />
      </div>
      <div className='mt-4 grid gap-2 md:grid-cols-3'>
        <div className='status-pill'>Realtime Network: <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>{isOnline ? 'Dispatch online' : 'Offline-safe mode'}</span></div>
        <div className='status-pill'>Platform Session: <span className='text-lv-champagne'>{installReady ? 'PWA install ready' : 'Browser install pending'}</span></div>
        <div className='status-pill'>Operational Promise: <span className='text-lv-champagne'>Founder-operated premium service</span></div>
      </div>
    </header>

    <section className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
      <div className='glass-panel rounded-3xl p-4 sm:p-6'>
      {confirmation ? <div className='space-y-4'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Booking confirmed</p><h2 className='text-2xl font-semibold'>Reference: {confirmation.referenceCode}</h2><p className='text-lv-mist'>Status: {confirmation.status}</p><p className='text-xs text-lv-mist'>Your itinerary is now monitored by our realtime operations layer.</p><Button className='shadow-gold-md' onClick={resetDraft}>Create another booking</Button></div> : <><div className='mb-4 flex items-center justify-between'><p className='text-sm text-lv-mist'>Reservation step {step} of 3</p><p className='text-xs text-lv-mist'>Premium itinerary intake with secure dispatch handoff.</p></div>{step === 1 && <div className='space-y-4 booking-step-fade'><label className='field-wrap'><span>Pickup</span><input placeholder='Hotel, office, airport terminal...' value={pickup} onChange={(e) => setPickup(e.target.value)} /></label><label className='field-wrap'><span>Destination</span><input placeholder='Boardroom, residence, event venue...' value={destination} onChange={(e) => setDestination(e.target.value)} /></label><label className='field-wrap'><span>Date & time</span><input type='datetime-local' value={dateTime} onChange={(e) => setDateTime(e.target.value)} /></label></div>}{step === 2 && <div className='space-y-4 booking-step-fade'><div className='field-wrap'><span>Passengers</span><div className='mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3'><button className='control-btn' onClick={() => setPassengers((v) => Math.max(1, v - 1))}>−</button><strong className='text-lg'>{passengers}</strong><button className='control-btn' onClick={() => setPassengers((v) => Math.min(12, v + 1))}>+</button></div></div><div className='grid gap-2'>{vehicles.map((item) => <button key={item.name} onClick={() => setVehicle(item)} className={`vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`}><div><p className='font-medium'>{item.name}</p><p className='text-xs text-lv-mist'>ETA {item.eta} • up to {item.seats} passengers</p></div></button>)}</div></div>}{step === 3 && <div className='space-y-3 booking-step-fade'><button className={`toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`} onClick={() => setAirportTransfer((v) => !v)}>Airport transfer</button><button className={`toggle-card ${businessVip ? 'toggle-card--active' : ''}`} onClick={() => setBusinessVip((v) => !v)}>Business / VIP concierge</button></div>}{info && <p className='mt-3 text-sm text-lv-champagne'>{info}</p>}{error && <p className='mt-3 text-sm text-rose-300'>{error}</p>}<div className='mt-5 flex gap-2'><Button variant='secondary' className='flex-1' disabled={loading} onClick={() => setStep((v) => (v > 1 ? ((v - 1) as Step) : v))}>Back</Button>{step < 3 ? <Button className='flex-1' disabled={loading} onClick={() => setStep((v) => (v < 3 ? ((v + 1) as Step) : v))}>Continue</Button> : <Button className='flex-1 shadow-gold-md' onClick={submitBooking} disabled={loading || !pickup || !destination || !dateTime || !isOnline}>{loading ? 'Submitting...' : 'Confirm premium booking'}</Button>}</div></>}
      </div>

      <aside className='space-y-4'>
        <article className='glass-panel rounded-3xl p-4'>
          <p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Live fare estimate</p><p className='mt-2 text-3xl font-semibold'>€{baseFare}</p>
        </article>
        <article className='glass-panel rounded-3xl p-4'>
          <p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Trip brief</p><ul className='mt-3 space-y-2 text-sm'><li>Pickup: {pickup || 'Not set'}</li><li>Destination: {destination || 'Not set'}</li><li>Schedule: {formatDateTime(dateTime)}</li></ul>
        </article>
        <article className='glass-panel network-panel rounded-3xl p-4'>
          <p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Control tower snapshot</p>
          <ul className='mt-3 space-y-2 text-sm text-lv-mist'><li>• Driver readiness synced</li><li>• Route confidence nominal</li><li>• ETA telemetry stable</li></ul>
        </article>
      </aside>
    </section>
  </div><MoniAssistant /></div>;
}

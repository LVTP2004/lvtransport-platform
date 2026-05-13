import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';
type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number; serviceType: ServiceType; description: string };
type BookingConfirmation = { id: string; referenceCode: string; status: string };
type BookingEventType = 'draft_restored' | 'submit_started' | 'submit_succeeded' | 'submit_failed' | 'draft_cleared' | 'session_recovered';
type BookingEvent = { type: BookingEventType; at: string; meta?: Record<string, string | number | boolean> };
type BookingDraft = { step: Step; pickup: string; destination: string; dateTime: string; passengers: number; vehicleName: string; airportTransfer: boolean; businessVip: boolean; confirmation: BookingConfirmation | null; requestKey: string | null; events: BookingEvent[] };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const SESSION_KEY = 'lvtransport.mobile.session.v1';
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard', description: 'Stadsritten en zakelijke verplaatsingen in Antwerpen.' },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport', description: 'Comfortabele luchthavenritten met extra bagageruimte.' },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip', description: 'Premium groepsvervoer voor VIP en business.' }
];

const formatDateTime = (value: string) => !value ? 'Nog niet gekozen' : new Date(value).toLocaleString('nl-BE', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const nowIso = () => new Date().toISOString();
const loadDraft = () => { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as BookingDraft : null; } catch { return null; } };

const statusLabel = (status: string) => ({ pending: 'Boeking ontvangen', assigned: 'Chauffeur toegewezen', en_route: 'Chauffeur onderweg', arrived: 'Chauffeur aangekomen', in_progress: 'Rit bezig', completed: 'Rit voltooid' }[status] ?? 'Boeking bevestigd');

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
    const onOnline = () => { setIsOnline(true); setInfo('Verbinding hersteld. Realtime tracking is opnieuw actief.'); };
    const onOffline = () => { setIsOnline(false); setError('Geen internetverbinding. Je gegevens blijven bewaard, bevestigen kan zodra je opnieuw online bent.'); };
    const onInstall = () => setInstallReady(true);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    window.addEventListener('lv:pwa-install-available', onInstall);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); window.removeEventListener('lv:pwa-install-available', onInstall); };
  }, []);

  const baseFare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup.length, destination.length, passengers, airportTransfer, businessVip, vehicle.priceMultiplier]);
  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;

  const submitBooking = async () => {
    if (loading || !isOnline) return;
    if (!pickup || !destination || !dateTime) {
      setError('Vul eerst ophaallocatie, bestemming en tijdstip in.');
      return;
    }
    const dedupeKey = requestKey ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    if (inFlightKeyRef.current === dedupeKey) return;
    inFlightKeyRef.current = dedupeKey; setRequestKey(dedupeKey); setError(''); setInfo('Je boeking wordt veilig verwerkt...'); setLoading(true); appendEvent('submit_started', { dedupeKey, step });
    try {
      const response = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey }, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'Boeking kon niet worden aangemaakt.');
      setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
      setInfo('Boeking bevestigd. Je ontvangt updates zodra een chauffeur toegewezen is.');
      appendEvent('submit_succeeded', { dedupeKey, bookingId: payload.booking.id });
    } catch (e) {
      appendEvent('submit_failed', { dedupeKey });
      setError(e instanceof Error ? e.message : 'Boeking kon niet worden aangemaakt.');
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
  return <div className='min-h-screen bg-lv-black px-3 py-4 text-white sm:px-6 lg:px-8'><div className='mx-auto w-full max-w-6xl'><header className='mb-4 rounded-3xl border border-lv-gold/30 bg-black/40 p-4'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>LV Transport · Antwerpen</p><h1 className='mt-2 text-2xl font-semibold'>Premium rit boeken</h1><p className='mt-2 text-sm text-lv-mist'>Dutch first · EN/ES support on request. Zakelijke en luchthavenritten met realtime opvolging.</p></header><section className='mb-4 grid gap-2 md:grid-cols-2'><div className='rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-lv-mist'>Verbinding: <span className={isOnline ? 'text-emerald-300' : 'text-amber-300'}>{isOnline ? 'Online · live tracking actief' : 'Offline · veilig opgeslagen, later verzenden'}</span></div><div className='rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-lv-mist'>App install: <span className='text-lv-champagne'>{installReady ? 'Beschikbaar' : 'Nog niet aangeboden door browser'}</span></div></section><section className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'><div className='glass-panel rounded-3xl p-4 sm:p-6'>{confirmation ? <div className='space-y-4'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Boeking bevestigd</p><h2 className='text-2xl font-semibold'>Referentie: {confirmation.referenceCode}</h2><p className='text-lv-mist'>Status: {statusLabel(confirmation.status)}</p><p className='text-sm text-lv-mist'>Wat nu? 1) Chauffeur wordt toegewezen 2) Je ontvangt tracking 3) Je ziet wanneer de chauffeur onderweg en aangekomen is.</p><p className='text-xs text-lv-mist'>Contact nodig? Bel LV Transport met je referentiecode voor directe opvolging.</p><Button className='shadow-gold-md' onClick={resetDraft}>Nieuwe boeking starten</Button></div> : <><div className='mb-4 flex items-center justify-between'><p className='text-sm text-lv-mist'>Stap {step} van 3</p><p className='text-xs text-lv-mist'>Heldere gegevens zorgen voor snelle dispatch.</p></div>{step === 1 && <div className='space-y-4'><label className='field-wrap'><span>Ophaallocatie</span><input placeholder='Bijv. Antwerpen-Centrum' value={pickup} onChange={(e) => setPickup(e.target.value)} /></label><label className='field-wrap'><span>Bestemming</span><input placeholder='Bijv. Brussels Airport' value={destination} onChange={(e) => setDestination(e.target.value)} /></label><label className='field-wrap'><span>Datum & uur</span><input type='datetime-local' value={dateTime} onChange={(e) => setDateTime(e.target.value)} /></label></div>}{step === 2 && <div className='space-y-4'><div className='field-wrap'><span>Passagiers</span><div className='mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3'><button className='control-btn' onClick={() => setPassengers((v) => Math.max(1, v - 1))}>−</button><strong className='text-lg'>{passengers}</strong><button className='control-btn' onClick={() => setPassengers((v) => Math.min(12, v + 1))}>+</button></div></div><div className='grid gap-2'>{vehicles.map((item) => <button key={item.name} onClick={() => setVehicle(item)} className={`vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`}><div><p className='font-medium'>{item.name}</p><p className='text-xs text-lv-mist'>ETA {item.eta} · tot {item.seats} passagiers</p><p className='text-xs text-lv-mist'>{item.description}</p></div></button>)}</div></div>}{step === 3 && <div className='space-y-3'><button className={`toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`} onClick={() => setAirportTransfer((v) => !v)}>Luchthavenservice</button><button className={`toggle-card ${businessVip ? 'toggle-card--active' : ''}`} onClick={() => setBusinessVip((v) => !v)}>Business / VIP service</button><p className='text-xs text-lv-mist'>Na bevestiging ontvang je statusupdates: toegewezen, onderweg, aangekomen, rit bezig, voltooid.</p></div>}{info && <p className='mt-3 text-sm text-lv-champagne'>{info}</p>}{error && <p className='mt-3 text-sm text-rose-300'>{error}</p>}<div className='mt-5 flex gap-2'><Button variant='secondary' className='flex-1' disabled={loading} onClick={() => setStep((v) => (v > 1 ? ((v - 1) as Step) : v))}>Terug</Button>{step < 3 ? <Button className='flex-1' disabled={loading} onClick={() => setStep((v) => (v < 3 ? ((v + 1) as Step) : v))}>Verder</Button> : <Button className='flex-1 shadow-gold-md' onClick={submitBooking} disabled={loading || !pickup || !destination || !dateTime || !isOnline}>{loading ? 'Bezig met bevestigen...' : 'Boeking bevestigen'}</Button>}</div></>}</div><aside className='space-y-4'><article className='glass-panel rounded-3xl p-4'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Richtprijs</p><p className='mt-2 text-3xl font-semibold'>€{baseFare}</p><p className='text-xs text-lv-mist'>Indicatief tarief, bevestigd bij toewijzing.</p></article><article className='glass-panel rounded-3xl p-4'><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Boekingsoverzicht</p><ul className='mt-3 space-y-2 text-sm'><li>Pickup: {pickup || 'Nog niet ingevuld'}</li><li>Bestemming: {destination || 'Nog niet ingevuld'}</li><li>Planning: {formatDateTime(dateTime)}</li><li>Service: {serviceType.toUpperCase()}</li></ul></article></aside></section></div><MoniAssistant /></div>;
}

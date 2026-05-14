import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
import { BookingState, TERMINAL_STATES, resolveLifecycleState } from './bookingLifecycle';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';

type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number; serviceType: ServiceType };
type BookingConfirmation = { id: string; referenceCode: string; status: string };
type BookingEventType = 'draft_restored' | 'submit_started' | 'submit_succeeded' | 'submit_failed' | 'draft_cleared';
type BookingEvent = { type: BookingEventType; at: string; meta?: Record<string, string | number | boolean> };
type BookingDraft = {
  step: Step; pickup: string; destination: string; dateTime: string; passengers: number;
  vehicleName: string; airportTransfer: boolean; businessVip: boolean;
  confirmation: BookingConfirmation | null; requestKey: string | null; events: BookingEvent[];
};

type DemoOpsMetric = { label: string; value: string; detail: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const TRACKING_KEY = 'lvtransport.tracking.v1';

const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];

const formatDateTime = (value: string) => {
  if (!value) return 'Select schedule';
  return new Date(value).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};
const nowIso = () => new Date().toISOString();
const loadDraft = (): BookingDraft | null => {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as BookingDraft : null; } catch { return null; }
};

function TrackingPage({ code }: { code: string }) { return <div className="min-h-screen bg-lv-black px-4 py-8 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl"><section className="glass-panel rounded-3xl p-6 sm:p-8"><p className="text-xs uppercase tracking-[0.24em] text-lv-champagne">LV Transport Tracking</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">Track your chauffeur in real time.</h1><p className="mt-4 text-sm text-lv-mist sm:text-base">Tracking code <span className="font-semibold text-white">{code}</span> is active. Customer-safe location updates stream only while ride is live.</p></section></div><MoniAssistant /></div>; }


type LiveLocation = { lat: number; lng: number; heading?: number; updatedAt?: string };

function DriverLocationPanel() {
  const [driverId, setDriverId] = useState('DRV-001');
  const [bookingId, setBookingId] = useState('');
  const [sharing, setSharing] = useState(false);
  const [status, setStatus] = useState('GPS idle');
  const watcherRef = useRef<number | null>(null);
  const stop = () => { if (watcherRef.current !== null) navigator.geolocation.clearWatch(watcherRef.current); watcherRef.current = null; setSharing(false); };
  const push = async (coords: GeolocationCoordinates) => {
    await fetch(`${API_BASE}/drivers/${encodeURIComponent(driverId)}/location`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ bookingId, lat: coords.latitude, lng: coords.longitude, heading: coords.heading ?? undefined, accuracyMeters: coords.accuracy, source: 'gps' }) });
  };
  const start = async () => {
    if (!bookingId) { setStatus('Add active booking ID first.'); return; }
    if (!('geolocation' in navigator)) { setStatus('Geolocation unavailable on this device/browser.'); return; }
    setStatus('Requesting GPS permission...');
    watcherRef.current = navigator.geolocation.watchPosition(async (position) => { setSharing(true); setStatus(`Live GPS enabled • ±${Math.round(position.coords.accuracy)}m`); await push(position.coords); }, () => { setStatus('GPS denied/unavailable. Sharing stopped safely.'); stop(); }, { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 });
  };
  return <article className="glass-panel rounded-3xl p-5 sm:p-6 space-y-3"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Driver live GPS</p><input className="field-wrap" value={driverId} onChange={(e)=>setDriverId(e.target.value)} placeholder="Driver ID" /><input className="field-wrap" value={bookingId} onChange={(e)=>setBookingId(e.target.value)} placeholder="Assigned Booking ID" /><p className="text-xs text-lv-mist">{status}</p><div className="flex gap-2"><Button onClick={start} className="flex-1" disabled={sharing}>Start sharing</Button><Button onClick={stop} variant="secondary" className="flex-1">Stop sharing</Button></div></article>;
}

function AdminLivePanel() {
  const [last, setLast] = useState<{driverId?:string;bookingId?:string;location?:LiveLocation;updatedAt?:string}|null>(null);
  useEffect(()=>{ const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`); ws.onmessage=(m)=>{ try { const data=JSON.parse(m.data as string); if(data.event==='admin.live.updated' && data.payload?.location) setLast(data.payload); } catch {} }; return ()=>ws.close(); },[]);
  return <article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Admin control tower live map feed</p><p className="mt-2 text-sm text-lv-mist">{last ? `Driver ${last.driverId} • Booking ${last.bookingId}` : 'Waiting for live driver coordinates...'}</p>{last?.location && <p className="mt-2 text-sm">Lat {last.location.lat.toFixed(5)}, Lng {last.location.lng.toFixed(5)}</p>}</article>;
}
export function App() {
  const params = new URLSearchParams(window.location.search);
  const presentationMode = params.get('mode') === 'demo';
  const mode = params.get('mode');
  const trackingMatch = window.location.pathname.match(/^\/tracking\/([A-Za-z0-9-]+)/);
  if (trackingMatch) return <TrackingPage code={trackingMatch[1]} />;
  if (mode === 'driver') return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-4xl"><DriverLocationPanel /></div></div>;
  if (mode === 'admin') return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-4xl"><AdminLivePanel /></div></div>;

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
  const [loading, setLoading] = useState(false);
  const [liveStatus, setLiveStatus] = useState<BookingState | null>(resolveLifecycleState(null, restored?.confirmation?.status));
  const [socketState, setSocketState] = useState<'connecting' | 'connected' | 'reconnecting' | 'offline'>('connecting');
  const inFlightKeyRef = useRef<string | null>(null);
  const lastSequenceRef = useRef(0);

  useEffect(() => {
    if (!presentationMode || restored) return;
    setPickup('Wynn Las Vegas, South Valet');
    setDestination('Harry Reid Terminal 3, Private Aviation Gate');
    const inNinetyMinutes = new Date(Date.now() + 90 * 60 * 1000);
    setDateTime(inNinetyMinutes.toISOString().slice(0, 16));
    setPassengers(3);
    setVehicle(vehicles[1]);
    setAirportTransfer(true);
    setBusinessVip(true);
    setStep(3);
  }, [presentationMode, restored]);

  useEffect(() => {
    const draft: BookingDraft = { step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [airportTransfer, businessVip, confirmation, dateTime, destination, events, passengers, pickup, requestKey, step, vehicle.name]);

  const appendEvent = (type: BookingEventType, meta?: BookingEvent['meta']) => setEvents((prev) => [...prev.slice(-49), { type, at: nowIso(), meta }]);

  useEffect(() => { if (restored) appendEvent('draft_restored', { hasConfirmation: Boolean(restored.confirmation) }); }, []);

  useEffect(() => {
    if (!confirmation?.id) return;
    const tracked = localStorage.getItem(TRACKING_KEY);
    if (tracked !== confirmation.id) localStorage.setItem(TRACKING_KEY, confirmation.id);
    const initialState = resolveLifecycleState(liveStatus, confirmation.status);
    if (initialState && TERMINAL_STATES.has(initialState)) {
      setLiveStatus(initialState);
      setSocketState('offline');
      return;
    }

    let ws: WebSocket | null = null;
    let reconnectTimer: number | undefined;
    let attempts = 0;
    let active = true;

    const connect = () => {
      if (!active) return;
      setSocketState(attempts > 0 ? 'reconnecting' : 'connecting');
      const query = lastSequenceRef.current > 0 ? `?lastSequence=${lastSequenceRef.current}` : '';
      ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws${query}`);
      ws.onopen = () => { attempts = 0; setSocketState('connected'); };
      ws.onmessage = (message) => {
        try {
          const payload = JSON.parse(message.data as string) as { event?: string; payload?: { id?: string; status?: string } | Array<{ id?: string; status?: string }>; sequence?: number };
          if (typeof payload.sequence === 'number' && payload.sequence > lastSequenceRef.current) lastSequenceRef.current = payload.sequence;
          if (payload.event === 'booking.snapshot' && Array.isArray(payload.payload)) {
            const current = payload.payload.find((item) => item.id === confirmation.id);
            if (current?.status) setLiveStatus((prev) => resolveLifecycleState(prev, current.status));
          }
          if (payload.event === 'booking.updated' && !Array.isArray(payload.payload)) {
            const bookingUpdate = payload.payload;
            if (bookingUpdate?.id === confirmation.id && bookingUpdate.status) {
              setLiveStatus((prev) => resolveLifecycleState(prev, bookingUpdate.status));
            }
          }
        } catch {}
      };
      ws.onclose = () => {
        if (!active || (liveStatus && TERMINAL_STATES.has(liveStatus))) return;
        attempts += 1;
        setSocketState('offline');
        reconnectTimer = window.setTimeout(connect, Math.min(15000, 1000 * 2 ** Math.min(attempts, 4)));
      };
      ws.onerror = () => ws?.close();
    };
    connect();
    return () => {
      active = false;
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [confirmation?.id, confirmation?.status, liveStatus]);

  const baseFare = useMemo(() => {
    const distanceFactor = Math.max(14, (pickup.length + destination.length) * 0.8);
    const passengerFactor = passengers > 3 ? (passengers - 3) * 6 : 0;
    const airportFee = airportTransfer ? 18 : 0;
    const vipFee = businessVip ? 24 : 0;
    return Math.round((distanceFactor + passengerFactor + airportFee + vipFee) * vehicle.priceMultiplier);
  }, [airportTransfer, businessVip, destination.length, passengers, pickup.length, vehicle.priceMultiplier]);

  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
  const opsMetrics: DemoOpsMetric[] = useMemo(() => {
    const expectedArrival = Math.max(8, Math.round(baseFare / 8));
    return [
      { label: 'Live chauffeurs', value: '42', detail: '37 en route • 5 standby' },
      { label: 'On-time performance', value: '98.7%', detail: 'Last 24h completed rides' },
      { label: 'Dispatch SLA', value: `${expectedArrival} min`, detail: 'Current booking region forecast' }
    ];
  }, [baseFare]);
  const nextStep = () => setStep((v) => (v < 3 ? ((v + 1) as Step) : v));
  const prevStep = () => setStep((v) => (v > 1 ? ((v - 1) as Step) : v));

  const submitBooking = async () => {
    if (loading) return;
    const dedupeKey = requestKey ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
    if (inFlightKeyRef.current === dedupeKey) return;
    inFlightKeyRef.current = dedupeKey;
    setRequestKey(dedupeKey);
    setError('');
    setLoading(true);
    appendEvent('submit_started', { dedupeKey, step });
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey },
        body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'Unable to create booking');
      const nextLifecycleState = resolveLifecycleState(null, payload.booking.status) ?? 'pending';
      setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: nextLifecycleState });
      setLiveStatus((prev) => resolveLifecycleState(prev, nextLifecycleState));
      appendEvent('submit_succeeded', { dedupeKey, bookingId: payload.booking.id });
    } catch (e) {
      appendEvent('submit_failed', { dedupeKey });
      setError(e instanceof Error ? e.message : 'Unable to create booking');
    } finally {
      inFlightKeyRef.current = null;
      setLoading(false);
    }
  };

  const resetDraft = () => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TRACKING_KEY);
    appendEvent('draft_cleared');
    window.location.reload();
  };

  return <div className="min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-6xl">{presentationMode && <section className="mb-6 rounded-3xl border border-lv-gold/30 bg-gradient-to-r from-lv-gold/20 via-black/40 to-black/20 p-4"><p className="text-xs uppercase tracking-[0.25em] text-lv-champagne">Investor demo mode</p><p className="mt-2 text-sm text-lv-mist">Preloaded premium itinerary, resilient booking draft recovery, and live operational telemetry for realistic service simulation.</p></section>}<section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className="glass-panel rounded-3xl p-4 sm:p-6">{confirmation ? <div className="space-y-4"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Booking confirmed</p><h2 className="text-2xl font-semibold">Reference: {confirmation.referenceCode}</h2><p className="text-lv-mist">Status: {liveStatus ?? confirmation.status}</p><p className="text-xs text-lv-mist">Realtime channel: <span className={socketState === 'connected' ? 'text-emerald-300' : socketState === 'reconnecting' ? 'text-amber-200' : 'text-rose-300'}>{socketState.toUpperCase()}</span></p><Button className="shadow-gold-md" onClick={resetDraft}>Create another booking</Button></div> : <><div className="mb-6 flex items-center justify-between"><p className="text-sm text-lv-mist">Step {step} of 3</p><div className="flex w-32 gap-2">{[1, 2, 3].map((i) => <span key={i} className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-lv-gold' : 'bg-white/15'}`} />)}</div></div><div className="booking-step-fade space-y-4">{step === 1 && <><label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Hotel, office, terminal..." /></label><label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Airport, venue, client site..." /></label><label className="field-wrap"><span>Date & time</span><input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} /></label></>}{step === 2 && <><div className="field-wrap"><span>Passengers</span><div className="mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3"><button className="control-btn" onClick={() => setPassengers((v) => Math.max(1, v - 1))}>−</button><strong className="text-lg">{passengers}</strong><button className="control-btn" onClick={() => setPassengers((v) => Math.min(12, v + 1))}>+</button></div></div><div><p className="mb-2 text-sm text-lv-mist">Vehicle</p><div className="grid gap-3">{vehicles.map((item) => <button key={item.name} onClick={() => setVehicle(item)} className={`vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`}><div><p className="font-medium">{item.name}</p><p className="text-xs text-lv-mist">ETA {item.eta} • up to {item.seats} passengers</p></div><p className="text-lv-champagne">x{item.priceMultiplier.toFixed(2)}</p></button>)}</div></div></>}{step === 3 && <><button className={`toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`} onClick={() => setAirportTransfer((v) => !v)}><div><p className="font-medium">Airport transfer</p><p className="text-xs text-lv-mist">Terminal-aware handoff and buffer timing prep.</p></div><span>{airportTransfer ? 'On' : 'Off'}</span></button><button className={`toggle-card ${businessVip ? 'toggle-card--active' : ''}`} onClick={() => setBusinessVip((v) => !v)}><div><p className="font-medium">Business / VIP</p><p className="text-xs text-lv-mist">Priority allocation, premium chauffeur protocol.</p></div><span>{businessVip ? 'On' : 'Off'}</span></button></>}</div>{error && <p className="mt-4 text-sm text-rose-300">{error}</p>}<div className="mt-6 flex gap-3"><Button variant="secondary" className="flex-1" onClick={prevStep}>Back</Button>{step < 3 ? <Button className="flex-1" onClick={nextStep}>Continue</Button> : <Button className="flex-1 shadow-gold-md" onClick={submitBooking} disabled={loading || !pickup || !destination || !dateTime}>{loading ? 'Submitting...' : 'Confirm booking'}</Button>}</div></>}</div><aside className="space-y-6"><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Price estimate</p><p className="mt-3 text-4xl font-semibold">${baseFare}</p></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Booking summary</p><ul className="mt-4 space-y-3 text-sm"><li><span className="text-lv-mist">Pickup:</span> {pickup || 'Not set'}</li><li><span className="text-lv-mist">Destination:</span> {destination || 'Not set'}</li><li><span className="text-lv-mist">Schedule:</span> {formatDateTime(dateTime)}</li><li><span className="text-lv-mist">Passengers:</span> {passengers}</li><li><span className="text-lv-mist">Vehicle:</span> {vehicle.name}</li><li><span className="text-lv-mist">Options:</span> {airportTransfer ? 'Airport' : 'Standard'} • {businessVip ? 'VIP' : 'Classic'}</li></ul></article><article className="glass-panel rounded-3xl p-5 sm:p-6"><p className="text-xs uppercase tracking-[0.2em] text-lv-champagne">Operations snapshot</p><div className="mt-4 grid gap-3">{opsMetrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-white/10 bg-black/30 p-3"><p className="text-xs uppercase tracking-[0.14em] text-lv-mist">{metric.label}</p><p className="mt-1 text-2xl font-semibold">{metric.value}</p><p className="text-xs text-lv-mist">{metric.detail}</p></div>)}</div></article></aside></section></div><MoniAssistant /></div>;
}

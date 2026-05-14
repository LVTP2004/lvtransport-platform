import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';
type Theme = 'premium' | 'ops';

type Vehicle = { name: string; eta: string; priceMultiplier: number; seats: number; serviceType: ServiceType };
type BookingConfirmation = { id: string; referenceCode: string; status: string };
type BookingEventType = 'draft_restored' | 'submit_started' | 'submit_succeeded' | 'submit_failed' | 'draft_cleared';
type BookingEvent = { type: BookingEventType; at: string; meta?: Record<string, string | number | boolean> };
type BookingDraft = { step: Step; pickup: string; destination: string; dateTime: string; passengers: number; vehicleName: string; airportTransfer: boolean; businessVip: boolean; confirmation: BookingConfirmation | null; requestKey: string | null; events: BookingEvent[] };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const TRACKING_KEY = 'lvtransport.tracking.v1';
const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
  { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
  { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];
const nowIso = () => new Date().toISOString();
const loadDraft = () => { try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) as BookingDraft : null; } catch { return null; } };
const detectTheme = (): Theme => (window.location.hostname === 'app.lvtransport.be' || window.location.search.includes('theme=ops')) ? 'ops' : 'premium';

function BookingCore({ theme }: { theme: Theme }) {
  const restored = loadDraft();
  const [step, setStep] = useState<Step>(restored?.step ?? 1); const [pickup, setPickup] = useState(restored?.pickup ?? ''); const [destination, setDestination] = useState(restored?.destination ?? ''); const [dateTime, setDateTime] = useState(restored?.dateTime ?? '');
  const [passengers, setPassengers] = useState(restored?.passengers ?? 1); const [vehicle, setVehicle] = useState<Vehicle>(vehicles.find((v) => v.name === restored?.vehicleName) ?? vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(restored?.airportTransfer ?? false); const [businessVip, setBusinessVip] = useState(restored?.businessVip ?? false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(restored?.confirmation ?? null); const [requestKey, setRequestKey] = useState<string | null>(restored?.requestKey ?? null); const [events, setEvents] = useState<BookingEvent[]>(restored?.events ?? []);
  const [error, setError] = useState(''); const [loading, setLoading] = useState(false); const [liveStatus, setLiveStatus] = useState<string | null>(restored?.confirmation?.status ?? null); const [socketState, setSocketState] = useState<'connecting'|'connected'|'reconnecting'|'offline'>('connecting');
  const inFlightKeyRef = useRef<string | null>(null); const lastSequenceRef = useRef(0);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events })); }, [step,pickup,destination,dateTime,passengers,vehicle.name,airportTransfer,businessVip,confirmation,requestKey,events]);
  useEffect(() => { if (restored) setEvents((prev) => [...prev.slice(-49), { type: 'draft_restored', at: nowIso() }]); }, []);
  useEffect(() => {
    if (!confirmation?.id) return; if (TERMINAL_STATUSES.has(confirmation.status)) { setLiveStatus(confirmation.status); return; }
    let ws: WebSocket | null = null; let timer: number | undefined;
    const connect = () => {
      const query = lastSequenceRef.current > 0 ? `?lastSequence=${lastSequenceRef.current}` : '';
      ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws${query}`); ws.onopen = () => setSocketState('connected');
      ws.onmessage = (m) => { try { const p = JSON.parse(m.data as string); if (typeof p.sequence === 'number' && p.sequence > lastSequenceRef.current) lastSequenceRef.current = p.sequence; if (p.event === 'booking.updated' && p.payload?.id === confirmation.id) setLiveStatus(p.payload.status); } catch {} };
      ws.onclose = () => { setSocketState('offline'); timer = window.setTimeout(connect, 2500); };
    }; connect(); return () => { if (timer) clearTimeout(timer); ws?.close(); };
  }, [confirmation?.id, confirmation?.status]);
  const fare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup,destination,passengers,airportTransfer,businessVip,vehicle.priceMultiplier]);
  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
  const submitBooking = async () => { if (loading) return; const key = requestKey ?? `${Date.now()}-${Math.random()}`; if (inFlightKeyRef.current === key) return; inFlightKeyRef.current = key; setLoading(true); setError(''); setRequestKey(key); setEvents((v)=>[...v.slice(-49), {type:'submit_started', at:nowIso()}]);
    try { const res = await fetch(`${API_BASE}/bookings`, { method:'POST', headers:{'Content-Type':'application/json','X-Idempotency-Key':key}, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType })}); const payload = await res.json(); if (!res.ok) throw new Error(payload?.message ?? 'Boeking mislukt'); setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status }); localStorage.setItem(TRACKING_KEY, payload.booking.id); }
    catch (e) { setError(e instanceof Error ? e.message : 'Boeking mislukt'); } finally { setLoading(false); inFlightKeyRef.current = null; }
  };
  const wrap = theme === 'premium' ? 'glass-panel' : 'ops-panel';
  return <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]"><div className={`${wrap} rounded-3xl p-6`}>
    {confirmation ? <div><h2 className="text-2xl font-semibold">Reference: {confirmation.referenceCode}</h2><p>Status: {liveStatus ?? confirmation.status}</p><p className="text-xs">Realtime: {socketState}</p></div> : <>
      <label className="field-wrap"><span>Pickup</span><input value={pickup} onChange={(e)=>setPickup(e.target.value)} /></label>
      <label className="field-wrap"><span>Destination</span><input value={destination} onChange={(e)=>setDestination(e.target.value)} /></label>
      <label className="field-wrap"><span>Datum & tijd</span><input type="datetime-local" value={dateTime} onChange={(e)=>setDateTime(e.target.value)} /></label>
      <div className="my-3 flex gap-2">{vehicles.map((v)=><button key={v.name} className={`vehicle-card ${vehicle.name===v.name?'vehicle-card--active':''}`} onClick={()=>setVehicle(v)}>{v.name}</button>)}</div>
      <div className="my-3 flex gap-2"><button className={`toggle-card ${airportTransfer?'toggle-card--active':''}`} onClick={()=>setAirportTransfer((v)=>!v)}>Airport</button><button className={`toggle-card ${businessVip?'toggle-card--active':''}`} onClick={()=>setBusinessVip((v)=>!v)}>VIP</button></div>
      {error && <p className="text-rose-300">{error}</p>}<Button onClick={submitBooking} disabled={loading || !pickup || !destination || !dateTime}>{loading ? 'Submitting...' : 'Confirm booking'}</Button>
    </>}
  </div><aside className="space-y-4"><article className={`${wrap} rounded-3xl p-6`}><p>Prijsindicatie</p><p className="text-4xl font-semibold">€{fare}</p></article><article className={`${wrap} rounded-3xl p-6`}><p>Passagiers</p><div className="mt-2 flex gap-3"><Button variant="secondary" onClick={()=>setPassengers((v)=>Math.max(1,v-1))}>-</Button><strong className="text-xl">{passengers}</strong><Button variant="secondary" onClick={()=>setPassengers((v)=>Math.min(12,v+1))}>+</Button></div></article><article className={`${wrap} rounded-3xl p-6`}><p>Lifecycle events: {events.length}</p></article></aside></section>;
}

function SiteShell() {
  const theme = detectTheme();
  const path = window.location.pathname;
  const isPremium = theme === 'premium';
  const links = ['/', '/booking', '/prijzen', '/tracking', '/moni-ride', '/maps', '/diensten', '/contact', '/driver', '/admin'];
  const titleMap: Record<string,string> = {'/':'LV Transport', '/booking':'Boeking', '/prijzen':'Prijzen', '/tracking':'Tracking', '/moni-ride':'Moni Ride', '/maps':'Maps', '/diensten':'Diensten', '/contact':'Contact', '/driver':'Driver', '/admin':'Admin'};
  const page = titleMap[path] ?? 'LV Transport';
  return <div className={`min-h-screen ${isPremium ? 'premium-theme' : 'ops-theme'} px-4 py-6 text-white`}>
    <div className="mx-auto w-full max-w-6xl space-y-6"><header className={`${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`}><div className="flex items-center justify-between"><div><p className="text-xs uppercase tracking-[0.25em]">{isPremium ? 'LV Transport Premium' : 'LVTP Operational SaaS'}</p><h1 className="text-3xl font-semibold">{page}</h1></div><img src="/lv-logo.svg" className="h-10" onError={(e)=>((e.currentTarget.style.display='none'))} /></div><nav className="mt-4 flex flex-wrap gap-2">{links.map((href)=><a key={href} href={href} className={`rounded-full px-3 py-1 text-sm ${href===path?'bg-lv-gold text-black':'bg-white/10'}`}>{href}</a>)}</nav></header>
      {(path === '/booking' || path === '/') && <BookingCore theme={theme} />}
      {path === '/prijzen' && <section className={`${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`}><h2 className="text-2xl">Prijsmodule</h2><p>Zelfde pricing engine en fallback logica in beide tracks.</p></section>}
      {path === '/tracking' && <section className={`${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`}><h2 className="text-2xl">Tracking</h2><p>Tracking code lifecycle en realtime updates actief.</p></section>}
      {path === '/moni-ride' && <section className={`${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`}><h2 className="text-2xl">Moni Ride</h2><p>Moni Ride assistent en API health/fallback gedeeld.</p></section>}
      {['/maps','/diensten','/contact','/driver','/admin'].includes(path) && <section className={`${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`}><h2 className="text-2xl">{page}</h2><p>Zelfde operationele core, alleen UI-thema verschilt.</p></section>}
    </div><MoniAssistant /></div>;
}

export function App() { return <SiteShell />; }

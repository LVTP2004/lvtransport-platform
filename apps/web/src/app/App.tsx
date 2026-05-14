import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';
type Vehicle = { name: string; eta: string; seats: number; serviceType: ServiceType; description: string };
type BookingConfirmation = { id: string; referenceCode: string; status: string };

type RouteKey = 'home' | 'booking' | 'tracking' | 'prijzen' | 'diensten' | 'contact' | 'driver' | 'admin' | 'moni' | 'maps' | '404';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const TRACKING_BASE = import.meta.env.VITE_TRACKING_BASE_URL ?? '/tracking';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';
const MAPS_PROVIDER = import.meta.env.VITE_MAP_PROVIDER ?? 'fallback';
const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';

const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', seats: 3, serviceType: 'standard', description: 'Comfortabele stadsrit voor premium verplaatsingen.' },
  { name: 'Business SUV', eta: '5 min', seats: 6, serviceType: 'airport', description: 'Extra ruimte voor luchthavenritten en bagage.' },
  { name: 'VIP Sprinter', eta: '10 min', seats: 10, serviceType: 'vip', description: 'Discrete groepsservice voor business en VIP.' }
];
const statusLabel = (status: string) => ({ pending: 'Boeking ontvangen', assigned: 'Chauffeur toegewezen', en_route: 'Chauffeur onderweg', arrived: 'Chauffeur aangekomen', in_progress: 'Rit bezig', completed: 'Rit voltooid' }[status] ?? 'Boeking bevestigd');

const resolveRoute = (pathname: string): RouteKey => {
  const p = pathname.toLowerCase();
  if (['/', '/home'].includes(p)) return 'home';
  if (['/booking', '/booking.html'].includes(p)) return 'booking';
  if (['/tracking', '/tracking.html'].includes(p)) return 'tracking';
  if (p === '/prijzen') return 'prijzen';
  if (p === '/diensten') return 'diensten';
  if (p === '/contact') return 'contact';
  if (['/driver', '/driver.html'].includes(p)) return 'driver';
  if (['/admin', '/admin.html', '/tower', '/dashboard'].includes(p)) return 'admin';
  if (['/moni', '/moni-ride', '/moni.html'].includes(p)) return 'moni';
  if (['/maps', '/map', '/app'].includes(p)) return 'maps';
  return '404';
};

export function App() {
  const [route, setRoute] = useState<RouteKey>(() => resolveRoute(window.location.pathname));
  const [step, setStep] = useState<Step>(1);
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [phone, setPhone] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [vehicle, setVehicle] = useState<Vehicle>(vehicles[0]);
  const [airportTransfer, setAirportTransfer] = useState(false);
  const [businessVip, setBusinessVip] = useState(false);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [apiHealth, setApiHealth] = useState('controle bezig');
  const inFlightKeyRef = useRef<string | null>(null);

  const navigate = (path: string) => { history.pushState({}, '', path); setRoute(resolveRoute(path)); window.scrollTo({ top: 0 }); };
  useEffect(() => { const onPop = () => setRoute(resolveRoute(window.location.pathname)); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
  useEffect(() => { fetch(`${API_BASE}/health`).then((r) => r.json()).then((d) => setApiHealth(d?.status ?? 'onbekend')).catch(() => setApiHealth('degraded')); }, []);
  useEffect(() => {
    const onOnline = () => { setIsOnline(true); setInfo('Uw ritstatus wordt bijgewerkt.'); setError(''); };
    const onOffline = () => { setIsOnline(false); setError('We herstellen de verbinding. Uw gegevens blijven veilig bewaard.'); };
    window.addEventListener('online', onOnline); window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
  const trackingUrl = confirmation ? `${TRACKING_BASE}/${confirmation.referenceCode}` : '/tracking';
  const intakeReady = pickup && destination && dateTime && phone;
  const estimatedFare = useMemo(() => Math.round(24 + passengers * 4 + (airportTransfer ? 16 : 0) + (businessVip ? 20 : 0)), [passengers, airportTransfer, businessVip]);
  const submitBooking = async () => { /* unchanged */
    if (loading || !isOnline || !intakeReady) return; const dedupeKey = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`; if (inFlightKeyRef.current === dedupeKey) return; inFlightKeyRef.current = dedupeKey; setError(''); setInfo('Uw reservatie wordt bevestigd door LV Transport.'); setLoading(true);
    try { const response = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey }, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType, customerPhone: phone }) });
      const payload = await response.json(); if (!response.ok) throw new Error(payload?.message ?? 'Reservatie kon niet bevestigd worden.'); setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status }); setInfo('Boeking ontvangen. LV Transport volgt uw rit op en koppelt uw chauffeur.');
    } catch (e) { setError(e instanceof Error ? e.message : 'Reservatie kon niet bevestigd worden.'); } finally { inFlightKeyRef.current = null; setLoading(false); }
  };

  const Header = <header className='glass-panel rounded-3xl p-5'><nav className='flex flex-wrap gap-2 text-sm'>{[['/','Book'],['/prijzen','Prices'],['/tracking','Track'],['/moni','Moni Ride'],['/app','Maps'],['/diensten','Services'],['/contact','Contact'],['/driver','Driver'],['/admin','Admin']].map(([p,l]) => <button key={p} onClick={() => navigate(p)} className='rounded-lg border border-lv-gold/30 px-3 py-1.5'>{l}</button>)}</nav></header>;

  if (route === '404') return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-3xl space-y-4'>{Header}<section className='glass-panel rounded-3xl p-8 text-center'><img src='/brand/lv-logo-header.svg' className='mx-auto h-12' /><h1 className='mt-4 text-3xl font-semibold'>Pagina niet gevonden</h1><p className='mt-2 text-lv-mist'>Deze pagina bestaat niet of is verplaatst.</p><div className='mt-4 flex flex-wrap justify-center gap-2'><Button onClick={() => navigate('/')}>Terug naar startpagina</Button><Button variant='secondary' onClick={() => navigate('/booking')}>Boek uw rit</Button><Button variant='secondary' onClick={() => navigate('/tracking')}>Volg uw taxi</Button></div></section></div></div>;

  if (route === 'driver') return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-4xl space-y-4'>{Header}<section className='glass-panel rounded-3xl p-6'><h1 className='text-2xl font-semibold'>Driver App</h1><p className='mt-2 text-lv-mist'>Login vereist om ritten en GPS-acties veilig te beheren. Founder-driver toegang verloopt via de bestaande driver omgeving.</p><ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-lv-mist'><li>Ga online/offline</li><li>Accepteer nieuwe rit</li><li>Start GPS en update ritstatus</li></ul><a href={DRIVER_SURFACE_URL} className='mt-4 inline-flex rounded-lg border border-lv-gold/40 px-3 py-2'>Open Driver Surface</a></section></div></div>;


  if (route === 'moni') return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-5xl space-y-4'>{Header}<section className='glass-panel rounded-3xl p-6'><h1 className='text-2xl font-semibold'>Moni Ride Concierge</h1><p className='text-lv-mist'>Moni Ride is beschikbaar voor booking assistentie, tracking vragen en escalatie naar operations.</p><ul className='mt-3 list-disc pl-5 text-sm text-lv-mist'><li>Customer-friendly fallback zonder backend afhankelijkheid</li><li>Snelle intents: booking, tracking, airport, premium</li><li>Escalatiepad naar operator bij onduidelijke situaties</li></ul></section><MoniAssistant /></div></div>;

  if (route === 'maps') return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-5xl space-y-4'>{Header}<section className='glass-panel rounded-3xl p-6'><h1 className='text-2xl font-semibold'>Live Map & Tracking</h1><p className='text-lv-mist'>Map provider: <b>{MAPS_PROVIDER}</b></p>{(!MAPBOX_KEY && !GOOGLE_MAPS_KEY) ? <div className='mt-3 rounded-xl border border-amber-300/40 bg-amber-100/10 p-4 text-sm text-amber-100'>Geen Maps API key gevonden (VITE_MAPBOX_TOKEN of VITE_GOOGLE_MAPS_API_KEY). Fallback kaart actief: tracking blijft beschikbaar via status updates en ETA.</div> : <div className='mt-3 rounded-xl border border-lv-gold/30 p-4 text-sm text-lv-mist'>Maps key gevonden. Koppel hier de provider-component voor realtime kaartvisualisatie.</div>}<div className='mt-3 h-56 rounded-2xl border border-lv-gold/30 bg-black/40 p-4 text-sm text-lv-mist'>Fallback map canvas — geen blanco scherm. Indien externe map faalt blijft deze operationele fallback zichtbaar.</div></section></div></div>;

  if (route === 'admin') return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-5xl space-y-4'>{Header}<section className='glass-panel rounded-3xl p-6'><h1 className='text-2xl font-semibold'>Admin / Control Tower</h1><p className='text-lv-mist'>Active rides, upcoming rides, drivers, booking lifecycle status en operationele readiness.</p><p className='mt-2 text-sm'>API health: <b>{apiHealth}</b></p><ul className='mt-3 list-disc pl-5 text-sm text-lv-mist'><li>Active rides</li><li>Upcoming rides</li><li>Drivers</li><li>Booking lifecycle status</li><li>Operational readiness</li></ul><a href={ADMIN_SURFACE_URL} className='mt-4 inline-flex rounded-lg border border-lv-gold/40 px-3 py-2'>Open Admin Surface</a></section></div></div>;

  return <div className='premium-shell min-h-screen px-4 py-4 text-white sm:px-6'><div className='mx-auto w-full max-w-6xl space-y-5'>{Header}<section id='booking' className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
  <div className='glass-panel rounded-3xl p-5'><h2 className='text-xl font-semibold'>Boek rit</h2><p className='mt-1 text-sm text-lv-mist'>Flow: kies service → pickup/dropoff → prijs → boek → code → track.</p>
  {/* existing booking UI */}
  {!confirmation && <><div className='mt-4 mb-2 text-sm text-lv-mist'>Stap {step} van 3</div>{step===1 && <div className='space-y-2'><input value={pickup} onChange={(e)=>setPickup(e.target.value)} placeholder='Pickup' /><input value={destination} onChange={(e)=>setDestination(e.target.value)} placeholder='Dropoff' /><input type='datetime-local' value={dateTime} onChange={(e)=>setDateTime(e.target.value)} /><input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder='Telefoon' /></div>}{step===2 && <div>{vehicles.map((item)=><button key={item.name} onClick={()=>setVehicle(item)}>{item.name}</button>)}</div>}{step===3 && <div><button onClick={()=>setAirportTransfer(v=>!v)}>Airport transfer</button><button onClick={()=>setBusinessVip(v=>!v)}>Business/VIP</button></div>}<div className='mt-3 flex gap-2'><Button variant='secondary' onClick={()=>setStep((v)=>Math.max(1,v-1) as Step)}>Terug</Button>{step<3 ? <Button onClick={()=>setStep((v)=>Math.min(3,v+1) as Step)}>Verder</Button> : <Button onClick={submitBooking} disabled={!intakeReady || !isOnline || loading}>Reserveer nu</Button>}</div></>}
  {confirmation && <div><p>Referentie {confirmation.referenceCode}</p><button onClick={()=>navigate('/tracking')}>Volg taxi</button></div>}
  {info && <p>{info}</p>}{error && <p>{error}</p>}</div>
  <aside className='space-y-4'><article className='glass-panel rounded-3xl p-4'><p>View prices</p><p>€{estimatedFare}</p></article><article className='glass-panel rounded-3xl p-4'><p>Airport transfer</p></article><article className='glass-panel rounded-3xl p-4'><p>Business/VIP</p></article><article className='glass-panel rounded-3xl p-4'><p>Contact</p></article></aside>
  </section><MoniAssistant /></div></div>;
}

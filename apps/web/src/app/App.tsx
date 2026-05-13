import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';

type Step = 1 | 2 | 3;
type ServiceType = 'standard' | 'airport' | 'vip';
type Vehicle = { name: string; eta: string; seats: number; serviceType: ServiceType; description: string };
type BookingConfirmation = { id: string; referenceCode: string; status: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const TRACKING_BASE = import.meta.env.VITE_TRACKING_BASE_URL ?? '/track';
const vehicles: Vehicle[] = [
  { name: 'Executive Sedan', eta: '3 min', seats: 3, serviceType: 'standard', description: 'Comfortabele stadsrit voor premium verplaatsingen.' },
  { name: 'Business SUV', eta: '5 min', seats: 6, serviceType: 'airport', description: 'Extra ruimte voor luchthavenritten en bagage.' },
  { name: 'VIP Sprinter', eta: '10 min', seats: 10, serviceType: 'vip', description: 'Discrete groepsservice voor business en VIP.' }
];
const statusLabel = (status: string) => ({ pending: 'Boeking ontvangen', assigned: 'Chauffeur toegewezen', en_route: 'Chauffeur onderweg', arrived: 'Chauffeur aangekomen', in_progress: 'Rit bezig', completed: 'Rit voltooid' }[status] ?? 'Boeking bevestigd');

export function App() {
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
  const inFlightKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const onOnline = () => { setIsOnline(true); setInfo('Uw ritstatus wordt bijgewerkt.'); setError(''); };
    const onOffline = () => { setIsOnline(false); setError('We herstellen de verbinding. Uw gegevens blijven veilig bewaard.'); };
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
  }, []);

  const serviceType: ServiceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
  const trackingUrl = confirmation ? `${TRACKING_BASE}/${confirmation.referenceCode}` : '';
  const intakeReady = pickup && destination && dateTime && phone;
  const estimatedFare = useMemo(() => Math.round(24 + passengers * 4 + (airportTransfer ? 16 : 0) + (businessVip ? 20 : 0)), [passengers, airportTransfer, businessVip]);

  const submitBooking = async () => {
    if (loading || !isOnline || !intakeReady) return;
    const dedupeKey = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
    if (inFlightKeyRef.current === dedupeKey) return;
    inFlightKeyRef.current = dedupeKey;
    setError('');
    setInfo('Uw reservatie wordt bevestigd door LV Transport.');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey },
        body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType, customerPhone: phone })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message ?? 'Reservatie kon niet bevestigd worden.');
      setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
      setInfo('Boeking ontvangen. LV Transport volgt uw rit op en koppelt uw chauffeur.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Reservatie kon niet bevestigd worden.');
    } finally {
      inFlightKeyRef.current = null;
      setLoading(false);
    }
  };

  return <div className='premium-shell min-h-screen px-4 py-4 text-white sm:px-6'>
    <div className='mx-auto w-full max-w-6xl space-y-5'>
      <header className='glass-panel rounded-3xl p-5'>
        <div className='flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <img src='/brand/lv-logo-header.svg' alt='LV Transport' className='h-12 w-auto rounded-lg border border-lv-gold/30 bg-black/80 p-1.5' />
            <div><p className='text-xs uppercase tracking-[0.2em] text-lv-champagne'>Antwerpen · Premium vervoer</p><h1 className='text-2xl font-semibold'>Luchthaven, business en VIP ritten</h1></div>
          </div>
          <a href='#booking' className='hidden rounded-xl border border-lv-gold/30 px-4 py-2 text-sm text-lv-champagne md:block'>Reserveer nu</a>
        </div>
        <p className='mt-3 text-sm text-lv-mist'>Premium taxi- en luchthavendienst in Antwerpen. Persoonlijk opgevolgd, met realtime ritzicht.</p>
        <div className='mt-4 flex flex-wrap gap-2 text-xs'><span className='status-pill'>Zakelijk & VIP-ready</span><span className='status-pill'>Founder-operated kwaliteit</span><span className='status-pill'>{isOnline ? 'Uw ritstatus wordt bijgewerkt.' : 'We herstellen de verbinding.'}</span></div>
      </header>

      <section id='booking' className='grid gap-4 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='glass-panel rounded-3xl p-5'>
          <h2 className='text-xl font-semibold'>Reserveer uw rit</h2>
          <p className='mt-1 text-sm text-lv-mist'>Vul onderstaande gegevens in. Na bevestiging ontvangt u een referentie en trackinglink.</p>
          {!confirmation && <><div className='mt-4 mb-2 text-sm text-lv-mist'>Stap {step} van 3</div>
            {step === 1 && <div className='space-y-3'>
              <label className='field-wrap'><span>Ophaallocatie</span><input placeholder='Bijv. hotel, kantoor, thuisadres' value={pickup} onChange={(e) => setPickup(e.target.value)} /></label>
              <label className='field-wrap'><span>Bestemming</span><input placeholder='Bijv. luchthaven, station, meetinglocatie' value={destination} onChange={(e) => setDestination(e.target.value)} /></label>
              <label className='field-wrap'><span>Datum & uur</span><input type='datetime-local' value={dateTime} onChange={(e) => setDateTime(e.target.value)} /></label>
              <label className='field-wrap'><span>Telefoonnummer voor opvolging</span><input placeholder='+32 ...' value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
            </div>}
            {step === 2 && <div className='space-y-3'>
              <div className='field-wrap'><span>Passagiers</span><input type='number' min={1} max={12} value={passengers} onChange={(e) => setPassengers(Number(e.target.value) || 1)} /></div>
              <div className='grid gap-2'>{vehicles.map((item) => <button key={item.name} onClick={() => setVehicle(item)} className={`vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`}><p className='font-medium'>{item.name}</p><p className='text-xs text-lv-mist'>Tot {item.seats} passagiers · ETA {item.eta}</p><p className='text-xs text-lv-mist'>{item.description}</p></button>)}</div>
            </div>}
            {step === 3 && <div className='space-y-3'>
              <button className={`toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`} onClick={() => setAirportTransfer((v) => !v)}><span>Luchthavenservice</span><span className='text-xs text-lv-mist'>Ideaal voor geplande vertrek- of aankomstritten.</span></button>
              <button className={`toggle-card ${businessVip ? 'toggle-card--active' : ''}`} onClick={() => setBusinessVip((v) => !v)}><span>Business / VIP service</span><span className='text-xs text-lv-mist'>Discreet, punctueel en professioneel.</span></button>
            </div>}
            <div className='mt-5 flex gap-2'>
              <Button variant='secondary' className='flex-1' onClick={() => setStep((v) => Math.max(1, v - 1) as Step)} disabled={loading}>Terug</Button>
              {step < 3 ? <Button className='flex-1' onClick={() => setStep((v) => Math.min(3, v + 1) as Step)} disabled={loading}>Verder</Button> : <Button className='flex-1 shadow-gold-md' onClick={submitBooking} disabled={loading || !intakeReady || !isOnline}>{loading ? 'Bevestigen...' : 'Reserveer nu'}</Button>}
            </div></>}
          {confirmation && <div className='mt-4 space-y-3 rounded-2xl border border-lv-gold/25 bg-black/40 p-4'>
            <p className='text-xs uppercase tracking-[0.18em] text-lv-champagne'>Boeking bevestigd</p>
            <p className='text-lg font-semibold'>Referentie {confirmation.referenceCode}</p><p className='text-sm text-lv-mist'>Status: {statusLabel(confirmation.status)}</p>
            <p className='text-sm text-lv-mist'>LV Transport volgt uw rit op. Uw chauffeur blijft gekoppeld aan deze rit.</p>
            <a className='inline-flex rounded-lg border border-lv-gold/40 px-3 py-2 text-sm text-lv-champagne' href={trackingUrl}>Volg uw rit</a>
          </div>}
          {info && <p className='mt-3 text-sm text-lv-champagne'>{info}</p>}
          {error && <p className='mt-3 text-sm text-rose-300'>{error}</p>}
        </div>
        <aside className='space-y-4'>
          <article className='glass-panel rounded-3xl p-4'><p className='text-xs uppercase tracking-[0.18em] text-lv-champagne'>Waarom LV Transport</p><ul className='mt-2 space-y-2 text-sm text-lv-mist'><li>Persoonlijke service door een founder-operated team.</li><li>Realtime ritopvolging met duidelijke statusupdates.</li><li>Geschikt voor luchthaven, business en VIP-vervoer.</li></ul></article>
          <article className='glass-panel rounded-3xl p-4'><p className='text-xs uppercase tracking-[0.18em] text-lv-champagne'>Indicatieve ritprijs</p><p className='mt-2 text-3xl font-semibold'>€{estimatedFare}</p><p className='text-xs text-lv-mist'>Definitieve prijs bij dispatchbevestiging.</p></article>
          <article className='glass-panel rounded-3xl p-4'><p className='text-xs uppercase tracking-[0.18em] text-lv-champagne'>Contact</p><p className='mt-2 text-sm text-lv-mist'>Vragen over uw reservatie? LV Transport neemt contact op via het opgegeven nummer.</p></article>
        </aside>
      </section>
    </div>
  </div>;
}

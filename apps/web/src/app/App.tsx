import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';

type RouteKey = 'home' | 'booking' | 'tracking' | 'prijzen' | 'diensten' | 'contact' | 'driver' | 'admin' | 'moni' | 'maps' | '404';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN ?? '';

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
  const [apiHealth, setApiHealth] = useState('controle bezig');
  const [trackingCode, setTrackingCode] = useState('');
  const [booking, setBooking] = useState({ date: '', time: '', name: '', phone: '', pickup: '', destination: '', persons: 1, notes: '' });

  const navigate = (path: string) => {
    history.pushState({}, '', path);
    setRoute(resolveRoute(path));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const onPop = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/health`)
      .then((r) => r.json())
      .then((d) => setApiHealth(d?.status ?? 'onbekend'))
      .catch(() => setApiHealth('degraded'));
  }, []);

  useEffect(() => {
    const targets: Record<RouteKey, string> = {
      home: 'hero',
      booking: 'booking',
      tracking: 'tracking',
      prijzen: 'prijzen',
      diensten: 'diensten',
      contact: 'contact',
      maps: 'maps',
      moni: 'moni',
      driver: 'driver',
      admin: 'admin',
      '404': 'hero'
    };
    const target = document.getElementById(targets[route]);
    if (target && ['home', 'booking', 'tracking', 'prijzen', 'diensten', 'contact', 'maps', 'moni'].includes(route)) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [route]);

  const mapsMissing = !GOOGLE_MAPS_KEY && !MAPBOX_KEY;
  const apiOnline = apiHealth === 'ok' || apiHealth === 'healthy';
  const bookingReady = booking.date && booking.time && booking.name && booking.phone && booking.pickup && booking.destination;
  const fixedPrices = useMemo(() => [
    ['Antwerpen Centrum → Brussels Airport', '€95'],
    ['Antwerpen Centrum → Charleroi Airport', '€165'],
    ['Antwerpen Centrum → Zaventem', '€95'],
    ['Antwerpen Centrum → Gent Centrum', '€125']
  ], []);

  const Header = (
    <header className='glass-panel sticky top-3 z-30 rounded-3xl p-4'>
      <nav className='flex flex-wrap items-center gap-2 text-sm'>
        <img src='/brand/lv-logo-header.svg' className='mr-2 h-8' alt='LV Transport' />
        {[
          ['/', 'Home'], ['/booking', 'Boeking'], ['/prijzen', 'Prijzen'], ['/tracking', 'Tracking'], ['/moni-ride', 'Moni Ride'], ['/maps', 'Maps'], ['/diensten', 'Diensten'], ['/contact', 'Contact']
        ].map(([p, l]) => <button key={p} onClick={() => navigate(p)} className='rounded-lg border border-lv-gold/30 px-3 py-1.5 hover:bg-lv-gold/15'>{l}</button>)}
        <div className='ml-auto flex gap-2'>
          <button onClick={() => navigate('/driver')} className='rounded-lg border border-white/20 px-3 py-1.5 text-xs text-lv-mist'>Driver</button>
          <button onClick={() => navigate('/admin')} className='rounded-lg border border-white/20 px-3 py-1.5 text-xs text-lv-mist'>Admin</button>
        </div>
      </nav>
    </header>
  );

  if (route === '404') return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-4xl space-y-4'>{Header}<section className='glass-panel rounded-3xl p-8 text-center'><h1 className='text-3xl font-semibold'>Pagina niet gevonden</h1><Button onClick={() => navigate('/')}>Terug naar startpagina</Button></section></div></div>;

  if (route === 'driver' || route === 'admin') {
    const isDriver = route === 'driver';
    return <div className='premium-shell min-h-screen p-6 text-white'><div className='mx-auto max-w-4xl space-y-4'>{Header}
      <section id={isDriver ? 'driver' : 'admin'} className='glass-panel rounded-3xl p-7'>
        <h1 className='text-3xl font-semibold'>{isDriver ? 'Driver toegang' : 'Admin control tower'}</h1>
        <p className='mt-2 text-lv-mist'>{isDriver ? 'Chauffeurs beheren ritacceptatie, statusupdates en navigatie in de beveiligde driver omgeving.' : 'Operations volgt booking lifecycle, actieve ritten en dispatch in de beveiligde admin omgeving.'}</p>
        <a className='mt-5 inline-flex rounded-xl border border-lv-gold/40 px-4 py-2' href={isDriver ? DRIVER_SURFACE_URL : ADMIN_SURFACE_URL}>Open {isDriver ? 'Driver' : 'Admin'} Surface</a>
      </section></div></div>;
  }

  return <div className='premium-shell min-h-screen px-4 py-4 text-white sm:px-6'>
    <div className='mx-auto w-full max-w-6xl space-y-5'>
      {Header}
      <section id='hero' className='glass-panel rounded-3xl p-6 sm:p-10'>
        <p className='text-sm uppercase tracking-[0.25em] text-lv-champagne'>Antwerpen 24/7 service</p>
        <h1 className='mt-3 text-4xl font-semibold sm:text-5xl'>Premium taxi service voor elke rit in en rond Antwerpen.</h1>
        <p className='mt-4 max-w-3xl text-lv-mist'>LV Transport is operationeel met live booking, tracking en vaste prijzen. U boekt in minuten en volgt uw chauffeur stap voor stap.</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Button onClick={() => navigate('/booking')}>Book uw rit</Button>
          <Button variant='secondary' onClick={() => navigate('/prijzen')}>Bekijk prijzen</Button>
          <Button variant='secondary' onClick={() => navigate('/tracking')}>Volg uw taxi</Button>
        </div>
        <div className='mt-6 grid gap-3 sm:grid-cols-3'>
          <div className='status-pill'>API status: <b className={apiOnline ? 'text-emerald-300' : 'text-amber-200'}>{apiHealth}</b></div>
          <div className='status-pill'>Booking lifecycle: ontvangen → toegewezen → onderweg → aangekomen</div>
          <div className='status-pill'>Tracking werkt met 6-cijferige reservatiecode</div>
        </div>
      </section>

      <section id='diensten' className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        {['Taxi Antwerpen', 'Luchthaventransfer', 'Zakelijk vervoer', 'LV VIP'].map((service) => <article key={service} className='glass-panel rounded-2xl p-5'><h3 className='text-lg font-semibold'>{service}</h3><p className='mt-2 text-sm text-lv-mist'>Stipt, veilig en premium comfort met professionele chauffeurs.</p></article>)}
      </section>

      <section id='prijzen' className='glass-panel rounded-3xl p-6'>
        <h2 className='text-2xl font-semibold'>Vaste prijzen</h2>
        <div className='mt-4 grid gap-3 sm:grid-cols-2'>{fixedPrices.map(([routeLabel, price]) => <div key={routeLabel} className='rounded-2xl border border-lv-gold/25 bg-black/20 p-4'><p className='text-sm text-lv-mist'>{routeLabel}</p><p className='text-2xl font-semibold text-lv-champagne'>{price}</p></div>)}</div>
      </section>

      <section id='booking' className='glass-panel rounded-3xl p-6'>
        <h2 className='text-2xl font-semibold'>Boek uw rit</h2>
        <div className='mt-4 grid gap-3 sm:grid-cols-2'>
          {['date', 'time', 'name', 'phone', 'pickup', 'destination', 'persons', 'notes'].map((field) => (
            <label key={field} className={`field-wrap ${field === 'notes' ? 'sm:col-span-2' : ''}`}><span>{field}</span>
              {field === 'notes' ? <input placeholder='Extra details voor chauffeur' value={booking.notes} onChange={(e) => setBooking({ ...booking, notes: e.target.value })} /> : field === 'persons' ? <input type='number' min={1} max={8} value={booking.persons} onChange={(e) => setBooking({ ...booking, persons: Number(e.target.value) })} /> : <input type={field === 'date' ? 'date' : field === 'time' ? 'time' : 'text'} value={booking[field as keyof typeof booking] as string | number} onChange={(e) => setBooking({ ...booking, [field]: e.target.value })} />}
            </label>
          ))}
        </div>
        <div className='mt-4 flex items-center gap-3'><Button disabled={!bookingReady}>Reserveer rit</Button><p className='text-sm text-lv-mist'>Geen blanco scherm: formulier blijft bruikbaar bij trage API.</p></div>
      </section>

      <section id='tracking' className='glass-panel rounded-3xl p-6'>
        <h2 className='text-2xl font-semibold'>Volg uw rit</h2>
        <p className='mt-1 text-lv-mist'>Vul uw 6-cijferige reservatiecode in om status en ETA te bekijken.</p>
        <div className='mt-3 flex gap-3'><input className='w-full rounded-xl border border-lv-gold/30 bg-black/20 px-4 py-3' maxLength={6} placeholder='Bijv. 482931' value={trackingCode} onChange={(e) => setTrackingCode(e.target.value.replace(/\D/g, '').slice(0, 6))} /><Button variant='secondary' disabled={trackingCode.length !== 6}>Controleer</Button></div>
      </section>

      <section id='moni' className='glass-panel rounded-3xl p-6'>
        <h2 className='text-2xl font-semibold'>Moni Ride assistent</h2>
        <p className='mt-2 text-lv-mist'>Hallo! Ik ben Moni Ride. Ik help u met boeken, prijzen, tracking en directe hulp bij vragen over uw rit.</p>
      </section>

      <section id='maps' className='glass-panel rounded-3xl p-6'>
        <h2 className='text-2xl font-semibold'>Route preview</h2>
        {mapsMissing ? <div className='mt-3 rounded-xl border border-amber-300/40 bg-amber-100/10 p-4 text-amber-100'>Maps API key ontbreekt. Fallback route panel actief zodat de klant altijd een operationele interface ziet.</div> : <div className='mt-3 rounded-xl border border-emerald-300/40 bg-emerald-100/10 p-4 text-emerald-100'>Maps key gevonden. Route preview staat klaar.</div>}
        <div className='mt-3 h-48 rounded-2xl border border-lv-gold/20 bg-black/30 p-4 text-sm text-lv-mist'>Fallback kaartpaneel: pickup, bestemming en ETA blijven zichtbaar.</div>
      </section>

      <section id='contact' className='glass-panel rounded-3xl p-6 text-sm'>
        <h2 className='text-xl font-semibold'>Contact</h2>
        <p className='mt-2'>+32 466 48 79 36</p><p>info@lvtransport.be</p><p>www.lvtransport.be</p><p>BTW: BE 1036.807.066</p>
      </section>
      <MoniAssistant />
    </div>
  </div>;
}

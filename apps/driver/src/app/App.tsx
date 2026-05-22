import { useEffect, useState } from 'react';
import { AccountStatus, type AuthState, UserRole } from '@lvtransport/auth';
import { driverAuthProvider, driverAuthService } from '../modules/auth/services/auth-client.service';

type TripState = 'Pickup' | 'On route' | 'Arrived' | 'Completed';

const tripStates: TripState[] = ['Pickup', 'On route', 'Arrived', 'Completed'];

const performanceStats = [
  { label: 'Acceptance rate', value: '96%', detail: 'Top 10% today' },
  { label: 'Cancellation', value: '1.2%', detail: 'Excellent consistency' },
  { label: 'Avg. rating', value: '4.96', detail: 'From 248 riders' },
  { label: 'On-time pickup', value: '94%', detail: 'Strong punctuality' }
];

const rideHistory = [
  { id: 'LV-9012', rider: 'Ava M.', route: 'Bellagio → The Venetian', fare: '$24.80', status: 'Completed' },
  { id: 'LV-9011', rider: 'Noah P.', route: 'Wynn → Airport T1', fare: '$31.20', status: 'Completed' },
  { id: 'LV-9010', rider: 'Sophia R.', route: 'Aria → Fremont Street', fare: '$19.30', status: 'Completed' }
];

const notifications = [
  { title: 'Driver assigned: BK-10928', note: 'Pickup at Fontainebleau • customer tracking live', time: 'Just now' },
  { title: 'Performance badge unlocked', note: 'Maintained 4.9+ rating this week', time: '18m ago' },
  { title: 'Vehicle inspection reminder', note: 'Schedule check before May 15', time: '1h ago' }
];
export function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true });
  const [email, setEmail] = useState('driver@lvtransport.dev');
  const [password, setPassword] = useState('password123');
  const [allowed, setAllowed] = useState(false);
  useEffect(() => { driverAuthService.getInitialState().then(setAuthState); }, []);
  const login = async () => { const t = await driverAuthService.signIn({ email, password }); const u = await driverAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.DRIVER) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
  const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
  if (!authState.isAuthenticated) return <main className='min-h-screen bg-zinc-950 p-8 text-white'><h1 className='text-3xl mb-4'>Driver Login</h1><input className='text-black p-2 mr-2' value={email} onChange={(e)=>setEmail(e.target.value)} /><input className='text-black p-2 mr-2' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} /><button className='bg-amber-400 text-black px-3 py-2 rounded' onClick={login}>Sign in</button></main>;
  if (!allowed) return <main className='min-h-screen bg-zinc-950 p-8 text-white'>Access denied<button onClick={logout}>Logout</button></main>;
  return <main className='min-h-screen bg-zinc-950 text-white p-8'><h1 className='text-3xl text-amber-300'>Driver Console</h1><p>Authenticated driver session ready for trip state modules.</p><button onClick={logout}>Logout</button></main>;
import {
  dispatchMvpStore,
  getDispatchSnapshot,
  type DispatchBookingStatus,
  type DriverAvailabilityStatus,
} from '@lvtransport/realtime';

const DRIVER_ID = 'DRV-100';
const nextStatuses: DispatchBookingStatus[] = ['driver_arriving', 'passenger_onboard', 'completed'];

export function App() {
  const [state, setState] = useState(getDispatchSnapshot());
  const [availability, setAvailability] = useState<DriverAvailabilityStatus>('available');

  useEffect(() => {
    dispatchMvpStore.setDriverAvailability(DRIVER_ID, availability);
  }, [availability]);

  useEffect(() => dispatchMvpStore.subscribe(setState), []);

  const activeRide = dispatchMvpStore.getDriverActiveRide(DRIVER_ID);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <h1 className="text-2xl font-bold text-amber-300">Driver Console (Dispatch MVP)</h1>

      <section className="mt-5 rounded-2xl border border-zinc-700 p-4">
        <h2 className="text-amber-200">Availability</h2>
        <select
          className="mt-2 rounded bg-zinc-800 p-2"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as DriverAvailabilityStatus)}
        >
          <option value="offline">offline</option>
          <option value="available">available</option>
          <option value="on_assignment">on_assignment</option>
        </select>
      </section>

      <section className="mt-5 rounded-2xl border border-zinc-700 p-4">
        <h2 className="text-amber-200">Assigned Ride</h2>
        {activeRide ? (
          <div className="mt-2 space-y-3">
            <p>{activeRide.bookingId} • {activeRide.status}</p>
            {activeRide.status === 'assigned' && (
              <div className="flex gap-2">
                <button className="rounded bg-amber-500 px-3 py-2 text-zinc-900" onClick={() => dispatchMvpStore.driverRespond(activeRide.bookingId, DRIVER_ID, 'accept')}>Accept Ride</button>
                <button className="rounded border border-zinc-600 px-3 py-2" onClick={() => dispatchMvpStore.driverRespond(activeRide.bookingId, DRIVER_ID, 'reject')}>Reject Ride</button>
              </div>
            )}
            {activeRide.status === 'driver_accepted' && (
              <div className="flex gap-2">{nextStatuses.map((status) => <button key={status} className="rounded border border-zinc-600 px-3 py-1" onClick={() => dispatchMvpStore.updateRideStatus(activeRide.bookingId, status, DRIVER_ID)}>{status}</button>)}</div>
            )}
          </div>
        ) : <p className="mt-2 text-zinc-400">No active assignment.</p>}
      </section>

      <section className="mt-5 rounded-2xl border border-zinc-700 p-4">
        <h2 className="text-amber-200">Realtime Feed</h2>
        <ul className="mt-2 space-y-2 text-sm">{state.bookings.map((b) => <li key={b.bookingId}>{b.bookingId}: {b.status}</li>)}</ul>
      </section>
    </main>
  );
import { useEffect, useMemo, useState } from 'react';
import { BookingLifecycle, canTransitionLifecycle, isImmutableLifecycleStatus, registerLifecycleEvent } from '@lvtransport/realtime';
import { createDriverGpsService, type GpsSnapshot } from '../modules/tracking/services/driver-gps.service';

type Booking = { id: string; code: string; status: BookingLifecycle; assignedDriverName?: string; version: number; assignedDriverId?: string };


const DRIVER_ID = 'drv-101';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const API_ORIGIN = new URL(API_BASE).origin;

const stepLabel: Partial<Record<BookingLifecycle, string>> = {
  assigned: 'Rit accepteren',
  accepted: 'Onderweg naar klant',
  en_route: 'Aangekomen',
  arrived: 'Rit gestart',
  in_progress: 'Rit afronden'
};

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveLocation, setLiveLocation] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Locatiedeling staat uit.');
  const gpsService = useMemo(() => createDriverGpsService({ minUpdateMs: 8000, minDistanceMeters: 25 }), []);
  const [driverDot, setDriverDot] = useState({ x: 28, y: 72 });

  const refresh = async () => {
    const response = await fetch(`${API_BASE}/bookings`);
    const result = await response.json();
    setBookings(result.bookings.filter((b: Booking) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned'));
  };

  const activeBookingId = bookings.find((b) => !['completed', 'cancelled', 'failed'].includes(b.status))?.id;

  const sendLocation = async (snapshot: GpsSnapshot) => {
    await fetch(`${API_BASE}/drivers/${DRIVER_ID}/location`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...snapshot, bookingId: activeBookingId, idempotencyKey: `gps-${DRIVER_ID}-${snapshot.capturedAt}` })
    });
    setGpsMessage(`Live locatie bijgewerkt om ${new Date(snapshot.capturedAt).toLocaleTimeString('nl-BE')}.`);
  };

  useEffect(() => { refresh(); const wsProtocol = API_ORIGIN.startsWith('https') ? 'wss' : 'ws'; const wsHost = API_ORIGIN.replace(/^https?:\/\//, ''); const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws`); ws.onmessage = () => refresh(); return () => ws.close(); }, []);
  useEffect(() => { if (!liveLocation) { gpsService.stop(); setGpsMessage('Locatiedeling staat uit.'); return; } gpsService.start(sendLocation, setGpsMessage); return () => gpsService.stop(); }, [liveLocation, activeBookingId, gpsService]);
  useEffect(() => { const t = setInterval(() => setDriverDot((d) => ({ x: d.x > 78 ? 28 : d.x + 2, y: d.y < 34 ? 72 : d.y - 1.3 })), 1300); return () => clearInterval(t); }, []);

  const updateStatus = async (booking: Booking) => {
    const transitionMap: Partial<Record<BookingLifecycle, BookingLifecycle>> = {
      [BookingLifecycle.ASSIGNED]: BookingLifecycle.ACCEPTED,
      [BookingLifecycle.ACCEPTED]: BookingLifecycle.EN_ROUTE,
      [BookingLifecycle.EN_ROUTE]: BookingLifecycle.ARRIVED,
      [BookingLifecycle.ARRIVED]: BookingLifecycle.IN_PROGRESS,
      [BookingLifecycle.IN_PROGRESS]: BookingLifecycle.COMPLETED
    };
    const nextStatus = transitionMap[booking.status];
    if (!nextStatus || !canTransitionLifecycle(booking.status, nextStatus)) return;
    if (isImmutableLifecycleStatus(booking.status)) return;
    const eventKey = `driver-${booking.id}-${booking.version}`;
    if (!registerLifecycleEvent(eventKey)) return;
    setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: nextStatus, version: b.version + 1 } : b));
    const response = await fetch(`${API_BASE}/bookings/${booking.id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, actor: 'driver', expectedVersion: booking.version, idempotencyKey: eventKey })
    });
    if (!response.ok) refresh();
    if (response.ok && isImmutableLifecycleStatus(nextStatus)) setLiveLocation(false);
  };

  return <main className="min-h-screen bg-lvtp-obsidian p-4 text-white sm:p-6">
    <div className="lvtp-network absolute inset-0 pointer-events-none opacity-40" />
    <div className="relative mx-auto max-w-3xl space-y-4">
      <header className="lvtp-shell rounded-3xl p-5">
        <div className="flex items-center gap-3"><img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-10 w-auto rounded-md border border-amber-400/30 bg-black/80 p-1" /><h1 className="text-xl font-semibold text-amber-200">LV Driver</h1></div>
        <p className="mt-2 text-sm text-zinc-300">Snelle lifecycle-controle voor professionele, veilige rituitvoering.</p>
      <button className="lvtp-btn-primary mt-3" onClick={() => (window as any).__lvPwa?.promptInstall?.()}>Install app</button></header>
      <section className="lvtp-card rounded-2xl p-4">
        <button className="lvtp-btn-primary w-full" onClick={() => setLiveLocation((v) => !v)}>{liveLocation ? 'Locatiedeling stoppen' : 'Locatiedeling starten'}</button>
        <p className="mt-2 text-sm text-zinc-300">{gpsMessage}</p>
      </section>
      <section className="lvtp-card overflow-hidden rounded-2xl p-0"><div className="relative h-[52vh] min-h-[340px] bg-[#06070a]"><div className="absolute inset-0 opacity-40" style={{backgroundImage:'linear-gradient(rgba(245,191,73,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(245,191,73,.08) 1px, transparent 1px)',backgroundSize:'34px 34px'}} /><div className="absolute left-[12%] top-[62%] rounded-full border border-amber-300/40 bg-black/70 px-2 py-1 text-xs text-amber-100">Pickup</div><div className="absolute right-[14%] top-[20%] rounded-full border border-amber-300/40 bg-black/70 px-2 py-1 text-xs text-amber-100">Dropoff</div><div className="absolute left-[13%] top-[64%] h-[2px] w-[72%] -rotate-[29deg] bg-amber-300/70" /><div className="absolute z-20 h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(245,191,73,.8)] transition-all duration-1000" style={{left:`${driverDot.x}%`, top:`${driverDot.y}%`}} /></div></section>
      <section className="grid gap-3">
        {bookings.map((booking) => <article key={booking.id} className="lvtp-card rounded-2xl p-4">
          <p className="font-semibold text-amber-100">{booking.code}</p>
          <p className="text-sm text-zinc-300">Status: {booking.status}</p>
          {stepLabel[booking.status] && <button className="lvtp-btn-primary mt-3 w-full" onClick={() => updateStatus(booking)}>{stepLabel[booking.status]}</button>}
          {booking.status === 'completed' && <p className="mt-2 text-sm text-emerald-300">Rit correct afgerond.</p>}
        </article>)}
      </section>
    </div>
  </main>;
}

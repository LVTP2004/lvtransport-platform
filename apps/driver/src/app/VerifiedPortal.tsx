import { DriverOperations } from './DriverOperations';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createLVTransportFirebaseProvider } from '@lvtransport/auth';
import { GoogleLoginBoundary } from '../modules/auth/components/GoogleLoginBoundary';

import { createDriverGpsService, type GpsSnapshot } from '../modules/tracking/services/driver-gps.service';

type BookingLifecycle = 'pending' | 'assigned' | 'accepted' | 'en_route' | 'arrived' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
const isImmutableLifecycleStatus = (status: BookingLifecycle) => ['completed', 'cancelled', 'failed'].includes(status);

type Booking = { id: string; code: string; status: BookingLifecycle; assignedDriverName?: string; version: number; assignedDriverId?: string };


const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const API_ORIGIN = new URL(API_BASE).origin;

const stepLabel: Partial<Record<BookingLifecycle, string>> = {
  assigned: 'Rit accepteren',
  accepted: 'Onderweg naar klant',
  en_route: 'Aangekomen',
  arrived: 'Rit gestart',
  in_progress: 'Rit afronden'
};

function OperationalDriver({ driverId }: { driverId: string }) {
  const inFlight = useRef(new Set<string>());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveLocation, setLiveLocation] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Locatiedeling staat uit.');
  const gpsService = useMemo(() => createDriverGpsService({ minUpdateMs: 8000, minDistanceMeters: 25 }), []);

  const refresh = async () => {
    const response = await fetch(`${API_BASE}/bookings`);
    const result = await response.json();
    setBookings(result.bookings.filter((b: Booking) => b.assignedDriverId === driverId));
  };

  const activeBookingId = bookings.find((b) => !['completed', 'cancelled', 'failed'].includes(b.status))?.id;

  const sendLocation = async (snapshot: GpsSnapshot) => {
    await fetch(`${API_BASE}/drivers/${driverId}/location`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...snapshot, bookingId: activeBookingId, idempotencyKey: `gps-${driverId}-${snapshot.capturedAt}` })
    });
    setGpsMessage(`Live locatie bijgewerkt om ${new Date(snapshot.capturedAt).toLocaleTimeString('nl-BE')}.`);
  };

  useEffect(() => { refresh(); const wsProtocol = API_ORIGIN.startsWith('https') ? 'wss' : 'ws'; const wsHost = API_ORIGIN.replace(/^https?:\/\//, ''); const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws`); ws.onmessage = () => refresh(); return () => ws.close(); }, []);
  useEffect(() => { if (!liveLocation) { gpsService.stop(); setGpsMessage('Locatiedeling staat uit.'); return; } gpsService.start(sendLocation, setGpsMessage); return () => gpsService.stop(); }, [liveLocation, activeBookingId, gpsService]);

  const updateStatus = async (booking: Booking) => {
    const transitionMap: Partial<Record<BookingLifecycle, BookingLifecycle>> = {
      ['assigned']: 'accepted',
      ['accepted']: 'en_route',
      ['en_route']: 'arrived',
      ['arrived']: 'in_progress',
      ['in_progress']: 'completed'
    };
    const nextStatus = transitionMap[booking.status];
    if (!nextStatus) return;
    if (isImmutableLifecycleStatus(booking.status)) return;
    const eventKey = `driver-${booking.id}-${booking.version}`;
    if (inFlight.current.has(booking.id)) return;
    inFlight.current.add(booking.id);
    try {
    const response = await fetch(`${API_BASE}/bookings/${booking.id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus, actor: 'driver', expectedVersion: booking.version, idempotencyKey: eventKey })
    });
    if (!response.ok) throw new Error('Ritstatus kon niet worden bijgewerkt.');
    await refresh();
    if (isImmutableLifecycleStatus(nextStatus)) setLiveLocation(false);
    } catch {
      setGpsMessage('Ritstatus kon niet worden bijgewerkt.');
    } finally {
      inFlight.current.delete(booking.id);
    }
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

const createDriverGoogleProvider = () => createLVTransportFirebaseProvider('driver');

// The boundary verifies the server identity; every command is authorized again by the API.
export function App() {
  return <GoogleLoginBoundary title="Driver Login" createProvider={createDriverGoogleProvider} expectedRole="driver"
    renderOperations={({ client }) => <DriverOperations client={client} />} />;
}

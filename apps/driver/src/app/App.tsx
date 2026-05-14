import { useEffect, useMemo, useState } from 'react';
import { BookingLifecycle, canTransitionLifecycle, isImmutableLifecycleStatus, registerLifecycleEvent } from '@lvtransport/realtime';
import { createDriverGpsService, type GpsSnapshot } from '../modules/tracking/services/driver-gps.service';

type Booking = { id: string; code: string; status: BookingLifecycle; assignedDriverName?: string; version: number; assignedDriverId?: string };


const DRIVER_ID = 'drv-101';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveLocation, setLiveLocation] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Locatiedeling staat uit.');
  const gpsService = useMemo(() => createDriverGpsService({ minUpdateMs: 8000, minDistanceMeters: 25 }), []);

  const refresh = async () => {
    const response = await fetch(`${API_BASE}/bookings`);
    const result = await response.json();
    setBookings(result.bookings.filter((b: Booking) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned'));
  };

  const activeBookingId = bookings.find((b) => !['completed', 'cancelled', 'failed'].includes(b.status))?.id;

  const sendLocation = async (snapshot: GpsSnapshot) => {
    await fetch(`http://localhost:8080/api/v1/drivers/${DRIVER_ID}/location`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...snapshot, bookingId: activeBookingId, idempotencyKey: `gps-${DRIVER_ID}-${snapshot.capturedAt}` })
    });
    setGpsMessage(`Live locatie bijgewerkt om ${new Date(snapshot.capturedAt).toLocaleTimeString('nl-BE')}.`);
  };

  useEffect(() => { refresh(); const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`); ws.onmessage = () => refresh(); return () => ws.close(); }, []);
  useEffect(() => { if (!liveLocation) { gpsService.stop(); setGpsMessage('Locatiedeling staat uit.'); return; } gpsService.start(sendLocation, setGpsMessage); return () => gpsService.stop(); }, [liveLocation, activeBookingId, gpsService]);

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

  return <main className="min-h-screen bg-zinc-950 p-4 text-white sm:p-6">
    <div className="mx-auto max-w-3xl space-y-4">
      <header className="rounded-2xl border border-amber-300/25 bg-black/70 p-4">
        <div className="flex items-center gap-3"><img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-10 w-auto rounded-md border border-amber-400/30 bg-black/80 p-1" /><h1 className="text-xl font-semibold text-amber-300">Driver Panel</h1></div>
        <p className="mt-2 text-sm text-zinc-300">Duidelijke ritstatus voor veilige en professionele uitvoering.</p>
      </header>
      <section className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
        <button className="w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-black" onClick={() => setLiveLocation((v) => !v)}>{liveLocation ? 'Locatiedeling stoppen' : 'Locatiedeling starten'}</button>
        <p className="mt-2 text-sm text-zinc-300">{gpsMessage}</p>
      </section>
      <section className="grid gap-3">
        {bookings.map((booking) => <article key={booking.id} className="rounded-2xl border border-zinc-700 bg-zinc-900 p-4">
          <p className="font-semibold">{booking.code}</p>
          <p className="text-sm text-zinc-300">Status: {booking.status}</p>
          {booking.status === 'assigned' && <button className="mt-3 w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-black" onClick={() => updateStatus(booking)}>Rit accepteren</button>}
          {!['completed', 'cancelled', 'failed'].includes(booking.status) && <button className="mt-2 w-full rounded-lg border border-zinc-600 px-3 py-2" onClick={() => updateStatus(booking)}>Volgende status</button>}
          {booking.status === 'completed' && <p className="mt-2 text-sm text-emerald-300">Rit correct afgerond.</p>}
        </article>)}
      </section>
    </div>
  </main>;
}

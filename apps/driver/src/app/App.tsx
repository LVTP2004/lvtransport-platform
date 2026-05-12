import { useEffect, useMemo, useState } from 'react';
import { createDriverGpsService, type GpsSnapshot } from '../modules/tracking/services/driver-gps.service';

type Booking = { id: string; code: string; status: string; assignedDriverName?: string; version: number; assignedDriverId?: string };

const statusFlow = ['assigned', 'driver_arriving', 'passenger_onboard', 'completed'] as const;
const DRIVER_ID = 'drv-101';

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [liveLocation, setLiveLocation] = useState(false);
  const [gpsMessage, setGpsMessage] = useState('Live location is disabled.');
  const gpsService = useMemo(() => createDriverGpsService({ minUpdateMs: 8000, minDistanceMeters: 25 }), []);

  const refresh = async () => {
    const response = await fetch('http://localhost:8080/api/v1/bookings');
    const result = await response.json();
    setBookings(result.bookings.filter((b: Booking) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned'));
  };

  const activeBookingId = bookings.find((b) => !['completed', 'cancelled', 'failed'].includes(b.status))?.id;

  const sendLocation = async (snapshot: GpsSnapshot) => {
    await fetch(`http://localhost:8080/api/v1/drivers/${DRIVER_ID}/location`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...snapshot, bookingId: activeBookingId, idempotencyKey: `gps-${DRIVER_ID}-${snapshot.capturedAt}` })
    });
    setGpsMessage(`Live: ${snapshot.lat.toFixed(5)}, ${snapshot.lng.toFixed(5)} @ ${new Date(snapshot.capturedAt).toLocaleTimeString()}`);
  };

  useEffect(() => {
    refresh();
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`);
    ws.onmessage = () => refresh();
    return () => ws.close();
  }, []);

  useEffect(() => {
    if (!liveLocation) {
      gpsService.stop();
      setGpsMessage('Live location is disabled.');
      return;
    }
    gpsService.start(sendLocation, setGpsMessage);
    return () => gpsService.stop();
  }, [liveLocation, activeBookingId, gpsService]);

  const updateStatus = async (booking: Booking) => {
    const idx = statusFlow.findIndex((s) => s === booking.status);
    if (idx < 0 || idx >= statusFlow.length - 1) return;
    const nextStatus = statusFlow[idx + 1];
    const optimistic = bookings.map((b) => b.id === booking.id ? { ...b, status: nextStatus, version: b.version + 1 } : b);
    setBookings(optimistic);
    const response = await fetch(`http://localhost:8080/api/v1/bookings/${booking.id}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextStatus, actor: 'driver', expectedVersion: booking.version, idempotencyKey: `driver-${booking.id}-${booking.version}` })
    });
    if (!response.ok) refresh();
  };

  return <main className="min-h-screen bg-zinc-950 p-6 text-white">
    <h1 className="text-2xl font-bold text-amber-300">Driver Dispatch Realtime</h1>
    <div className="mt-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4">
      <button className="rounded bg-amber-500 px-3 py-1 text-black" onClick={() => setLiveLocation((v) => !v)}>{liveLocation ? 'Disable live location' : 'Enable live location'}</button>
      <p className="mt-2 text-sm text-zinc-300">{gpsMessage}</p>
    </div>
    <div className="mt-4 grid gap-3">
      {bookings.map((booking) => <article key={booking.id} className="rounded-xl border border-zinc-700 bg-zinc-900 p-4">
        <p className="font-semibold">{booking.code}</p>
        <p className="text-sm text-zinc-300">Status: {booking.status}</p>
        {booking.status === 'assigned' && <div className="mt-2 flex gap-2"><button className="rounded bg-amber-500 px-3 py-1 text-black" onClick={() => updateStatus(booking)}>Accept Ride</button><button className="rounded border border-zinc-600 px-3 py-1">Reject</button></div>}
        {booking.status !== 'assigned' && booking.status !== 'completed' && <button className="mt-2 rounded border border-zinc-600 px-3 py-1" onClick={() => updateStatus(booking)}>Next status</button>}
      </article>)}
    </div>
  </main>;
}

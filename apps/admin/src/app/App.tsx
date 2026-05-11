import { useEffect, useMemo, useState } from 'react';
import { BookingLifecycle } from '@lvtransport/realtime';

type Booking = {
  id: string;
  code: string;
  customerName: string;
  status: BookingLifecycle;
  assignedDriverName?: string;
  version: number;
};

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  const refresh = async () => {
    const response = await fetch('http://localhost:8080/api/v1/bookings');
    const result = await response.json();
    setBookings(result.bookings);
  };

  useEffect(() => {
    refresh();
    const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`);
    ws.onmessage = () => refresh();
    return () => ws.close();
  }, []);

  const assign = async (bookingId: string) => {
    await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/assign-driver`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ driverId: 'drv-101', driverName: 'Marco V.', idempotencyKey: `assign-${bookingId}` })
    });
    refresh();
  };

  const confirm = async (bookingId: string, version: number) => {
    await fetch(`http://localhost:8080/api/v1/bookings/${bookingId}/status`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextStatus: 'confirmed', actor: 'admin', expectedVersion: version, idempotencyKey: `confirm-${bookingId}-${version}` })
    });
    refresh();
  };

  const active = useMemo(() => bookings.filter((b) => !['completed', 'cancelled', 'failed'].includes(b.status)).length, [bookings]);

  return <main className="min-h-screen bg-zinc-900 p-6 text-white">
    <h1 className="text-2xl font-bold text-amber-300">Admin Realtime Dispatch</h1>
    <p className="mt-2 text-zinc-300">Active bookings: {active}</p>
    <div className="mt-5 grid gap-3">
      {bookings.map((b) => <article key={b.id} className="rounded-xl border border-zinc-700 bg-zinc-950 p-4">
        <p className="font-semibold">{b.code} • {b.customerName}</p>
        <p className="text-sm text-zinc-300">Status: {b.status} • Driver: {b.assignedDriverName ?? 'Unassigned'}</p>
        <div className="mt-3 flex gap-2">
          {b.status === 'quoted' && <button className="rounded bg-amber-500 px-3 py-1 text-black" onClick={() => confirm(b.id, b.version)}>Confirm</button>}
          {['confirmed', 'assigned'].includes(b.status) && <button className="rounded border border-zinc-500 px-3 py-1" onClick={() => assign(b.id)}>Assign Driver</button>}
        </div>
      </article>)}
    </div>
  </main>;
}

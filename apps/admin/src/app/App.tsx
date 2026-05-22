import { useEffect, useMemo, useState } from 'react';
import { dispatchMvpStore, getDispatchSnapshot, type DispatchBookingStatus } from '@lvtransport/realtime';

const DRIVERS = ['DRV-100', 'DRV-101', 'DRV-102'];

export function App() {
  const [state, setState] = useState(getDispatchSnapshot());
  const [bookingId, setBookingId] = useState('BK-2001');
  const [customerId, setCustomerId] = useState('CUS-501');
  const [driverId, setDriverId] = useState(DRIVERS[0]);

  useEffect(() => dispatchMvpStore.subscribe(setState), []);

  const assign = () => dispatchMvpStore.assignDriver(bookingId, customerId, driverId, 'admin-control');

  const counts = useMemo(() => ({
    pending: state.bookings.filter((b) => b.status === 'pending').length,
    assigned: state.bookings.filter((b) => b.status === 'assigned').length,
    accepted: state.bookings.filter((b) => b.status === 'driver_accepted').length,
    rejected: state.bookings.filter((b) => b.status === 'driver_rejected').length,
  }), [state.bookings]);

  return (
    <main className="min-h-screen bg-zinc-900 p-6 text-zinc-100">
      <h1 className="text-2xl font-bold text-amber-300">Dispatch Control Tower (MVP)</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-4">{Object.entries(counts).map(([k,v]) => <div key={k} className="rounded-xl border border-zinc-700 p-3">{k}: {v}</div>)}</div>

      <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4">
        <h2 className="font-semibold text-amber-200">Assign Booking</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input className="rounded bg-zinc-800 p-2" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
          <input className="rounded bg-zinc-800 p-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          <select className="rounded bg-zinc-800 p-2" value={driverId} onChange={(e) => setDriverId(e.target.value)}>{DRIVERS.map((d) => <option key={d}>{d}</option>)}</select>
          <button className="rounded bg-amber-500 px-3 py-2 font-semibold text-zinc-900" onClick={assign}>Assign</button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4">
        <h2 className="font-semibold text-amber-200">Assignment History / Driver Response</h2>
        <div className="mt-3 space-y-3">
          {state.bookings.map((booking) => (
            <article key={booking.bookingId} className="rounded border border-zinc-700 p-3">
              <p>{booking.bookingId} • {booking.customerId} • Driver: {booking.driverId ?? 'unassigned'} • <Status status={booking.status} /></p>
              <ul className="mt-2 list-disc pl-5 text-xs text-zinc-300">
                {booking.history.map((h, i) => <li key={`${h.occurredAt}-${i}`}>{h.occurredAt} — {h.type} ({h.actorId}) {h.note ?? ''}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Status({ status }: { status: DispatchBookingStatus }) {
  return <span className="text-emerald-300">{status}</span>;
}

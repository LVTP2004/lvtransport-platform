import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { VerifiedOperationsClient } from '@lvtransport/auth';

type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string;
  customerName?: string; customerPhone?: string; customerEmail?: string; notes?: string; status: string; version: number; location?: { lat: number; lng: number; capturedAt: string } | null; assignment: { driverId: string; vehicleId: string } | null;
  transitions: { to: string; occurredAt: string; metadata?: { actor_id?: string; operation_id?: string } }[] };
type Driver = { id: string; name: string; status: string; vehicleId: string; lastSeenAt: string };
type Vehicle = { id: string; registration: string; name: string; fleetType: string };
const terminal = new Set(['completed', 'cancelled', 'failed']);

export function BookingOperations({ client }: { client: VerifiedOperationsClient }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ registration: '', name: '', fleetType: 'own' });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true), sequence = useRef(0);
  const [error, setError] = useState('');
  const [updated, setUpdated] = useState('');
  const refresh = useCallback(async () => {
    const attempt = ++sequence.current;
    const [b, d, v] = await Promise.all([
      client.request<{ bookings: Booking[] }>('/operations/bookings'),
      client.request<{ drivers: Driver[] }>('/operations/drivers'),
      client.request<{ vehicles: Vehicle[] }>('/operations/vehicles'),
    ]);
    if (!mounted.current || attempt !== sequence.current) return;
    setBookings(b.bookings); setDrivers(d.drivers); setVehicles(v.vehicles);
    setUpdated(new Date().toLocaleTimeString()); setError('');
  }, [client]);
  useEffect(() => {
    mounted.current = true;
    const update = () => { void refresh().catch(() => { if (mounted.current) setError('Operational data could not be refreshed. Previously loaded data may be out of date.'); }); };
    update(); const timer = setInterval(update, 15000);
    return () => { mounted.current = false; clearInterval(timer); };
  }, [refresh]);
  async function run(work: () => Promise<unknown>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try { await work(); await refresh(); }
    catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Operation failed.'); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  function registerVehicle(event: FormEvent) {
    event.preventDefault();
    void run(async () => { await client.request('/operations/vehicles', { body: form }); if (mounted.current) setForm({ registration: '', name: '', fleetType: 'own' }); });
  }
  return <div className="space-y-8">
    <header><h2 className="text-xl">Bookings and dispatch</h2><p>Last loaded: {updated || 'Not loaded'}</p>
      <button disabled={busy} onClick={() => void run(refresh)}>Refresh</button></header>
    {error && <p role="alert">{error}</p>}
    <section><h2 className="text-xl">Vehicles</h2>
      <form onSubmit={registerVehicle} className="my-3 flex flex-wrap gap-3">
        <label>Registration <input className="bg-zinc-800 p-2" required maxLength={24} value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} /></label>
        <label>Vehicle <input className="bg-zinc-800 p-2" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label>Fleet <select className="bg-zinc-800 p-2" value={form.fleetType} onChange={e => setForm({ ...form, fleetType: e.target.value })}>
          <option value="own">Own fleet</option><option value="external">External</option></select></label>
        <button disabled={busy} type="submit">Register vehicle</button>
      </form>
      {vehicles.length ? <ul>{vehicles.map(vehicle => <li key={vehicle.id}>{vehicle.registration} · {vehicle.name} · {vehicle.fleetType}</li>)}</ul> : updated ? <p>No vehicles registered.</p> : <p>Vehicle data has not loaded yet.</p>}
    </section>
    <section><h2 className="text-xl">Drivers</h2>
      {drivers.length ? <ul>{drivers.map(driver => <li key={driver.id}>{driver.name} · {driver.status} · Last seen {new Date(driver.lastSeenAt).toLocaleString()}</li>)}</ul> : updated ? <p>No authorized driver has reported availability yet.</p> : <p>Driver data has not loaded yet.</p>}
    </section>
    <section className="space-y-4"><h2 className="text-xl">Reservations</h2>
      {updated && !bookings.length && <p>No bookings loaded.</p>}
      {bookings.map(booking => <article className="rounded border border-amber-400/30 p-4" key={booking.id}>
        <h3>{booking.referenceCode} · {booking.status}</h3>
        <p>{booking.customerName} · {new Date(booking.scheduleAt).toLocaleString()}</p>
        <p>{booking.pickup} → {booking.destination}</p>
        {booking.customerPhone && <p><a href={`tel:${booking.customerPhone}`}>{booking.customerPhone}</a></p>}
        {booking.customerEmail && <p><a href={`mailto:${encodeURIComponent(booking.customerEmail)}`}>{booking.customerEmail}</a></p>}
        {booking.notes && <p>{booking.notes}</p>}
        {booking.location && <p>Driver-reported location ({new Date(booking.location.capturedAt).toLocaleTimeString()}):
          {' '}<a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${encodeURIComponent(booking.location.lat + ',' + booking.location.lng)}`}>Open map</a>
        </p>}
        {booking.assignment && <p>Driver: {drivers.find(d => d.id === booking.assignment?.driverId)?.name ?? booking.assignment.driverId} · Vehicle: {vehicles.find(v => v.id === booking.assignment?.vehicleId)?.registration ?? booking.assignment.vehicleId}</p>}
        {booking.status === 'pending' && !booking.assignment && <div className="my-3 flex gap-3">
          <select aria-label={`Driver for ${booking.referenceCode}`} className="bg-zinc-800 p-2" value={selection[booking.id] ?? ''} onChange={e => setSelection({ ...selection, [booking.id]: e.target.value })}>
            <option value="">Select available driver</option>
            {drivers.filter(driver => driver.status === 'available').map(driver => <option key={driver.id} value={driver.id}>{driver.name} · {vehicles.find(v => v.id === driver.vehicleId)?.registration}</option>)}
          </select>
          <button disabled={busy || !selection[booking.id]} onClick={() => void run(() => client.request(`/operations/bookings/${booking.id}/assignment`, {
            body: { driverId: selection[booking.id], expectedVersion: booking.version }, key: `assign:${booking.id}:${booking.version}:${selection[booking.id]}`,
          }))}>Assign</button>
        </div>}
        {!terminal.has(booking.status) && <button disabled={busy} onClick={() => {
          if (window.confirm(`Cancel ${booking.referenceCode}?`)) void run(() => client.request(`/operations/bookings/${booking.id}/status`, {
            body: { status: 'cancelled', expectedVersion: booking.version }, key: `cancel:${booking.id}:${booking.version}`,
          }));
        }}>Cancel booking</button>}
        <details className="mt-3"><summary>History</summary><ol>{booking.transitions.map((transition, index) => <li key={index}>
          {new Date(transition.occurredAt).toLocaleString()} · {transition.to}{transition.metadata?.actor_id && ` · ${transition.metadata.actor_id}`}
        </li>)}</ol></details>
      </article>)}
    </section>
  </div>;
}

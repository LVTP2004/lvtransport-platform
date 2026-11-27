import { FounderOperationsMap } from '../../../web/src/pages/FounderOperationsMap';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { VerifiedOperationsClient } from '@lvtransport/auth';

type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string;
  customerName?: string; customerPhone?: string; customerEmail?: string; notes?: string; status: string; version: number; location?: { lat: number; lng: number; capturedAt: string; receivedAt?: string } | null; assignment: { driverId: string; vehicleId: string } | null;
  transitions: { to: string; occurredAt: string; metadata?: { actor_id?: string; operation_id?: string } }[] };
type Driver = { id: string; name: string; status: string; vehicleId: string; lastSeenAt: string };
type Vehicle = { id: string; registration: string; name: string; fleetType: string };
const terminal = new Set(['completed', 'cancelled', 'failed']);

export function BookingOperations({ client }: { client: VerifiedOperationsClient }) {
  const [section, setSection] = useState<'reservations' | 'vehicles' | 'drivers'>('reservations');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [assignmentFeedback, setAssignmentFeedback] = useState<{ id: string; text: string } | null>(null);
  const [selection, setSelection] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ registration: '', name: '', fleetType: 'own' });
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true), sequence = useRef(0);
  const [error, setError] = useState('');
  const [vehicleFeedback, setVehicleFeedback] = useState('');
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
    const registration = form.registration.trim().toUpperCase().replace(/\s+/g, '');
    const name = form.name.trim();
    if (!/^[A-Z0-9-]{2,24}$/.test(registration)) {
      setVehicleFeedback('Enter a valid vehicle registration. Use letters, digits or hyphens.');
      return;
    }
    if (!name) {
      setVehicleFeedback('Enter a vehicle name.');
      return;
    }
    void run(async () => {
      setVehicleFeedback('Registering vehicle…');
      try {
        await client.request('/operations/vehicles', { body: { registration, name, fleetType: form.fleetType } });
        if (mounted.current) {
          setForm({ registration: '', name: '', fleetType: 'own' });
          setVehicleFeedback(`Vehicle registered: ${registration}.`);
        }
      } catch (cause) {
        if (mounted.current) setVehicleFeedback(cause instanceof Error ? cause.message : 'Vehicle registration failed.');
      }
    });
  }
  const availableDrivers = drivers.filter(driver => driver.status === 'available');
  const livePoints = bookings.flatMap(booking => {
    const point = booking.location;
    if (!point || terminal.has(booking.status)) return [];
    const age = Date.now() - Date.parse(point.receivedAt ?? point.capturedAt);
    if (age < 0 || age > 120000 || !Number.isFinite(age)
      || !Number.isFinite(point.lat) || Math.abs(point.lat) > 90
      || !Number.isFinite(point.lng) || Math.abs(point.lng) > 180) return [];
    return [{ referenceCode: booking.referenceCode, lat: point.lat, lng: point.lng }];
  });
  const queue = [...bookings].sort((a, b) => Number(b.status === 'pending') - Number(a.status === 'pending'));

  function assign(booking: Booking) {
    const driver = availableDrivers.find(item => item.id === selection[booking.id]);
    if (!driver) return;
    void run(async () => {
      setAssignmentFeedback({ id: booking.id, text: booking.assignment ? 'Reassigning driver…' : 'Assigning driver…' });
      try {
        const { booking: assigned } = await client.request<{ booking: Booking }>(`/operations/bookings/${booking.id}/assignment`, {
          body: { driverId: driver.id, expectedVersion: booking.version },
          key: `assign:${booking.id}:${booking.version}:${driver.id}`,
        });
        if (mounted.current) {
          sequence.current++;
          setBookings(list => list.map(item => item.id === assigned.id && item.version <= assigned.version ? assigned : item));
          setAssignmentFeedback({ id: booking.id, text: `Assigned to ${driver.name}.` });
        }
      } catch (cause) {
        if (mounted.current) setAssignmentFeedback({ id: booking.id, text: cause instanceof Error ? cause.message : 'Assignment failed.' });
      }
    });
  }

  return <div className="lv-operations">
    <nav className="lv-operations-nav" aria-label="Dispatch">
      <img src="/brand/lv-logo-header.svg" alt="LV Transport" />
      <button aria-current={section === 'reservations' ? 'page' : undefined} onClick={() => setSection('reservations')}>Reservations</button>
      <button aria-current={section === 'vehicles' ? 'page' : undefined} onClick={() => setSection('vehicles')}>Vehicles</button>
      <button aria-current={section === 'drivers' ? 'page' : undefined} onClick={() => setSection('drivers')}>Drivers</button>
    </nav>
    <div className="lv-operations-body">
    <header><h2 className="text-xl">Bookings and dispatch</h2><p>Last loaded: {updated || 'Not loaded'}</p>
      <button disabled={busy} onClick={() => void run(refresh)}>Refresh</button></header>
    {error && <p role="alert">{error}</p>}
    <dl className="lv-operations-metrics">
      <div><dt>Pending reservations</dt><dd>{updated ? bookings.filter(booking => booking.status === 'pending').length : '—'}</dd></div>
      <div><dt>Available drivers</dt><dd>{updated ? availableDrivers.length : '—'}</dd></div>
      <div><dt>Registered vehicles</dt><dd>{updated ? vehicles.length : '—'}</dd></div>
    </dl>
    {section === 'reservations' && <details className="lv-operations-panel lv-dispatch-map">
      <summary>Live fleet map</summary>
      <FounderOperationsMap points={livePoints} caption={livePoints.length
        ? `${livePoints.length} fresh shared positions` : 'No fresh shared positions.'} />
    </details>}
    <section hidden={section !== 'vehicles'} className="lv-operations-panel"><h2 className="text-xl">Vehicles</h2>
      <form onSubmit={registerVehicle} noValidate className="my-3 flex flex-wrap gap-3">
        <label>Registration <input className="bg-zinc-800 p-2" required maxLength={24} value={form.registration} onChange={e => setForm({ ...form, registration: e.target.value })} /></label>
        <label>Vehicle <input className="bg-zinc-800 p-2" required maxLength={100} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label>Fleet <select className="bg-zinc-800 p-2" value={form.fleetType} onChange={e => setForm({ ...form, fleetType: e.target.value })}>
          <option value="own">Own fleet</option><option value="external">External</option></select></label>
        <button disabled={busy} type="submit" className="rounded bg-amber-400 px-4 py-2 font-semibold text-black disabled:opacity-50">Register vehicle</button>
      </form>
      {vehicleFeedback && <p role="status">{vehicleFeedback}</p>}
      {vehicles.length ? <ul>{vehicles.map(vehicle => <li key={vehicle.id}>{vehicle.registration} · {vehicle.name} · {vehicle.fleetType}</li>)}</ul> : updated ? <p>No vehicles registered.</p> : <p>Vehicle data has not loaded yet.</p>}
    </section>
    <section hidden={section !== 'drivers'} className="lv-operations-panel"><h2 className="text-xl">Drivers</h2>
      {drivers.length ? <ul>{drivers.map(driver => <li key={driver.id}>{driver.name} · {driver.status} · Last seen {new Date(driver.lastSeenAt).toLocaleString()}</li>)}</ul> : updated ? <p>No authorized driver has reported availability yet.</p> : <p>Driver data has not loaded yet.</p>}
    </section>
    <section hidden={section !== 'reservations'} className="lv-operations-panel space-y-4"><h2 className="text-xl">Reservations</h2>
      {updated && !bookings.length && <p>No bookings loaded.</p>}
      {queue.map(booking => <article className="rounded border border-amber-400/30 p-4" key={booking.id}>
        <h3>{booking.referenceCode} · {booking.status}</h3>
        <p>{booking.customerName} · {new Date(booking.scheduleAt).toLocaleString()}</p>
        <p>{booking.pickup} → {booking.destination}</p>
        {booking.customerPhone && <p><a href={`tel:${booking.customerPhone}`}>{booking.customerPhone}</a></p>}
        {booking.customerEmail && <p><a href={`mailto:${encodeURIComponent(booking.customerEmail)}`}>{booking.customerEmail}</a></p>}
        {booking.notes && <p>{booking.notes}</p>}
        {booking.location && <p>Driver-reported location ({new Date(booking.location.capturedAt).toLocaleTimeString()}):
          {' '}{booking.location.lat.toFixed(5)}, {booking.location.lng.toFixed(5)}
        </p>}
        {booking.assignment && <p>Driver: {drivers.find(d => d.id === booking.assignment?.driverId)?.name ?? booking.assignment.driverId} · Vehicle: {vehicles.find(v => v.id === booking.assignment?.vehicleId)?.registration ?? booking.assignment.vehicleId}</p>}
        {((booking.status === 'pending' && !booking.assignment) || (booking.status === 'assigned' && booking.assignment)) && (
          availableDrivers.length ? <div className="lv-assignment-controls">
            <select aria-label={`Driver for ${booking.referenceCode}`} className="bg-zinc-800 p-2" value={selection[booking.id] ?? ''} onChange={e => setSelection({ ...selection, [booking.id]: e.target.value })}>
              <option value="">Select available driver</option>
              {availableDrivers.map(driver => <option key={driver.id} value={driver.id}>{driver.name} · {vehicles.find(v => v.id === driver.vehicleId)?.registration}</option>)}
            </select>
            <button type="button" disabled={busy || !availableDrivers.some(driver => driver.id === selection[booking.id])} onClick={() => assign(booking)}>{booking.assignment ? 'Reassign driver' : 'Assign driver'}</button>
          </div> : <p>No drivers are currently available for assignment.</p>
        )}
        {booking.status === 'assigned' && <p>Waiting for the driver to accept.</p>}
        {assignmentFeedback?.id === booking.id && <p role="status">{assignmentFeedback.text}</p>}
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
    </div>
  </div>;
}

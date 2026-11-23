import { createDriverGpsService } from '../modules/tracking/services/driver-gps.service';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { VerifiedOperationsClient } from '@lvtransport/auth';

type Booking = { id: string; referenceCode: string; pickup: string; destination: string;
  customerName?: string; customerPhone?: string; notes?: string; scheduleAt: string; status: string; version: number; assignment: { vehicleId: string } | null };
type Driver = { vehicleId: string; availability: string; status: string };
type Vehicle = { id: string; registration: string; name: string };
const next: Record<string, { status: string; label: string }> = {
  assigned: { status: 'accepted', label: 'Accepteer rit' }, accepted: { status: 'en_route', label: 'Onderweg naar ophalen' },
  en_route: { status: 'arrived', label: 'Aangekomen' }, arrived: { status: 'in_progress', label: 'Start rit' },
  in_progress: { status: 'completed', label: 'Rit afronden' },
};
const terminal = new Set(['completed', 'cancelled', 'failed']);

export function DriverOperations({ client }: { client: VerifiedOperationsClient }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleId, setVehicleId] = useState('');
  const [available, setAvailable] = useState(false);
  const [confirmedVehicle, setConfirmedVehicle] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [loadedAt, setLoadedAt] = useState('');
  const [gps, setGps] = useState<{ bookingId: string; sessionId: string } | null>(null);
  const gpsService = useMemo(() => createDriverGpsService({ minUpdateMs: 8000, minDistanceMeters: 25 }), []);
  const pending = useRef(false), alive = useRef(true), sequence = useRef(0);
  const refresh = useCallback(async () => {
    const attempt = ++sequence.current;
    const [b, v, d] = await Promise.all([
      client.request<{ bookings: Booking[] }>('/operations/bookings'),
      client.request<{ vehicles: Vehicle[] }>('/operations/vehicles'),
      client.request<{ driver: Driver | null }>('/operations/drivers/me'),
    ]);
    if (!alive.current || attempt !== sequence.current) return;
    setBookings(b.bookings); setVehicles(v.vehicles);
    setAvailable(Boolean(d.driver && d.driver.status !== 'unknown' && d.driver.availability === 'available'));
    setConfirmedVehicle(d.driver?.vehicleId ?? '');
    setVehicleId(current => d.driver?.availability === 'available' ? d.driver.vehicleId : current || d.driver?.vehicleId || '');
    setLoadedAt(new Date().toLocaleTimeString());
  }, [client]);
  useEffect(() => {
    alive.current = true;
    const update = () => { void refresh().catch(() => { if (alive.current) setError('Ritgegevens konden niet worden vernieuwd. Controleer de verbinding.'); }); };
    update(); const timer = setInterval(update, 15000);
    return () => { alive.current = false; clearInterval(timer); };
  }, [refresh]);
  useEffect(() => {
    if (!available || !confirmedVehicle) return;
    const timer = setInterval(() => {
      void client.request('/operations/drivers/me/heartbeat', { body: { vehicleId: confirmedVehicle } })
        .catch(() => { if (alive.current) { setAvailable(false); setError('Beschikbaarheid kon niet worden bevestigd. Meld u opnieuw beschikbaar.'); } });
    }, 30000);
    return () => clearInterval(timer);
  }, [client, available, confirmedVehicle]);
  async function run(work: () => Promise<unknown>) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError('');
    try {
      await work();
      await refresh().catch(() => { if (alive.current) setError('De lijst kon niet worden vernieuwd. Probeer opnieuw te vernieuwen.'); });
    }
    catch (cause) { if (alive.current) setError(cause instanceof Error ? cause.message : 'Actie mislukt.'); }
    finally { pending.current = false; if (alive.current) setBusy(false); }
  }
  async function transition(booking: Booking, status: string, keyPrefix = 'driver') {
    const { booking: updated } = await client.request<{ booking: Booking }>(`/operations/bookings/${booking.id}/status`, {
      body: { status, expectedVersion: booking.version },
      key: keyPrefix === 'reject' ? `reject:${booking.id}:${booking.version}` : `driver:${booking.id}:${booking.version}:${status}`,
    });
    if (!alive.current) return;
    sequence.current++;
    setBookings(list => list.map(item => item.id === updated.id && item.version <= updated.version ? updated : item));
  }
  const activeBooking = bookings.find(booking => !terminal.has(booking.status));
  const selectedVehicle = activeBooking?.assignment?.vehicleId || vehicleId;
  useEffect(() => {
    if (!gps) return;
    if (gps.bookingId !== activeBooking?.id) { setGps(null); return; }
    let sharing = true;
    gpsService.start(position => {
      if (!sharing) return;
      void client.request(`/operations/bookings/${gps.bookingId}/location`, { body: { sessionId: gps.sessionId, position } })
        .catch(() => { if (alive.current && sharing) { setGps(null); setError('Locatie kon niet worden bevestigd. Delen is gestopt.'); } });
    }, message => { if (alive.current && sharing) { setGps(null); setError(message); } });
    return () => {
      sharing = false; gpsService.stop();
      void client.request(`/operations/bookings/${gps.bookingId}/location`, { body: { sharing: false, sessionId: gps.sessionId } }).catch(() => {});
    };
  }, [client, gps, activeBooking?.id, gpsService]);

  return <div className="lv-driver-cockpit space-y-6">
    <header><h2 className="text-xl">Mijn ritten</h2><p>Laatst geladen: {loadedAt || 'Nog niet geladen'}</p>
      <button disabled={busy} onClick={() => void run(refresh)}>Vernieuwen</button></header>
    {error && <p role="alert">{error}</p>}
    {loadedAt && !bookings.length && <p>Er zijn geen ritten aan uw account toegewezen.</p>}
    {activeBooking && <section className="rounded border border-amber-400/30 p-4">
      <p>Locatie delen met de administratie en de geverifieerde klant van deze rit.</p>
      <button disabled={busy} onClick={() => void run(async () => {
        if (gps) { const stopping = gps; setGps(null); gpsService.stop();
          await client.request(`/operations/bookings/${stopping.bookingId}/location`, { body: { sharing: false, sessionId: stopping.sessionId } }); }
        else {
          const result = await client.request<{ sessionId: string }>(`/operations/bookings/${activeBooking.id}/location`, { body: { sharing: true } });
          if (alive.current) setGps({ bookingId: activeBooking.id, sessionId: result.sessionId });
        }
      })}>{gps ? 'Locatie delen stoppen' : 'Locatie delen starten'}</button>
    </section>}
    {[...bookings].sort((a, b) => Number(b.id === activeBooking?.id) - Number(a.id === activeBooking?.id)).map(booking =>
      <article key={booking.id} className="lv-operations-panel space-y-3">
      {booking.id === activeBooking?.id && <h2>Huidige rit</h2>}
      <h3>{booking.referenceCode} · {booking.status}</h3>
      <p>{new Date(booking.scheduleAt).toLocaleString()}</p>
      <p>{booking.pickup} → {booking.destination}</p>
      {booking.id === activeBooking?.id && <a className="btn-primary inline-flex" target="_blank" rel="noreferrer"
        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(booking.status === 'in_progress' ? booking.destination : booking.pickup)}`}>
        Navigeren
      </a>}
      {booking.customerName && <p>{booking.customerName}</p>}
      {booking.customerPhone && <p><a href={`tel:${booking.customerPhone}`}>{booking.customerPhone}</a></p>}
      {booking.notes && <p>{booking.notes}</p>}
      <p>Voertuig: {vehicles.find(vehicle => vehicle.id === booking.assignment?.vehicleId)?.registration ?? booking.assignment?.vehicleId}</p>
      {booking.status === 'assigned' && <p>Er is een rit aan u toegewezen. Accepteer de rit om verder te gaan.</p>}
      {next[booking.status] && <button type="button" className="btn-primary" disabled={busy} onClick={() => void run(() => transition(booking, next[booking.status].status))}>{next[booking.status].label}</button>}
      {booking.status === 'assigned' && <button disabled={busy} onClick={() => {
        if (window.confirm('Deze toewijzing weigeren? De reservering wordt geannuleerd volgens de huidige ritstatusregels.')) {
          void run(() => transition(booking, 'cancelled', 'reject'));
        }
      }}>Weigeren</button>}
    </article>)}
    <section className="lv-operations-panel">
      <label>Voertuig <select className="bg-zinc-800 p-2" disabled={busy || Boolean(activeBooking) || available} value={selectedVehicle} onChange={e => setVehicleId(e.target.value)}>
        <option value="">Selecteer geregistreerd voertuig</option>
        {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.id}>{vehicle.registration} · {vehicle.name}</option>)}
      </select></label>
      <p>Beschikbaarheid: {available ? 'Bevestigd' : 'Niet aangemeld'}</p>
      <button disabled={busy || !selectedVehicle} onClick={() => void run(async () => {
        const availability = available ? 'unavailable' : 'available';
        await client.request('/operations/drivers/me/presence', { body: { availability, vehicleId: selectedVehicle } });
        if (alive.current) { setAvailable(availability === 'available'); setConfirmedVehicle(selectedVehicle); }
      })}>{available ? 'Niet beschikbaar melden' : 'Beschikbaar melden'}</button>
      {loadedAt && !vehicles.length && <p>Er zijn nog geen voertuigen geregistreerd door de administratie.</p>}
    </section>
  </div>;
}

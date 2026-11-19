import { useEffect, useRef, useState } from 'react';
import { createLVTransportFirebaseProvider, type VerifiedOperationsClient } from '@lvtransport/auth';
import { GoogleLoginBoundary } from '../../../admin/src/modules/auth/components/GoogleLoginBoundary';

type Connection = (client: VerifiedOperationsClient | null) => void;
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; status: string; version: number; location?: { lat: number; lng: number; capturedAt: string } | null; assignment?: { driverName?: string; vehicleRegistration?: string } | null };
const createProvider = () => createLVTransportFirebaseProvider('customer');

function CustomerBookings({ client, onConnection, revision }: { client: VerifiedOperationsClient; onConnection: Connection; revision: number }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const pending = useRef(false), mounted = useRef(true), sequence = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { onConnection(client); return () => onConnection(null); }, [client, onConnection]);
  useEffect(() => {
    let alive = true;
    async function refresh() {
      const attempt = ++sequence.current;
      try {
        const result = await client.request<{ bookings: Booking[] }>('/customer/bookings');
        if (alive && attempt === sequence.current) { setBookings(result.bookings); setLoaded(true); setError(''); }
      } catch { if (alive) setError('Uw reserveringen konden niet worden geladen.'); }
    }
    void refresh(); const timer = setInterval(() => void refresh(), 15000);
    return () => { alive = false; clearInterval(timer); };
  }, [client, revision]);
  async function cancel(booking: Booking) {
    if (pending.current || !window.confirm('Deze aanvraag annuleren?')) return;
    pending.current = true; setBusy(true); setError('');
    try {
      await client.request(`/customer/bookings/${booking.id}/cancel`, {
        body: { expectedVersion: booking.version }, key: `customer-cancel:${booking.id}:${booking.version}`,
      });
      const attempt = ++sequence.current;
      const result = await client.request<{ bookings: Booking[] }>('/customer/bookings');
      if (mounted.current && attempt === sequence.current) setBookings(result.bookings);
    } catch (cause) { if (mounted.current) setError(cause instanceof Error ? cause.message : 'Annuleren mislukt.'); }
    finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  return <section className="space-y-3">
    <p>Nieuwe aanvragen via het formulier worden nu aan uw geverifieerde account gekoppeld.</p>
    <p>Eerdere anonieme aanvragen blijven beschikbaar via hun referentiecode.</p>
    {!loaded && !error && <p role="status">Uw reserveringen worden geladen…</p>}
    {error && <p role="alert">{error}</p>}
    {loaded && !bookings.length && !error && <p>Er zijn nog geen reserveringen aan dit account gekoppeld.</p>}
    {bookings.map(booking => <article className="rounded border border-amber-400/30 p-4" key={booking.id}>
      <h3>{booking.referenceCode} · {booking.status}</h3>
      <p>{booking.pickup} → {booking.destination}</p><p>{new Date(booking.scheduleAt).toLocaleString()}</p>
      {booking.assignment && <p>{booking.assignment.driverName} · {booking.assignment.vehicleRegistration}</p>}
      {booking.location && <p>Door chauffeur gemelde positie ({new Date(booking.location.capturedAt).toLocaleTimeString()}):
        {' '}<a target="_blank" rel="noreferrer" href={`https://www.google.com/maps?q=${encodeURIComponent(booking.location.lat + ',' + booking.location.lng)}`}>Kaart openen</a>
      </p>}
      {booking.status === 'pending' && <button disabled={busy} onClick={() => void cancel(booking)}>Annuleer aanvraag</button>}
    </article>)}
  </section>;
}
export default function CustomerAccount({ onConnection, revision }: { onConnection: Connection; revision: number }) {
  return <GoogleLoginBoundary title="Mijn reserveringen" expectedRole="customer" createProvider={createProvider}
    renderOperations={({ client }) => <CustomerBookings client={client} onConnection={onConnection} revision={revision} />} />;
}

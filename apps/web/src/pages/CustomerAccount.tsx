import { bookingTimeZone } from '../modules/moni/services/booking-time';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createLVTransportFirebaseProvider, type VerifiedOperationsClient } from '@lvtransport/auth';
import { GoogleLoginBoundary } from '../../../admin/src/modules/auth/components/GoogleLoginBoundary';
import { StagingCheckoutPayment } from './StagingCheckoutPayment';

export type CustomerConnection = { client: VerifiedOperationsClient; userId: string };
type Connection = (connection: CustomerConnection | null) => void;
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; scheduleAt: string; status: string; version: number; location?: { lat: number; lng: number; capturedAt: string } | null; assignment?: { driverName?: string; vehicleRegistration?: string } | null };
const createProvider = () => createLVTransportFirebaseProvider('customer');
const checkoutEnabled = import.meta.env.MODE === 'staging' && import.meta.env.VITE_LVTP_STAGING_CHECKOUT === 'true';

function CustomerBookings({ client, userId, onConnection, revision }: { client: VerifiedOperationsClient; userId: string; onConnection: Connection; revision: number }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [cancellation, setCancellation] = useState<{ message: string; confirmed: boolean } | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false), mounted = useRef(true), sequence = useRef(0);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  useEffect(() => { onConnection({ client, userId }); return () => onConnection(null); }, [client, userId, onConnection]);
  const refresh = useCallback(async () => {
    const attempt = ++sequence.current;
    try {
      const result = await client.request<{ bookings: Booking[] }>('/customer/bookings');
      if (mounted.current && attempt === sequence.current) {
        setBookings(result.bookings); setLoaded(true); setError('');
      }
    } catch {
      if (mounted.current && attempt === sequence.current) {
        setError('Uw reserveringen konden niet worden geladen.');
      }
    }
  }, [client]);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 15000);
    return () => { sequence.current++; clearInterval(timer); };
  }, [refresh, revision]);
  async function cancel(booking: Booking) {
    if (pending.current || !window.confirm('Deze aanvraag annuleren?')) return;
    pending.current = true; setBusy(true); setCancellation(null);
    try {
      const { booking: confirmed } = await client.request<{ booking: Pick<Booking, 'id' | 'status' | 'version'> }>(
        `/customer/bookings/${booking.id}/cancel`,
        { body: { expectedVersion: booking.version }, key: `customer-cancel:${booking.id}:${booking.version}` },
      );
      if (!mounted.current) return;
      if (confirmed?.id !== booking.id || confirmed.status !== 'cancelled'
        || !Number.isInteger(confirmed.version) || confirmed.version <= booking.version) {
        throw new Error('Annulering kon niet worden bevestigd.');
      }
      sequence.current++;
      setBookings(list => list.map(item => item.id === confirmed.id && item.version <= confirmed.version
        ? { ...item, status: confirmed.status, version: confirmed.version, location: null } : item));
      setCancellation({ message: `Aanvraag ${booking.referenceCode} is geannuleerd.`, confirmed: true });
      void refresh();
    } catch (cause) {
      if (mounted.current) setCancellation({ message: cause instanceof Error ? cause.message : 'Annuleren mislukt.', confirmed: false });
    } finally { pending.current = false; if (mounted.current) setBusy(false); }
  }
  return <section className="space-y-3">
    <p>Nieuwe aanvragen via het formulier worden nu aan uw geverifieerde account gekoppeld.</p>
    <p>Eerdere anonieme aanvragen blijven beschikbaar via hun referentiecode.</p>
    {!loaded && !error && <p role="status">Uw reserveringen worden geladen…</p>}
    {error && <p role="alert">{error}</p>}
    {cancellation && <p role={cancellation.confirmed ? 'status' : 'alert'}>{cancellation.message}</p>}
    {loaded && !bookings.length && !error && <p>Er zijn nog geen reserveringen aan dit account gekoppeld.</p>}
    {bookings.map(booking => <article className="rounded border border-amber-400/30 p-4" key={booking.id}>
      <h3>{booking.referenceCode} · {booking.status}</h3>
      <p>{booking.pickup} → {booking.destination}</p><p>{new Date(booking.scheduleAt).toLocaleString('nl-BE', { timeZone: bookingTimeZone })}</p>
      {booking.assignment && <p>{booking.assignment.driverName} · {booking.assignment.vehicleRegistration}</p>}
      {booking.location && <p>Door chauffeur gemelde positie ({new Date(booking.location.capturedAt).toLocaleTimeString()}):
        {' '}{booking.location.lat.toFixed(5)}, {booking.location.lng.toFixed(5)}
      </p>}
      {booking.status === 'pending' && <button disabled={busy} onClick={() => void cancel(booking)}>Annuleer aanvraag</button>}
      {checkoutEnabled && <StagingCheckoutPayment id={booking.id} client={client}
        showOnReturn={new URLSearchParams(window.location.search).get('checkout') === booking.id} />}
    </article>)}
  </section>;
}
export default function CustomerAccount({ onConnection, revision, suggestedEmail }: { onConnection: Connection; revision: number; suggestedEmail: string }) {
  return <GoogleLoginBoundary title="Mijn reserveringen" expectedRole="customer" createProvider={createProvider} suggestedEmail={suggestedEmail}
    renderOperations={({ client, identity }) => <CustomerBookings client={client} userId={identity.userId} onConnection={onConnection} revision={revision} />} />;
}

import { useEffect, useState } from 'react';
import {
  dispatchMvpStore,
  getDispatchSnapshot,
  type DispatchBookingStatus,
  type DriverAvailabilityStatus,
} from '@lvtransport/realtime';

const DRIVER_ID = 'DRV-100';
const nextStatuses: DispatchBookingStatus[] = ['driver_arriving', 'passenger_onboard', 'completed'];

export function App() {
  const [state, setState] = useState(getDispatchSnapshot());
  const [availability, setAvailability] = useState<DriverAvailabilityStatus>('available');

  useEffect(() => {
    dispatchMvpStore.setDriverAvailability(DRIVER_ID, availability);
  }, [availability]);

  useEffect(() => dispatchMvpStore.subscribe(setState), []);

  const activeRide = dispatchMvpStore.getDriverActiveRide(DRIVER_ID);

  return (
    <main className="min-h-screen bg-zinc-950 p-6 text-zinc-100">
      <h1 className="text-2xl font-bold text-amber-300">Driver Console (Dispatch MVP)</h1>

      <section className="mt-5 rounded-2xl border border-zinc-700 p-4">
        <h2 className="text-amber-200">Availability</h2>
        <select
          className="mt-2 rounded bg-zinc-800 p-2"
          value={availability}
          onChange={(e) => setAvailability(e.target.value as DriverAvailabilityStatus)}
        >
          <option value="offline">offline</option>
          <option value="available">available</option>
          <option value="on_assignment">on_assignment</option>
        </select>
      </section>

      <section className="mt-5 rounded-2xl border border-zinc-700 p-4">
        <h2 className="text-amber-200">Assigned Ride</h2>
        {activeRide ? (
          <div className="mt-2 space-y-3">
            <p>{activeRide.bookingId} • {activeRide.status}</p>
            {activeRide.status === 'assigned' && (
              <div className="flex gap-2">
                <button className="rounded bg-amber-500 px-3 py-2 text-zinc-900" onClick={() => dispatchMvpStore.driverRespond(activeRide.bookingId, DRIVER_ID, 'accept')}>Accept Ride</button>
                <button className="rounded border border-zinc-600 px-3 py-2" onClick={() => dispatchMvpStore.driverRespond(activeRide.bookingId, DRIVER_ID, 'reject')}>Reject Ride</button>
              </div>
            )}
            {activeRide.status === 'driver_accepted' && (
              <div className="flex gap-2">{nextStatuses.map((status) => <button key={status} className="rounded border border-zinc-600 px-3 py-1" onClick={() => dispatchMvpStore.updateRideStatus(activeRide.bookingId, status, DRIVER_ID)}>{status}</button>)}</div>
            )}
          </div>
        ) : <p className="mt-2 text-zinc-400">No active assignment.</p>}
      </section>

      <section className="mt-5 rounded-2xl border border-zinc-700 p-4">
        <h2 className="text-amber-200">Realtime Feed</h2>
        <ul className="mt-2 space-y-2 text-sm">{state.bookings.map((b) => <li key={b.bookingId}>{b.bookingId}: {b.status}</li>)}</ul>
      </section>
    </main>
  );
}

import { useEffect, useMemo, useState } from 'react';

type RuntimeState = 'Healthy' | 'Warning' | 'Degraded' | 'Critical';
type SyncState = 'live' | 'recovering' | 'degraded';
type LifecycleStage = 'booking_created' | 'driver_assigned' | 'en_route' | 'airport_arrival' | 'pickup_waiting' | 'passenger_onboard' | 'destination_sync' | 'payment_completed' | 'ride_closed';

type Booking = { id: string; status: string };
type Driver = { driverId: string; state: string };
type Incident = { code: string; severity: string; message: string };

type SimRide = {
  id: string;
  ref: string;
  stage: LifecycleStage;
  etaMin: number;
  gpsFreshnessSec: number;
  airportRisk: RuntimeState;
  paymentState: 'clear' | 'retrying' | 'degraded';
};

type AttentionItem = { title: string; state: RuntimeState; reason: string };

type LeoExecutiveSummary = {
  headline: string;
  priority: string;
  report: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const LIFECYCLE: LifecycleStage[] = ['booking_created', 'driver_assigned', 'en_route', 'airport_arrival', 'pickup_waiting', 'passenger_onboard', 'destination_sync', 'payment_completed', 'ride_closed'];
const stateTone: Record<RuntimeState, string> = {
  Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
  Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100',
  Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100'
};
const severityRank: Record<RuntimeState, number> = { Healthy: 0, Warning: 1, Degraded: 2, Critical: 3 };
const mergeState = (...states: RuntimeState[]): RuntimeState => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy');

const simulatedRidesSeed: SimRide[] = [
  { id: 'airport-01', ref: 'LV-AIR-401', stage: 'driver_assigned', etaMin: 14, gpsFreshnessSec: 8, airportRisk: 'Healthy', paymentState: 'clear' },
  { id: 'airport-02', ref: 'LV-AIR-402', stage: 'en_route', etaMin: 22, gpsFreshnessSec: 9, airportRisk: 'Warning', paymentState: 'clear' },
  { id: 'airport-03', ref: 'LV-AIR-403', stage: 'airport_arrival', etaMin: 7, gpsFreshnessSec: 11, airportRisk: 'Healthy', paymentState: 'retrying' }
];

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sync, setSync] = useState<SyncState>('recovering');
  const [simRides, setSimRides] = useState<SimRide[]>(simulatedRidesSeed);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingRes, driverRes, incidentRes] = await Promise.all([
          fetch(`${API_BASE}/admin/bookings`),
          fetch(`${API_BASE}/drivers/live-states`),
          fetch(`${API_BASE}/operations/incidents`)
        ]);
        const b = await bookingRes.json();
        const d = await driverRes.json();
        const i = await incidentRes.json();
        setBookings(Array.isArray(b.bookings) ? b.bookings : []);
        setDrivers(Array.isArray(d.drivers) ? d.drivers : []);
        setIncidents(Array.isArray(i.incidents) ? i.incidents : []);
        setSync('live');
      } catch {
        setSync('degraded');
      }
    };

    load();
    const poll = setInterval(load, 12000);
    return () => clearInterval(poll);
  }, []);

  useEffect(() => {
    const lifecycleTick = setInterval(() => {
      setSimRides((current) => current.map((ride, index) => {
        const stageIndex = LIFECYCLE.indexOf(ride.stage);
        const nextStage = LIFECYCLE[(stageIndex + 1) % LIFECYCLE.length];
        const reconnectDrift = stageIndex % 4 === 1 ? 6 : 0;
        const staleGps = stageIndex % 5 === 2 ? 18 : 0;
        return {
          ...ride,
          stage: nextStage,
          etaMin: Math.max(4, nextStage === 'pickup_waiting' ? ride.etaMin + 3 : ride.etaMin - 2 + reconnectDrift / 6),
          gpsFreshnessSec: Math.max(6, 8 + staleGps),
          airportRisk: nextStage === 'pickup_waiting' || reconnectDrift > 0 ? 'Warning' : nextStage === 'destination_sync' ? 'Degraded' : 'Healthy',
          paymentState: nextStage === 'payment_completed' && index === 2 ? 'retrying' : nextStage === 'ride_closed' ? 'clear' : ride.paymentState
        };
      }));
      setSync((prev) => (prev === 'live' ? 'recovering' : 'live'));
    }, 4500);

    return () => clearInterval(lifecycleTick);
  }, []);

  const pendingRides = useMemo(() => bookings.filter((booking) => ['pending', 'searching_driver', 'quote_pending'].includes(booking.status)).length, [bookings]);
  const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)).length, [bookings]);
  const onlineDrivers = useMemo(() => drivers.filter((driver) => ['online', 'active'].includes(driver.state)).length, [drivers]);

  const founderAttention = useMemo<AttentionItem[]>(() => {
    const attention: AttentionItem[] = [];
    simRides.forEach((ride) => {
      if (ride.gpsFreshnessSec > 20) attention.push({ title: `GPS drift · ${ride.ref}`, state: 'Warning', reason: `${ride.gpsFreshnessSec}s freshness; monitor ETA reliability.` });
      if (ride.stage === 'pickup_waiting') attention.push({ title: `Airport pickup · ${ride.ref}`, state: 'Warning', reason: 'Terminal coordination waiting, prepare customer reassurance.' });
      if (ride.paymentState !== 'clear') attention.push({ title: `Payment retry · ${ride.ref}`, state: 'Degraded', reason: 'Retry loop active; trust closure messaging required.' });
    });
    if (sync !== 'live') attention.push({ title: 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' });
    return attention.slice(0, 4);
  }, [simRides, sync]);

  const runtimeState = useMemo<RuntimeState>(() => mergeState(...founderAttention.map((a) => a.state), incidents.length > 2 ? 'Warning' : 'Healthy'), [founderAttention, incidents.length]);
  const trustLevel = runtimeState === 'Healthy' ? 'High' : runtimeState === 'Warning' ? 'Guarded' : runtimeState === 'Degraded' ? 'Stressed' : 'Critical';

  const leoSummary = useMemo<LeoExecutiveSummary>(() => {
    const top = founderAttention[0];
    if (!top) {
      return {
        headline: 'Leo IA · Operations stable',
        priority: 'No anomaly requires founder escalation right now.',
        report: 'All active simulations remain inside controlled thresholds. Continue routine monitoring.'
      };
    }

    return {
      headline: `Leo IA · ${top.state} anomaly observed`,
      priority: `Priority: ${top.title}.`,
      report: `Recommendation: resolve ${top.title.toLowerCase()} first, then verify airport coordination and payment confidence.`
    };
  }, [founderAttention]);

  return <main className="min-h-screen bg-lvtp-obsidian p-4 text-zinc-100 sm:p-5">
    <div className="relative mx-auto max-w-6xl space-y-4">
      <header className="lvtp-shell rounded-3xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-10 w-auto rounded-md border border-amber-400/30 bg-black p-1" />
            <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Founder Cockpit</p><h1 className="text-lg font-semibold text-amber-200 sm:text-xl">Realtime Operations</h1></div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`}>{runtimeState}</span>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Active rides</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{activeRides || simRides.length}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Pending rides</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{pendingRides}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Drivers online</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{onlineDrivers}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">System trust level</p><p className="mt-2 text-lg font-semibold text-amber-100">{trustLevel}</p><p className="mt-1 text-xs text-zinc-400">Sync: {sync}</p></article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="lvtp-card xl:col-span-2 rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Ride lifecycle visibility</h2>
          <div className="mt-3 space-y-3">{simRides.map((ride) => <div key={ride.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm text-zinc-100">{ride.ref}</p><span className="text-xs uppercase text-zinc-300">{ride.stage.replaceAll('_', ' ')}</span></div><div className="mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4"><p>ETA {ride.etaMin}m</p><p>GPS {ride.gpsFreshnessSec}s</p><p>Airport {ride.airportRisk}</p><p>Payment {ride.paymentState}</p></div></div>)}</div>
        </article>

        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Founder priorities</h2>
          <div className="mt-3 space-y-2">{founderAttention.length ? founderAttention.map((item) => <div key={item.title} className="rounded-xl border border-white/10 bg-black/25 p-3"><div className="flex justify-between"><p className="text-sm text-zinc-100">{item.title}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`}>{item.state}</span></div><p className="mt-1 text-xs text-zinc-300">{item.reason}</p></div>) : <p className="text-sm text-zinc-300">No founder actions required.</p>}</div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="lvtp-card rounded-2xl p-4 xl:col-span-2"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Leo IA executive summary</h2><p className="mt-3 text-sm text-zinc-100">{leoSummary.headline}</p><p className="mt-2 text-sm text-zinc-300">{leoSummary.priority}</p><p className="mt-2 text-sm text-zinc-300">{leoSummary.report}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Operational health</h2><ul className="mt-3 space-y-2 text-sm text-zinc-300"><li>Airport pickups waiting: {simRides.filter((r) => r.stage === 'pickup_waiting').length}</li><li>Payment retries: {simRides.filter((r) => r.paymentState !== 'clear').length}</li><li>Incidents observed: {incidents.length}</li><li>Moni reassurance need: {founderAttention.some((a) => a.title.startsWith('Airport pickup')) ? 'Elevated' : 'Normal'}</li></ul></article>
      </section>
    </div>
  </main>;
}

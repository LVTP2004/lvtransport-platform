import { useEffect, useMemo, useState } from 'react';

type RuntimeState = 'Healthy' | 'Warning' | 'Degraded' | 'Critical';

type Booking = {
  id: string;
  referenceCode?: string;
  code?: string;
  serviceType: string;
  status: string;
  updatedAt?: string;
  assignedDriverId?: string;
};

type Driver = { driverId: string; state: string; activeBookingId?: string; lastUpdatedAt?: string };
type Incident = { code: string; severity: string; message: string };

type PulseItem = {
  label: string;
  state: RuntimeState;
  detail: string;
};

type AttentionItem = {
  title: string;
  state: RuntimeState;
  reason: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const ACTIVE_STATUSES = ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'];

const stateTone: Record<RuntimeState, string> = {
  Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
  Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100',
  Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100'
};

const severityRank: Record<RuntimeState, number> = { Healthy: 0, Warning: 1, Degraded: 2, Critical: 3 };
const toRuntimeState = (severity: string): RuntimeState => {
  if (severity === 'critical' || severity === 'high') return 'Critical';
  if (severity === 'error' || severity === 'major') return 'Degraded';
  if (severity === 'warning' || severity === 'medium') return 'Warning';
  return 'Healthy';
};

const mergeState = (...states: RuntimeState[]): RuntimeState => {
  return states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy');
};

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sync, setSync] = useState<'live' | 'recovering' | 'degraded'>('recovering');

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
    const poll = setInterval(() => {
      setSync((prev) => (prev === 'degraded' ? 'recovering' : prev));
      load();
    }, 12000);

    return () => clearInterval(poll);
  }, []);

  const activeRides = useMemo(
    () => bookings.filter((booking) => ACTIVE_STATUSES.includes(booking.status)),
    [bookings]
  );

  const activeAirportRides = useMemo(
    () => activeRides.filter((booking) => booking.serviceType.toLowerCase().includes('airport')),
    [activeRides]
  );

  const delayedRides = useMemo(
    () => activeRides.filter((booking) => booking.status === 'arrived' || booking.status === 'assigned'),
    [activeRides]
  );

  const paymentSignals = useMemo(
    () => incidents.filter((incident) => /(payment|invoice|billing|sync mismatch)/i.test(incident.code + incident.message)),
    [incidents]
  );

  const reconnectSignals = useMemo(
    () => incidents.filter((incident) => /(reconnect|socket|sync|network)/i.test(incident.code + incident.message)),
    [incidents]
  );

  const gpsSignals = useMemo(
    () => incidents.filter((incident) => /(gps|location|eta)/i.test(incident.code + incident.message)),
    [incidents]
  );

  const airportSignals = useMemo(
    () => incidents.filter((incident) => /(airport|terminal|pickup|flight)/i.test(incident.code + incident.message)),
    [incidents]
  );

  const runtimeState = useMemo<RuntimeState>(() => {
    const incidentState = incidents.reduce<RuntimeState>((state, incident) => mergeState(state, toRuntimeState(incident.severity)), 'Healthy');
    const syncState: RuntimeState = sync === 'live' ? 'Healthy' : sync === 'recovering' ? 'Warning' : 'Degraded';
    return mergeState(incidentState, syncState);
  }, [incidents, sync]);

  const pulseItems = useMemo<PulseItem[]>(() => [
    { label: 'System health', state: runtimeState, detail: `${incidents.length} active incident signals` },
    { label: 'Realtime synchronization', state: sync === 'live' ? 'Healthy' : sync === 'recovering' ? 'Warning' : 'Degraded', detail: sync === 'live' ? 'Stream stable' : sync === 'recovering' ? 'Recovery in progress' : 'Dispatch continuity risk' },
    { label: 'Reconnect stability', state: reconnectSignals.length ? 'Warning' : 'Healthy', detail: reconnectSignals.length ? `${reconnectSignals.length} reconnect anomalies` : 'Connection continuity stable' },
    { label: 'GPS health', state: gpsSignals.length ? 'Warning' : 'Healthy', detail: gpsSignals.length ? `${gpsSignals.length} location confidence alerts` : 'Location confidence stable' },
    { label: 'Payment integrity', state: paymentSignals.length ? 'Degraded' : 'Healthy', detail: paymentSignals.length ? `${paymentSignals.length} trust anomalies require review` : 'No payment trust risk detected' },
    { label: 'Airport coordination', state: airportSignals.length || delayedRides.length ? 'Warning' : 'Healthy', detail: `${activeAirportRides.length} active pickups · ${airportSignals.length} airport warnings` },
    { label: 'Runtime degradation', state: runtimeState, detail: runtimeState === 'Healthy' ? 'No operational drag detected' : 'Operational drag observed across subsystems' }
  ], [runtimeState, incidents.length, sync, reconnectSignals.length, gpsSignals.length, paymentSignals.length, airportSignals.length, delayedRides.length, activeAirportRides.length]);

  const founderAttention = useMemo<AttentionItem[]>(() => {
    const items: AttentionItem[] = [];
    if (airportSignals.length || delayedRides.length > 1) items.push({ title: 'Airport operational risk', state: 'Warning', reason: `${airportSignals.length} warnings with ${delayedRides.length} rides at coordination risk` });
    if (paymentSignals.length) items.push({ title: 'Payment integrity failure', state: 'Degraded', reason: `${paymentSignals.length} anomalies can reduce customer trust` });
    if (reconnectSignals.length) items.push({ title: 'Reconnect instability', state: 'Warning', reason: `${reconnectSignals.length} reconnect issues may stale ride lifecycle` });
    if (runtimeState === 'Critical' || runtimeState === 'Degraded') items.push({ title: 'Runtime degradation', state: runtimeState, reason: 'Multiple subsystems need simplification and founder attention now' });
    return items.slice(0, 4);
  }, [airportSignals.length, delayedRides.length, paymentSignals.length, reconnectSignals.length, runtimeState]);

  return <main className="min-h-screen bg-lvtp-obsidian p-5 text-zinc-100">
    <div className="lvtp-network absolute inset-0 pointer-events-none opacity-40" />
    <div className="relative mx-auto max-w-7xl space-y-5">
      <header className="lvtp-shell rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" />
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Founder Control Tower · Operational Pulse</p>
              <h1 className="text-xl font-semibold text-amber-200">LV Transport Founder Dashboard</h1>
            </div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`}>{runtimeState}</span>
        </div>
        <p className="mt-3 text-sm text-zinc-300">Calm realtime visibility focused on trust risk, subsystem stability and immediate founder attention.</p>
      </header>

      <section className="lvtp-card rounded-2xl p-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Operational Pulse Center</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {pulseItems.map((item) => <article key={item.label} className="rounded-xl border border-white/10 bg-black/25 p-3"><div className="flex items-center justify-between gap-2"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">{item.label}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`}>{item.state}</span></div><p className="mt-2 text-sm text-zinc-200">{item.detail}</p></article>)}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="lvtp-card xl:col-span-2 rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Active Rides Panel</h2>
          <div className="mt-3 space-y-3">
            {activeRides.slice(0, 8).map((ride) => <div key={ride.id} className="rounded-xl border border-white/10 bg-black/25 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-medium text-zinc-100">{ride.referenceCode ?? ride.code ?? ride.id}</p><span className="rounded-full border border-zinc-600 px-2 py-0.5 text-xs uppercase text-zinc-300">{ride.status}</span></div><div className="mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4"><p>Driver state: {drivers.find((driver) => driver.driverId === ride.assignedDriverId)?.state ?? 'Awaiting'}</p><p>Ride lifecycle: {ride.status}</p><p>GPS confidence: {gpsSignals.length ? 'Monitored' : 'Stable'}</p><p>Operational alerts: {incidents.filter((incident) => incident.message.includes(ride.id)).length || 0}</p></div></div>)}
            {!activeRides.length && <p className="text-sm text-zinc-400">No active rides currently require attention.</p>}
          </div>
        </article>

        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Founder Attention Engine</h2>
          <div className="mt-3 space-y-2">
            {founderAttention.map((item) => <div key={item.title} className="rounded-xl border border-white/10 bg-black/25 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm text-zinc-100">{item.title}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`}>{item.state}</span></div><p className="mt-1 text-xs text-zinc-300">{item.reason}</p></div>)}
            {!founderAttention.length && <p className="text-sm text-emerald-200">No immediate founder interventions required now.</p>}
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Weakness-chain</h2>
          <ol className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>Weak LTE → reconnect delay</li>
            <li>Reconnect delay → stale GPS confidence</li>
            <li>Stale GPS → ETA drift near terminal</li>
            <li>ETA drift → airport coordination uncertainty</li>
            <li>Coordination uncertainty → customer stress risk</li>
          </ol>
        </article>

        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Airport Operations Center</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>Active pickups: {activeAirportRides.length}</li>
            <li>Airport risk level: {airportSignals.length ? 'Warning' : 'Healthy'}</li>
            <li>Pickup uncertainty: {delayedRides.length ? `${delayedRides.length} rides` : 'None detected'}</li>
            <li>Driver coordination: {drivers.length ? 'Live' : 'Fallback only'}</li>
          </ul>
        </article>

        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Payment Trust Center</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            <li>Failed or retry-required: {paymentSignals.length}</li>
            <li>Sync mismatch warnings: {paymentSignals.filter((incident) => /sync/i.test(incident.message + incident.code)).length}</li>
            <li>Pending unresolved anomalies: {paymentSignals.length}</li>
            <li>Trust posture: {paymentSignals.length ? 'Degraded' : 'Healthy'}</li>
          </ul>
        </article>
      </section>
    </div>
  </main>;
}

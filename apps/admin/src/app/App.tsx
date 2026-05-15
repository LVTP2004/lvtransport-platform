import { useEffect, useMemo, useState } from 'react';

type RuntimeState = 'Healthy' | 'Warning' | 'Degraded' | 'Critical';
type SyncState = 'live' | 'recovering' | 'degraded';
type LifecycleStage =
  | 'booking_created'
  | 'driver_assigned'
  | 'en_route'
  | 'airport_arrival'
  | 'pickup_waiting'
  | 'passenger_onboard'
  | 'destination_sync'
  | 'payment_completed'
  | 'ride_closed';

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
type SimAnomaly = { code: string; severity: RuntimeState; detail: string; emotionalImpact: string; subsystem: string };

type PulseItem = { label: string; state: RuntimeState; detail: string };
type AttentionItem = { title: string; state: RuntimeState; reason: string };

type SimRide = {
  id: string;
  ref: string;
  serviceType: string;
  stage: LifecycleStage;
  etaMin: number;
  gpsFreshnessSec: number;
  airportRisk: RuntimeState;
  paymentState: 'clear' | 'retrying' | 'degraded';
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
  { id: 'airport-01', ref: 'LV-AIR-401', serviceType: 'Airport Premium', stage: 'driver_assigned', etaMin: 14, gpsFreshnessSec: 8, airportRisk: 'Healthy', paymentState: 'clear' },
  { id: 'airport-02', ref: 'LV-AIR-402', serviceType: 'Airport Premium', stage: 'en_route', etaMin: 22, gpsFreshnessSec: 9, airportRisk: 'Warning', paymentState: 'clear' },
  { id: 'airport-03', ref: 'LV-AIR-403', serviceType: 'Airport Executive', stage: 'airport_arrival', etaMin: 7, gpsFreshnessSec: 11, airportRisk: 'Healthy', paymentState: 'retrying' }
];

export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sync, setSync] = useState<SyncState>('recovering');
  const [simRides, setSimRides] = useState<SimRide[]>(simulatedRidesSeed);
  const [leoFeed, setLeoFeed] = useState<string[]>(['Leo IA observing baseline airport flow.']);

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

  useEffect(() => {
    const lifecycleTick = setInterval(() => {
      setSimRides((current) => current.map((ride, index) => {
        const stageIndex = LIFECYCLE.indexOf(ride.stage);
        const nextStage = LIFECYCLE[(stageIndex + 1) % LIFECYCLE.length];
        const reconnectDrift = stageIndex % 4 === 1 ? 6 : 0;
        const staleGps = stageIndex % 5 === 2 ? 18 : 0;
        const paymentStress = nextStage === 'payment_completed' && index === 2 ? 'retrying' : nextStage === 'ride_closed' ? 'clear' : ride.paymentState;
        return {
          ...ride,
          stage: nextStage,
          etaMin: Math.max(4, nextStage === 'pickup_waiting' ? ride.etaMin + 3 : ride.etaMin - 2 + reconnectDrift / 6),
          gpsFreshnessSec: Math.max(6, 8 + staleGps),
          airportRisk: nextStage === 'pickup_waiting' || reconnectDrift > 0 ? 'Warning' : nextStage === 'destination_sync' ? 'Degraded' : 'Healthy',
          paymentState: paymentStress
        };
      }));
      setSync((prev) => (prev === 'live' ? 'recovering' : 'live'));
    }, 4500);

    return () => clearInterval(lifecycleTick);
  }, []);

  const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)), [bookings]);

  const simAnomalies = useMemo<SimAnomaly[]>(() => {
    const anomalies: SimAnomaly[] = [];
    simRides.forEach((ride) => {
      if (ride.gpsFreshnessSec > 20) anomalies.push({ code: `stale-gps-${ride.id}`, severity: 'Warning', detail: `${ride.ref} GPS freshness degraded to ${ride.gpsFreshnessSec}s`, emotionalImpact: 'Passenger uncertainty increases', subsystem: 'Tracking' });
      if (ride.stage === 'pickup_waiting') anomalies.push({ code: `pickup-waiting-${ride.id}`, severity: 'Warning', detail: `${ride.ref} waiting at terminal coordination zone`, emotionalImpact: 'Pickup confusion risk', subsystem: 'Airport Coordination' });
      if (ride.paymentState !== 'clear') anomalies.push({ code: `payment-retry-${ride.id}`, severity: ride.paymentState === 'retrying' ? 'Degraded' : 'Critical', detail: `${ride.ref} payment verification retry loop observed`, emotionalImpact: 'Trust pressure at ride closure', subsystem: 'Payments' });
    });
    if (sync !== 'live') anomalies.push({ code: 'websocket-reconnect', severity: sync === 'degraded' ? 'Degraded' : 'Warning', detail: 'Realtime stream reconnect delay detected', emotionalImpact: 'Founder confidence dips if prolonged', subsystem: 'Realtime Sync' });
    return anomalies;
  }, [simRides, sync]);

  const runtimeState = useMemo<RuntimeState>(() => mergeState(...simAnomalies.map((a) => a.severity), sync === 'degraded' ? 'Degraded' : sync === 'recovering' ? 'Warning' : 'Healthy'), [simAnomalies, sync]);

  useEffect(() => {
    const latest = simAnomalies[0];
    if (!latest) return;
    setLeoFeed((feed) => [
      `Leo IA: ${latest.subsystem} shows ${latest.severity.toLowerCase()} pressure. Suggested simplification: tighten pickup handoff signal clarity.`,
      ...feed
    ].slice(0, 4));
  }, [simAnomalies]);

  const pulseItems = useMemo<PulseItem[]>(() => [
    { label: 'Operational Pulse', state: runtimeState, detail: `${simAnomalies.length} active operational anomalies` },
    { label: 'Realtime Sync Status', state: sync === 'live' ? 'Healthy' : sync === 'recovering' ? 'Warning' : 'Degraded', detail: sync === 'live' ? 'Websocket healthy' : 'Recovering continuity' },
    { label: 'Airport Coordination', state: mergeState(...simRides.map((ride) => ride.airportRisk)), detail: `${simRides.filter((r) => r.stage === 'pickup_waiting').length} pickup waiting · ${simRides.filter((r) => r.stage === 'airport_arrival').length} terminal arrivals` },
    { label: 'Payment Trust', state: simRides.some((r) => r.paymentState !== 'clear') ? 'Degraded' : 'Healthy', detail: simRides.some((r) => r.paymentState !== 'clear') ? 'Retry loops need calm closure handling' : 'Payment integrity stable' }
  ], [runtimeState, simAnomalies.length, sync, simRides]);

  const founderAttention = useMemo<AttentionItem[]>(() => simAnomalies.slice(0, 4).map((item) => ({ title: `${item.subsystem} attention`, state: item.severity, reason: `${item.detail}. Impact: ${item.emotionalImpact}.` })), [simAnomalies]);

  return <main className="min-h-screen bg-lvtp-obsidian p-5 text-zinc-100">
    <div className="lvtp-network absolute inset-0 pointer-events-none opacity-40" />
    <div className="relative mx-auto max-w-7xl space-y-5">
      <header className="lvtp-shell rounded-3xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img src="/brand/lv-logo-primary.svg" alt="LV Transport" className="h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" />
            <div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Founder Operational Cockpit</p><h1 className="text-xl font-semibold text-amber-200">LVTP Realtime Control Environment</h1></div>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`}>{runtimeState}</span>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{pulseItems.map((item) => <article key={item.label} className="lvtp-card rounded-2xl p-4"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">{item.label}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`}>{item.state}</span></div><p className="mt-2 text-sm text-zinc-300">{item.detail}</p></article>)}</section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="lvtp-card xl:col-span-2 rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Active Rides · Lifecycle Breathing</h2>
          <div className="mt-3 space-y-3">{simRides.map((ride) => <div key={ride.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-zinc-100">{ride.ref}</p><span className="text-xs uppercase text-zinc-300">{ride.stage}</span></div><div className="mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4"><p>ETA: {ride.etaMin}m</p><p>GPS freshness: {ride.gpsFreshnessSec}s</p><p>Airport risk: {ride.airportRisk}</p><p>Payment: {ride.paymentState}</p></div></div>)}</div>
        </article>
        <article className="lvtp-card rounded-2xl p-4"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Founder Attention Queue</h2><div className="mt-3 space-y-2">{founderAttention.map((item) => <div key={item.title + item.reason} className="rounded-xl border border-white/10 bg-black/25 p-3"><div className="flex justify-between"><p className="text-sm text-zinc-100">{item.title}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`}>{item.state}</span></div><p className="mt-1 text-xs text-zinc-300">{item.reason}</p></div>)}</div></article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <article className="lvtp-card rounded-2xl p-4"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Weakness Chains</h2><ol className="mt-3 space-y-2 text-sm text-zinc-300"><li>Degraded LTE → reconnect delay</li><li>Reconnect delay → stale GPS</li><li>Stale GPS → ETA drift</li><li>ETA drift → airport pickup uncertainty</li><li>Pickup uncertainty → Moni reassurance escalation</li></ol></article>
        <article className="lvtp-card rounded-2xl p-4"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Leo IA Observational Feed</h2><ul className="mt-3 space-y-2 text-sm text-zinc-300">{leoFeed.map((feed, idx) => <li key={idx} className="rounded-lg border border-white/10 bg-black/20 p-2">{feed}</li>)}</ul></article>
        <article className="lvtp-card rounded-2xl p-4"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Runtime Scorecard</h2><ul className="mt-3 space-y-2 text-sm text-zinc-300"><li>Operational calmness: {runtimeState === 'Healthy' ? 'High' : 'Monitored'}</li><li>Airport coordination maturity: {simRides.some((r) => r.airportRisk !== 'Healthy') ? 'Stressed' : 'Stable'}</li><li>Reconnect recovery quality: {sync === 'live' ? 'Recovered' : 'Recovering'}</li><li>Founder visibility clarity: {founderAttention.length ? 'Actionable' : 'Clear'}</li></ul></article>
      </section>
    </div>
  </main>;
}

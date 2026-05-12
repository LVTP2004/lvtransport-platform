import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type MetricCardProps = { title: string; value: string; trend?: string; tone?: 'gold' | 'emerald' | 'blue' | 'rose' };

type BookingLifecycle = 'pending' | 'assigned' | 'on_route' | 'completed' | 'cancelled' | 'other';
type DriverOperationalState = 'offline' | 'available' | 'assigned' | 'on_route' | 'arrived' | 'in_progress' | 'completed' | 'unknown';
type SyncState = 'live' | 'recovering' | 'degraded';

type AdminBooking = {
  id: string;
  referenceCode?: string;
  code?: string;
  serviceType: string;
  status: string;
  scheduledAt: string;
  paymentStatus?: string;
  customerType?: 'vip' | 'business' | 'standard';
  createdAt?: string;
  updatedAt?: string;
  timeline?: Array<{ status: string; at: string }>;
  assignedDriverId?: string;
};

type DriverRealtime = {
  driverId: string;
  state: string;
  activeBookingId?: string;
  location?: { lat: number; lng: number; speed?: number; capturedAt?: string };
  lastUpdatedAt?: string;
};

type Incident = { code: string; severity: string; message: string; createdAt?: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const navItems = [{ label: 'Dashboard', icon: '◫' }, { label: 'Bookings', icon: '◈' }, { label: 'Dispatch', icon: '⌖' }, { label: 'Fleet', icon: '▣' }, { label: 'Drivers', icon: '◍' }, { label: 'Incidents', icon: '⚠' }, { label: 'Settings', icon: '⚙' }];

function MetricCard({ title, value, trend, tone = 'gold' }: MetricCardProps) {
  const toneClass = { gold: 'from-amber-400/20 to-amber-300/5 border-amber-400/30 text-amber-200', emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-400/30 text-emerald-200', blue: 'from-sky-400/20 to-sky-300/5 border-sky-400/30 text-sky-200', rose: 'from-rose-400/20 to-rose-300/5 border-rose-400/30 text-rose-200' }[tone];
  return <article className={`rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-black/20`}><p className="text-xs uppercase tracking-[0.2em] text-zinc-300">{title}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p>{trend && <p className="mt-2 text-xs text-zinc-300">{trend}</p>}</article>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30"><div className="mb-4 flex items-center gap-2 text-amber-300">{icon}<h2 className="text-sm font-semibold uppercase tracking-[0.18em]">{title}</h2></div>{children}</section>;
}

const normalizeBookingStatus = (status: string): BookingLifecycle => {
  const s = status.toLowerCase();
  if (['pending', 'accepted', 'quoted', 'confirmed', 'available'].includes(s)) return 'pending';
  if (s === 'assigned') return 'assigned';
  if (['onderweg', 'arrived', 'in_progress', 'enroute', 'on_route', 'active'].includes(s)) return 'on_route';
  if (['completed', 'done'].includes(s)) return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'other';
};

const normalizeDriverState = (state: string): DriverOperationalState => {
  const s = state.toLowerCase();
  if (s === 'onderweg') return 'on_route';
  if (['offline', 'available', 'assigned', 'arrived', 'in_progress', 'completed'].includes(s)) return s as DriverOperationalState;
  return 'unknown';
};

export function App() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [drivers, setDrivers] = useState<DriverRealtime[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [syncState, setSyncState] = useState<SyncState>('recovering');
  const [lastSyncIso, setLastSyncIso] = useState<string>('');
  const [refreshCycle, setRefreshCycle] = useState(0);
  const [statusFilter, setStatusFilter] = useState<BookingLifecycle | 'all'>('all');
  const reconnectRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bookingRes, driverRes, incidentRes] = await Promise.all([
          fetch(`${API_BASE}/admin/bookings`),
          fetch(`${API_BASE}/drivers/live-states`),
          fetch(`${API_BASE}/operations/incidents`),
        ]);
        const bookingPayload = await bookingRes.json();
        const driverPayload = await driverRes.json();
        const incidentPayload = await incidentRes.json();
        setBookings(Array.isArray(bookingPayload.bookings) ? bookingPayload.bookings : []);
        setDrivers(Array.isArray(driverPayload.drivers) ? driverPayload.drivers : []);
        setIncidents(Array.isArray(incidentPayload.incidents) ? incidentPayload.incidents : []);
        setLastSyncIso(new Date().toISOString());
        setSyncState(reconnectRef.current ? 'live' : 'recovering');
      } catch {
        setSyncState('degraded');
      } finally {
        reconnectRef.current = true;
      }
    };
    load();
    const poller = window.setInterval(() => { setRefreshCycle((v) => v + 1); setSyncState((prev) => prev === 'degraded' ? 'recovering' : prev); load(); }, 12000);
    return () => window.clearInterval(poller);
  }, []);

  const bookingsWithOps = useMemo(() => bookings.map((b) => {
    const normalizedStatus = normalizeBookingStatus(b.status);
    const immutable = normalizedStatus === 'completed' || normalizedStatus === 'cancelled';
    const duplicateTransition = Boolean((b.timeline ?? []).some((entry, i, arr) => i > 0 && arr[i - 1]?.status === entry.status));
    const stale = Boolean(b.updatedAt && Date.now() - new Date(b.updatedAt).getTime() > 10 * 60_000 && !immutable);
    return { ...b, normalizedStatus, immutable, duplicateTransition, stale };
  }), [bookings]);

  const filteredBookings = useMemo(() => statusFilter === 'all' ? bookingsWithOps : bookingsWithOps.filter((b) => b.normalizedStatus === statusFilter), [bookingsWithOps, statusFilter]);
  const activeBookings = useMemo(() => bookingsWithOps.filter((b) => ['assigned', 'on_route'].includes(b.normalizedStatus)), [bookingsWithOps]);
  const completedBookings = useMemo(() => bookingsWithOps.filter((b) => b.normalizedStatus === 'completed'), [bookingsWithOps]);
  const unresolvedIncidents = useMemo(() => incidents.filter((i) => i.severity !== 'info'), [incidents]);
  const staleBookings = useMemo(() => bookingsWithOps.filter((b) => b.stale), [bookingsWithOps]);
  const disconnectedDrivers = useMemo(() => drivers.filter((d) => d.lastUpdatedAt && Date.now() - new Date(d.lastUpdatedAt).getTime() > 5 * 60_000), [drivers]);
  const normalizedDrivers = useMemo(() => drivers.map((d) => ({ ...d, normalizedState: normalizeDriverState(d.state) })), [drivers]);

  return <main className="min-h-screen bg-zinc-900 text-zinc-100"><div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]"><aside className="border-r border-zinc-800 bg-black/90 p-6"><div className="mb-8"><p className="text-xs uppercase tracking-[0.28em] text-zinc-500">LV Transport</p><h1 className="mt-1 text-2xl font-bold text-amber-300">Control Tower</h1></div><nav className="space-y-2">{navItems.map(({ label, icon }, index) => <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${index === 0 ? 'bg-amber-400/20 text-amber-200' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`}><span className="w-4 text-center">{icon}</span>{label}</button>)}</nav></aside><div className="flex flex-col"><header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-4"><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Operations Center</p><p className="text-lg font-medium text-white">Regional Dispatch & Service Health</p></div><p className="text-xs text-zinc-400">Sync: <span className={syncState === 'live' ? 'text-emerald-300' : syncState === 'recovering' ? 'text-amber-200' : 'text-rose-300'}>{syncState.toUpperCase()}</span> • cycle {refreshCycle}</p></header><div className="space-y-5 p-5"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="Realtime Bookings" value={`${bookingsWithOps.length}`} trend={`${activeBookings.length} actively supervised`} tone="gold" /><MetricCard title="Driver Operations" value={`${normalizedDrivers.length}`} trend={`${normalizedDrivers.filter((d) => d.normalizedState === 'on_route').length} on route`} tone="emerald" /><MetricCard title="Moni Escalations" value={`${unresolvedIncidents.length}`} trend="AI-human escalation visibility" tone="blue" /><MetricCard title="Operational Warnings" value={`${staleBookings.length + disconnectedDrivers.length}`} trend="stale/disconnected indicators" tone="rose" /></section>
<section className="grid gap-5 xl:grid-cols-3"><div className="space-y-5 xl:col-span-2"><Panel title="Booking Lifecycle Supervision" icon={<span>◈</span>}><div className="mb-3 flex flex-wrap gap-2">{(['all', 'pending', 'assigned', 'on_route', 'completed', 'cancelled'] as const).map((filter) => <button key={filter} onClick={() => setStatusFilter(filter)} className={`rounded-lg border px-2 py-1 text-xs uppercase ${statusFilter === filter ? 'border-amber-300 text-amber-200' : 'border-zinc-700 text-zinc-300'}`}>{filter}</button>)}</div><div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-zinc-400"><tr>{['Reference', 'Service', 'Status', 'Lifecycle', 'Immutable', 'Timestamps', 'Ops Flags'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead><tbody>{filteredBookings.map((row) => <tr key={row.id} className="border-t border-zinc-800 text-zinc-200"><td className="px-2 py-3">{row.referenceCode ?? row.code ?? row.id}</td><td className="px-2 py-3">{row.serviceType}</td><td className="px-2 py-3">{row.status}</td><td className="px-2 py-3">{row.normalizedStatus}</td><td className="px-2 py-3">{row.immutable ? 'locked' : 'mutable'}</td><td className="px-2 py-3 text-xs">{row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : '-'} / {row.updatedAt ? new Date(row.updatedAt).toLocaleTimeString() : '-'}</td><td className="px-2 py-3 text-xs">{row.duplicateTransition ? 'duplicate blocked' : 'clean'} {row.stale ? '• stale' : ''}</td></tr>)}</tbody></table></div></Panel>
<Panel title="Driver Operations" icon={<span>◍</span>}><div className="space-y-2 text-xs">{normalizedDrivers.map((driver) => <div key={driver.driverId} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2"><p className="font-medium text-zinc-100">{driver.driverId} <span className="text-zinc-400">{driver.activeBookingId ? `• booking ${driver.activeBookingId}` : '• no active ride'}</span></p><p className="text-zinc-300">state: {driver.normalizedState} • telemetry: {driver.location ? `${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}` : 'awaiting GPS'} • speed {driver.location?.speed ?? 0}</p></div>)}</div></Panel></div>
<div className="space-y-5"><Panel title="Moni Escalation Visibility" icon={<span>🤖</span>}><div className="space-y-2 text-sm text-zinc-300"><p className="rounded-lg bg-zinc-900 p-2">Escalation queue: <span className="text-white">{unresolvedIncidents.length}</span></p><p className="rounded-lg bg-zinc-900 p-2">Audit events visible: <span className="text-white">{incidents.length}</span></p><p className="rounded-lg bg-zinc-900 p-2">Assistant-human handoff: <span className="text-emerald-300">prepared</span></p></div></Panel>
<Panel title="Operational Monitoring" icon={<span>⚠</span>}><ul className="space-y-2 text-sm text-zinc-300"><li className={`rounded-lg p-2 ${syncState === 'degraded' ? 'border border-rose-500/30 bg-rose-500/10' : 'border border-emerald-500/30 bg-emerald-500/10'}`}>Realtime sync: {syncState === 'degraded' ? 'degraded - recovery active' : 'healthy'}</li><li className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">Stale bookings: {staleBookings.length}</li><li className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">Disconnected sessions (drivers): {disconnectedDrivers.length}</li><li className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">Booking recovery visibility: enabled</li></ul></Panel></div></section></div></div></div></main>;
}

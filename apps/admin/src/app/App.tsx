import { useEffect, useState } from 'react';
import { AccountStatus, type AuthState, UserRole } from '@lvtransport/auth';
import { adminAuthProvider, adminAuthService } from '../modules/auth/services/auth-client.service';

export function App() {
  const [authState, setAuthState] = useState<AuthState>({ isAuthenticated: false, isLoading: true });
  const [email, setEmail] = useState('admin@lvtransport.dev');
  const [password, setPassword] = useState('password123');
  const [allowed, setAllowed] = useState(false);
  useEffect(() => { adminAuthService.getInitialState().then(setAuthState); }, []);
  const login = async () => { const t = await adminAuthService.signIn({ email, password }); const u = await adminAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.ADMIN) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
  const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
  if (!authState.isAuthenticated) return <main className='min-h-screen bg-zinc-900 p-8 text-white'><h1 className='text-3xl mb-4'>Admin Login</h1><input className='text-black p-2 mr-2' value={email} onChange={(e)=>setEmail(e.target.value)} /><input className='text-black p-2 mr-2' type='password' value={password} onChange={(e)=>setPassword(e.target.value)} /><button className='bg-amber-400 text-black px-3 py-2 rounded' onClick={login}>Sign in</button></main>;
  if (!allowed) return <main className='min-h-screen bg-zinc-900 p-8 text-white'>Access denied<button onClick={logout}>Logout</button></main>;
  return <main className='min-h-screen bg-zinc-900 text-white p-8'><h1 className='text-3xl text-amber-300'>Control Tower</h1><p>Authenticated admin session persisted with Firebase placeholder config.</p><button onClick={logout}>Logout</button></main>;
import { useEffect, useMemo, useState } from 'react';
import { dispatchMvpStore, getDispatchSnapshot, type DispatchBookingStatus } from '@lvtransport/realtime';

const DRIVERS = ['DRV-100', 'DRV-101', 'DRV-102'];

export function App() {
  const [state, setState] = useState(getDispatchSnapshot());
  const [bookingId, setBookingId] = useState('BK-2001');
  const [customerId, setCustomerId] = useState('CUS-501');
  const [driverId, setDriverId] = useState(DRIVERS[0]);

  useEffect(() => dispatchMvpStore.subscribe(setState), []);

  const assign = () => dispatchMvpStore.assignDriver(bookingId, customerId, driverId, 'admin-control');

  const counts = useMemo(() => ({
    pending: state.bookings.filter((b) => b.status === 'pending').length,
    assigned: state.bookings.filter((b) => b.status === 'assigned').length,
    accepted: state.bookings.filter((b) => b.status === 'driver_accepted').length,
    rejected: state.bookings.filter((b) => b.status === 'driver_rejected').length,
  }), [state.bookings]);

  return (
    <main className="min-h-screen bg-zinc-900 p-6 text-zinc-100">
      <h1 className="text-2xl font-bold text-amber-300">Dispatch Control Tower (MVP)</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-4">{Object.entries(counts).map(([k,v]) => <div key={k} className="rounded-xl border border-zinc-700 p-3">{k}: {v}</div>)}</div>

      <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4">
        <h2 className="font-semibold text-amber-200">Assign Booking</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-4">
          <input className="rounded bg-zinc-800 p-2" value={bookingId} onChange={(e) => setBookingId(e.target.value)} />
          <input className="rounded bg-zinc-800 p-2" value={customerId} onChange={(e) => setCustomerId(e.target.value)} />
          <select className="rounded bg-zinc-800 p-2" value={driverId} onChange={(e) => setDriverId(e.target.value)}>{DRIVERS.map((d) => <option key={d}>{d}</option>)}</select>
          <button className="rounded bg-amber-500 px-3 py-2 font-semibold text-zinc-900" onClick={assign}>Assign</button>
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-zinc-700 bg-zinc-950/50 p-4">
        <h2 className="font-semibold text-amber-200">Assignment History / Driver Response</h2>
        <div className="mt-3 space-y-3">
          {state.bookings.map((booking) => (
            <article key={booking.bookingId} className="rounded border border-zinc-700 p-3">
              <p>{booking.bookingId} • {booking.customerId} • Driver: {booking.driverId ?? 'unassigned'} • <Status status={booking.status} /></p>
              <ul className="mt-2 list-disc pl-5 text-xs text-zinc-300">
                {booking.history.map((h, i) => <li key={`${h.occurredAt}-${i}`}>{h.occurredAt} — {h.type} ({h.actorId}) {h.note ?? ''}</li>)}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );

const navItems = [
  { label: 'Dashboard', icon: '◫' },
  { label: 'Bookings', icon: '◈' },
  { label: 'Dispatch', icon: '⌖' },
  { label: 'Fleet', icon: '▣' },
  { label: 'Drivers', icon: '◍' },
  { label: 'Incidents', icon: '⚠' },
  { label: 'Settings', icon: '⚙' },
];

const bookings = [
  ['BK-10928', 'Executive Sedan', 'New', 'Unassigned', 'ASAP'],
  ['BK-10924', 'Airport Transfer', 'Scheduled', 'Alicia D.', '10:40'],
  ['BK-10925', 'Corporate Shuttle', 'In Progress', 'Lars M.', '10:55'],
  ['BK-10926', 'VIP Point-to-Point', 'Delayed', 'Soren K.', '11:10'],
  ['BK-10927', 'Hotel Pickup', 'Completed', 'Priya T.', '11:30'],
  ['BK-10924', 'Airport Transfer', 'Scheduled', 'Alicia D.', '10:40', 'paid'],
  ['BK-10925', 'Corporate Shuttle', 'In Progress', 'Lars M.', '10:55', 'requires_action'],
  ['BK-10926', 'VIP Point-to-Point', 'Delayed', 'Soren K.', '11:10', 'payment_failed_retrying'],
  ['BK-10927', 'Hotel Pickup', 'Completed', 'Priya T.', '11:30', 'refunded_pending_approval'],
];

export function App() {
  return (
    <main className="min-h-screen bg-zinc-900 text-zinc-100">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]">
        <aside className="border-r border-zinc-800 bg-black/90 p-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">LV Transport</p>
            <h1 className="mt-1 text-2xl font-bold text-amber-300">Control Tower</h1>
          </div>
          <nav className="space-y-2">
            {navItems.map(({ label, icon }, index) => (
              <button
                key={label}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  index === 0
                    ? 'bg-amber-400/20 text-amber-200'
                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'
                }`}
              >
                <span className="w-4 text-center">{icon}</span> {label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex flex-col">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Operations Center</p>
              <p className="text-lg font-medium text-white">Regional Dispatch & Service Health</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm transition hover:border-amber-300 hover:text-amber-200">Today</button>
              <button className="rounded-xl border border-zinc-700 bg-zinc-900 p-2 transition hover:border-amber-300 hover:text-amber-200">
                <span>🔔</span>
              </button>
            </div>
          </header>

          <div className="space-y-5 p-5">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard title="Revenue Today" value="$84,290" trend="+6.4% vs yesterday" tone="gold" />
              <MetricCard title="Active Rides" value="148" trend="12 nearing destination" tone="emerald" />
              <MetricCard title="Driver Utilization" value="91%" trend="Across 3 operating zones" tone="blue" />
              <MetricCard title="Critical Alerts" value="3" trend="2 requires dispatch intervention" tone="rose" />
            </section>

            <section className="grid gap-5 xl:grid-cols-3">
              <div className="space-y-5 xl:col-span-2">
                <Panel title="Booking Management" icon={<span>◈</span>}>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] text-left text-sm">
                      <thead className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                        <tr>
                          {['ID', 'Service', 'Status', 'Driver', 'ETA', 'Payment'].map((h) => (
                            <th key={h} className="px-2 py-2">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.map((row) => (
                          <tr key={row[0]} className="border-t border-zinc-800 text-zinc-200 transition hover:bg-zinc-900/70">
                            {row.map((cell) => (
                              <td key={cell} className="px-2 py-3">{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Panel>

                <div className="grid gap-5 md:grid-cols-2">
                  <Panel title="Active Rides" icon={<span>◉</span>}>
                    <ul className="space-y-3 text-sm text-zinc-300">
                      <li className="rounded-xl bg-zinc-900/80 p-3">Ride #R-8821 • Downtown to Terminal 1 • 14 min</li>
                      <li className="rounded-xl bg-zinc-900/80 p-3">Ride #R-8830 • Convention to Bellagio • 9 min</li>
                      <li className="rounded-xl bg-zinc-900/80 p-3">Ride #R-8833 • Wynn to Airport • 21 min</li>
                    </ul>
                  </Panel>

                  <Panel title="Driver Monitoring" icon={<span>◍</span>}>
                    <div className="grid gap-3 text-sm">
                      {['On Duty 126', 'Break 14', 'Offline 8'].map((d) => (
                        <div key={d} className="rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition hover:border-amber-300/40">{d}</div>
                      ))}
                    </div>
                  </Panel>
                </div>
              </div>

              <div className="space-y-5">
                <Panel title="Live Status Widgets" icon={<span>◌</span>}>
                  <div className="space-y-2 text-sm text-zinc-300">
                    <p className="rounded-lg bg-zinc-900 p-2">System Health: <span className="text-emerald-300">Stable</span></p>
                    <p className="rounded-lg bg-zinc-900 p-2">Avg Wait Time: <span className="text-amber-200">5m 42s</span></p>
                    <p className="rounded-lg bg-zinc-900 p-2">Traffic Index: <span className="text-rose-300">High</span></p>
                  </div>
                </Panel>

                <Panel title="Alerts & Incidents" icon={<span>⚠</span>}>
                  <ul className="space-y-2 text-sm text-zinc-300">
                    <li className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2">New booking alert • BK-10928 received</li>
                    <li className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-2">Engine anomaly • Unit DV-14</li>
                    <li className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-2">Late pickup cluster • Sector West</li>
                    <li className="rounded-lg border border-sky-500/30 bg-sky-500/10 p-2">Road closure • Strip Blvd</li>
                  </ul>
                </Panel>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-3">
              <Panel title="Dispatch Overview" icon={<span>⌖</span>}><p className="text-sm text-zinc-300">56 open dispatch tasks, 18 pending route approvals.</p></Panel>
              <Panel title="Fleet Overview" icon={<span>▣</span>}><p className="text-sm text-zinc-300">184 vehicles total • 169 available • 10 maintenance • 5 offline.</p></Panel>
              <Panel title="Admin Settings" icon={<span>⚙</span>}><p className="text-sm text-zinc-300">Role profiles, escalation rules, and SLA thresholds configuration panel placeholder.</p></Panel>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <Panel title="Customer Activity" icon={<span>◎</span>}><p className="text-sm text-zinc-300">Bookings/hour peak: 94 • Repeat customer ratio: 47% • App satisfaction: 4.8/5.</p></Panel>
              <Panel title="Audit / Activity Log" icon={<span>◷</span>}><p className="text-sm text-zinc-300">10:32 Dispatch reassigned R-8821 • 10:29 Refund prepared (manual approval) • 10:25 Stripe test webhook accepted.</p></Panel>
            </section>
type RuntimeState = 'Healthy' | 'Warning' | 'Degraded' | 'Critical';
type SyncState = 'live' | 'recovering' | 'degraded';
type Booking = { id: string; status: string; referenceCode?: string; pickup?: string; destination?: string; lifecycle?: { version?: number } };
type Driver = { driverId: string; state: string };
type Incident = { code: string; severity: string; message: string };


type AttentionItem = { title: string; state: RuntimeState; reason: string };

type LeoExecutiveSummary = {
  headline: string;
  priority: string;
  report: string;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1';
const stateTone: Record<RuntimeState, string> = {
  Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
  Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
  Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100',
  Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100'
};
const severityRank: Record<RuntimeState, number> = { Healthy: 0, Warning: 1, Degraded: 2, Critical: 3 };
const mergeState = (...states: RuntimeState[]): RuntimeState => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy');


export function App() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [sync, setSync] = useState<SyncState>('recovering');

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


  const pendingRides = useMemo(() => bookings.filter((booking) => ['pending', 'searching_driver', 'quote_pending'].includes(booking.status)).length, [bookings]);
  const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)).length, [bookings]);
  const onlineDrivers = useMemo(() => drivers.filter((driver) => ['online', 'active'].includes(driver.state)).length, [drivers]);

  const founderAttention = useMemo<AttentionItem[]>(() => {
    const attention: AttentionItem[] = [];
    bookings.forEach((ride) => {
      if (ride.status === 'arrived') attention.push({ title: `Pickup waiting · ${ride.referenceCode ?? ride.id}`, state: 'Warning', reason: 'Passenger pickup confirmation pending.' });
      if (ride.status === 'failed') attention.push({ title: `Failed ride · ${ride.referenceCode ?? ride.id}`, state: 'Degraded', reason: 'Manual intervention required.' });
    });
    if (sync !== 'live') attention.push({ title: 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' });
    return attention.slice(0, 4);
  }, [bookings, sync]);

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
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Active rides</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{activeRides}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Pending rides</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{pendingRides}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">Drivers online</p><p className="mt-2 text-2xl font-semibold text-zinc-100">{onlineDrivers}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><p className="text-xs uppercase tracking-[0.12em] text-zinc-400">System trust level</p><p className="mt-2 text-lg font-semibold text-amber-100">{trustLevel}</p><p className="mt-1 text-xs text-zinc-400">Sync: {sync}</p></article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="lvtp-card xl:col-span-2 rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Ride lifecycle visibility</h2>
          <div className="mt-3 space-y-3">{bookings.map((ride) => <div key={ride.id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm text-zinc-100">{ride.referenceCode ?? ride.id}</p><span className="text-xs uppercase text-zinc-300">{ride.status.replaceAll('_', ' ')}</span></div><div className="mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4"><p>Status sync</p><p>Version {ride.lifecycle?.version ?? '-'}</p><p>Pickup {ride.pickup ?? '-'}</p><p>Destination {ride.destination ?? '-'}</p></div></div>)}</div>
        </article>

        <article className="lvtp-card rounded-2xl p-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Founder priorities</h2>
          <div className="mt-3 space-y-2">{founderAttention.length ? founderAttention.map((item) => <div key={item.title} className="rounded-xl border border-white/10 bg-black/25 p-3"><div className="flex justify-between"><p className="text-sm text-zinc-100">{item.title}</p><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`}>{item.state}</span></div><p className="mt-1 text-xs text-zinc-300">{item.reason}</p></div>) : <p className="text-sm text-zinc-300">No founder actions required.</p>}</div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="lvtp-card rounded-2xl p-4 xl:col-span-2"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Leo IA executive summary</h2><p className="mt-3 text-sm text-zinc-100">{leoSummary.headline}</p><p className="mt-2 text-sm text-zinc-300">{leoSummary.priority}</p><p className="mt-2 text-sm text-zinc-300">{leoSummary.report}</p></article>
        <article className="lvtp-card rounded-2xl p-4"><h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-300">Operational health</h2><ul className="mt-3 space-y-2 text-sm text-zinc-300"><li>Airport pickups waiting: {bookings.filter((r) => r.status === 'arrived').length}</li><li>Payment retries: {bookings.filter((r) => r.status === 'failed').length}</li><li>Incidents observed: {incidents.length}</li><li>Moni reassurance need: {founderAttention.some((a) => a.title.startsWith('Airport pickup')) ? 'Elevated' : 'Normal'}</li></ul></article>
      </section>
    </div>
  </main>;
}

function Status({ status }: { status: DispatchBookingStatus }) {
  return <span className="text-emerald-300">{status}</span>;
}

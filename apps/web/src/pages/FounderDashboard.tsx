import { FounderOperationsMap } from './FounderOperationsMap';
import { EmailLinkForm, type EmailSignIn } from '../../../admin/src/modules/auth/components/EmailLinkForm';
import { useEffect, useRef, useState } from 'react';
import { createLVTransportFirebaseProvider, OperationsRequestError, VerifiedOperationsClient, type VerifiedPortalIdentity } from '@lvtransport/auth';
import './founder-dashboard.css';

type Transition = { from?: string; to: string; occurredAt: string; metadata?: { operation_id?: string } };
type Booking = { id: string; referenceCode: string; pickup: string; destination: string; status: string; scheduleAt: string; transitions: Transition[]; assignment?: { vehicleId: string; driverId: string } | null; location?: { lat: number; lng: number; capturedAt: string; receivedAt?: string } | null };
type Driver = { id: string; name: string; status: string; vehicleId: string; lastSeenAt: string };
type Vehicle = { id: string; name: string; registration: string; fleetType: string };
type Snapshot = { bookings: Booking[]; drivers: Driver[]; vehicles: Vehicle[]; at: number };
const navigation = [
  ['overview', '⌂', 'Executive Overview'], ['attention', '◉', 'Attention Queue'], ['operations', '▤', 'Operations'],
  ['moni', '✧', 'Moni Core'], ['runtimes', '▥', 'Runtimes'], ['control', '◎', 'Control Tower'],
  ['drivers', '♙', 'Drivers & Fleet'], ['finance', '▧', 'Clients & Revenue'], ['incidents', '◇', 'Incident Intelligence'],
  ['risk', '♧', 'Risk & Compliance'], ['intelligence', '◈', 'Executive Intelligence'], ['audit', '▤', 'Decision Log'],
  ['initiatives', '♧', 'Strategic Initiatives'], ['roadmap', '▦', 'Roadmap'], ['governance', '♧', 'Governance'], ['health', '⌁', 'System Health'],
] as const;
const closed = new Set(['completed', 'cancelled', 'failed']);
const formatTime = (value: string | number) => new Date(value).toLocaleString('nl-BE', { dateStyle: 'short', timeStyle: 'short' });

export function completedInPeriod(bookings: Booking[], days: number, now: number) {
  return bookings.filter(booking => booking.status === 'completed' && booking.transitions.some(event => {
    const age = now - Date.parse(event.occurredAt);
    return event.to === 'completed' && Number.isFinite(age) && age >= 0 && age <= days * 86400000;
  })).length;
}
export function currentLocations(bookings: Booking[], now: number) {
  return bookings.filter(booking => {
    const point = booking.location;
    if (!point || closed.has(booking.status)) return false;
    const age = now - Date.parse(point.receivedAt ?? point.capturedAt);
    return Number.isFinite(point.lat) && Math.abs(point.lat) <= 90 && Number.isFinite(point.lng) && Math.abs(point.lng) <= 180
      && Number.isFinite(age) && age >= 0 && age <= 120000;
  });
}
function Unavailable({ text = 'No verified data source connected.' }: { text?: string }) {
  return <p className="fd-empty">{text}</p>;
}
function Panel({ title, eyebrow, children, className = '' }: { title: string; eyebrow?: string; children: React.ReactNode; className?: string }) {
  return <section className={`fd-panel ${className}`}><header className="fd-panel-heading"><h2>{title}</h2>{eyebrow && <span>{eyebrow}</span>}</header>{children}</section>;
}

export default function FounderDashboard() {
  const [section, setSection] = useState('overview'), [menuOpen, setMenuOpen] = useState(false), [days, setDays] = useState(30);
  const [identity, setIdentity] = useState<VerifiedPortalIdentity | null>(null), [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(true), [refreshing, setRefreshing] = useState(false);
  const [clock, setClock] = useState(Date.now), [health, setHealth] = useState<{ checked: number; ok: boolean } | null>(null);
  const client = useRef<VerifiedOperationsClient | null>(null), mounted = useRef(true), pending = useRef(false), generation = useRef(0);
  const api = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1').replace(/\/$/, '');
  const apiV1 = api.endsWith('/api/v1') ? api : api + '/api/v1';
  async function refresh(activeClient: VerifiedOperationsClient, epoch: number) {
    if (pending.current) return;
    pending.current = true; if (mounted.current) setRefreshing(true);
    try {
      const [b, d, v] = await Promise.all([
        activeClient.request<{ bookings: Booking[] }>('/operations/bookings'),
        activeClient.request<{ drivers: Driver[] }>('/operations/drivers'),
        activeClient.request<{ vehicles: Vehicle[] }>('/operations/vehicles'),
      ]);
      if (![b.bookings, d.drivers, v.vehicles].every(Array.isArray)) throw new Error('Unexpected operational response.');
      if (mounted.current && generation.current === epoch && client.current === activeClient) {
        setSnapshot({ bookings: b.bookings, drivers: d.drivers, vehicles: v.vehicles, at: Date.now() }); setError('');
      }
    } catch {
      if (mounted.current && generation.current === epoch) setError('Operational data could not be refreshed. Previous observations may be out of date.');
    } finally { pending.current = false; if (mounted.current) setRefreshing(false); }
  }
  useEffect(() => {
    mounted.current = true;
    const query = new URLSearchParams(window.location.search);
    if (query.get('mode') === 'signIn' && query.has('oobCode')) setBusy(false);
    else void authenticate('restore');
    const tick = setInterval(() => {
      setClock(Date.now());
      if (client.current) void refresh(client.current, generation.current);
    }, 15000);
    return () => {
      mounted.current = false;
      generation.current++;
      clearInterval(tick);
      const previous = client.current;
      client.current = null;
      void previous?.disconnect(false).catch(() => {});
    };
  }, []);
  async function authenticate(mode: 'restore' | 'interactive', emailSignIn?: EmailSignIn, remember = false) {
    setBusy(true);
    setError('');
    const epoch = ++generation.current;
    const current = () => mounted.current && generation.current === epoch;
    let connection: VerifiedOperationsClient | undefined;
    try {
      const provider = createLVTransportFirebaseProvider('founder');
      if (mode === 'restore' && (!(await provider.getInitialState()).isAuthenticated || !current())) return;
      connection = new VerifiedOperationsClient(provider, apiV1, 'founder', fetch, () => {
        if (!current() || client.current !== connection) return;
        generation.current++;
        client.current = null;
        setIdentity(null);
        setSnapshot(null);
        setBusy(false);
        setError('Session no longer authorized. Sign in again.');
      });
      const verified = mode === 'restore'
        ? await connection.verifySession()
        : await connection.connect(emailSignIn, remember);
      if (!current()) {
        await connection.disconnect(false);
        return;
      }
      client.current = connection;
      setIdentity(verified);
      if (emailSignIn) window.history.replaceState(window.history.state, '', window.location.pathname);
      await refresh(connection, epoch);
    } catch (error) {
      const accessDenied = error instanceof OperationsRequestError && error.code === 'PORTAL_ACCESS_DENIED';
      await connection?.disconnect(current() && (mode === 'interactive' || accessDenied)).catch(() => {});
      if (current()) setError('Access could not be verified. Use your authorized Founder OS account.');
    } finally {
      if (current()) setBusy(false);
    }
  }
  async function logout() {
    generation.current++; const previous = client.current; client.current = null;
    setIdentity(null); setSnapshot(null); setHealth(null); setError('');
    await previous?.disconnect().catch(() => { if (mounted.current) setError('Local view closed; remote sign-out could not be confirmed.'); });
  }
  async function checkHealth() {
    setHealth(null);
    try {
      const r = await fetch(apiV1.replace(/\/api\/v1$/, '') + '/health', { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      const body = await r.json();
      if (mounted.current) setHealth({ checked: Date.now(), ok: r.ok && body?.ok === true && body?.service === '@lvtransport/api' });
    } catch { if (mounted.current) setHealth({ checked: Date.now(), ok: false }); }
  }
  const fresh = Boolean(snapshot && !error && clock - snapshot.at <= 45000);
  const operational = snapshot?.bookings.filter(booking => !closed.has(booking.status)) ?? [];
  const locations = currentLocations(snapshot?.bookings ?? [], clock);
  const available = snapshot?.drivers.filter(driver => { const age = clock - Date.parse(driver.lastSeenAt); return driver.status === 'available' && Number.isFinite(age) && age >= 0 && age <= 120000; }) ?? [];
  const transitions = snapshot?.bookings.flatMap(booking => booking.transitions.map(event => ({ ...event, booking: booking.referenceCode })))
    .filter(event => Number.isFinite(Date.parse(event.occurredAt))).sort((a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt)) ?? [];
  const attention = snapshot?.bookings.filter(booking => booking.status === 'pending' || booking.status === 'failed') ?? [];
  const bucketCount = Math.min(days, 14);
  const bucketWidth = days * 86400000 / bucketCount;
  const tripCounts = Array<number>(bucketCount).fill(0);
  for (const booking of snapshot?.bookings ?? []) {
    if (booking.status !== 'completed') continue;
    const completed = booking.transitions.find(event => event.to === 'completed');
    const age = clock - Date.parse(completed?.occurredAt ?? '');
    if (age >= 0 && age <= days * 86400000) {
      tripCounts[Math.max(0, bucketCount - 1 - Math.floor(age / bucketWidth))]++;
    }
  }
  const tripPeak = Math.max(1, ...tripCounts);
  const points = fresh ? locations.flatMap(booking => booking.location ? [{
    referenceCode: booking.referenceCode, lat: booking.location.lat, lng: booking.location.lng,
  }] : []) : [];
  const select = (id: string) => { setSection(id); setMenuOpen(false); };
  const activeTitle = navigation.find(([id]) => id === section)?.[2] ?? 'Executive Overview';
  const bookingsTable = (list: Booking[]) => !snapshot ? <Unavailable text="Sign in to load operational bookings." /> : !list.length ? <Unavailable text="No bookings in this view." /> : <div className="fd-table-wrap"><table><thead><tr><th>Reference</th><th>Route</th><th>Schedule</th><th>Status</th></tr></thead><tbody>{list.map(booking => <tr key={booking.id}><td>{booking.referenceCode}</td><td>{booking.pickup} → {booking.destination}</td><td>{formatTime(booking.scheduleAt)}</td><td><span className="fd-tag">{booking.status}</span></td></tr>)}</tbody></table></div>;
  const events = <Panel title="Live Activity Feed" eyebrow="Recorded lifecycle events">
    {!snapshot ? <Unavailable text="Sign in to load recorded events." /> : !transitions.length ? <Unavailable text="No recorded lifecycle events." /> : <ul className="fd-feed">{transitions.slice(0, 8).map((event, i) => <li key={`${event.booking}-${i}`}><time>{formatTime(event.occurredAt)}</time><span>{event.to}</span><strong>{event.booking}</strong></li>)}</ul>}
    <p className="fd-note">Updates with the operational snapshot.</p></Panel>;
  const systemHealth = <Panel title="System Health Overview" eyebrow="Verified checks only"><div className="fd-health-grid">
    <div><span className="fd-icon">⌁</span><h3>API Service</h3><p>{health ? health.ok ? 'Liveness confirmed' : 'Not confirmed' : 'Not checked'}</p>{health && <small>{formatTime(health.checked)}</small>}<button onClick={() => void checkHealth()}>Check liveness</button></div>
    {['Database integrity', 'Message Queue', 'Payment System', 'Notification Service', 'Runtime continuity'].map(name => <div key={name}><span className="fd-icon">◇</span><h3>{name}</h3><p>Not verified</p></div>)}
    </div><p className="fd-note">An HTTP response does not certify provider readiness or continuity.</p></Panel>;
  const moniPanel = <Panel title="MONI CORE ASSISTANT" eyebrow="Governed integration pending"><div className="fd-moni-intro"><span className="fd-orb">✧</span><div>Your executive AI partner<br /><span className="fd-tag">Not connected</span></div></div><div className="fd-brief"><p>Operational observations are shown only after server verification.</p><p>Conversation, recommendations and governance actions are not connected in this release.</p></div><div className="fd-suggestions"><a href="/admin">Open operational administration ↗</a><button onClick={() => select('audit')}>View recorded lifecycle</button><button onClick={() => select('health')}>Inspect system checks</button></div><label className="fd-ask">ASK MONI<input disabled placeholder="Conversational backend not connected" /></label><button className="fd-wide" disabled title="Voice integration is not available">♩ Voice Command · unavailable</button><p className="fd-note">No authority, security or compliance certification is implied by this interface.</p></Panel>;
  return <div className="founder-shell">
    <aside className={`fd-sidebar ${menuOpen ? 'fd-open' : ''}`}><a className="fd-brand" href="/"><img src="/brand/lv-logo-header.svg" alt="LV Transport" /><span>FOUNDER OS</span></a><nav aria-label="Founder navigation">{navigation.map(([id, icon, name]) => <button key={id} aria-current={section === id ? 'page' : undefined} onClick={() => select(id)}><span aria-hidden="true">{icon}</span>{name}</button>)}</nav><div className="fd-sidebar-state"><small>DATA CONNECTION</small><p><span className={`fd-dot ${fresh ? 'fd-dot-ok' : ''}`} />{fresh ? 'Snapshot received' : identity ? 'Awaiting current data' : 'Not authenticated'}</p><small>{snapshot ? `Observed ${formatTime(snapshot.at)}` : 'No operational observations loaded'}</small></div><div className="fd-person"><span className="fd-avatar">LV</span><div><strong>{identity ? 'Verified operator' : 'Operator access'}</strong><small>{identity ? `${identity.role} · read-only view` : 'Sign-in required for data'}</small></div></div><p className="fd-note">Governance authority is not granted by admin access.</p><a href="/" className="fd-back">← LV Transport</a></aside>
    <div className="fd-content"><header className="fd-topbar"><button className="fd-mobile-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(value => !value)}>☰</button><div><span className="fd-icon">♧</span> Founder OS <small>· Governance & Intelligence Operating System</small></div><div className="fd-top-actions"><span className="fd-tag">{fresh ? 'Observed data' : 'No live assurance'}</span>{identity && <button disabled={busy} onClick={() => void logout()}>Sign out</button>}</div></header>
      <main className="fd-main"><div className="fd-title"><div><h1>{activeTitle}</h1><span>Operational overview · LV Transport</span></div><div className="fd-period" aria-label="Completed ride period">{[7, 30, 90, 365].map(period => <button key={period} aria-pressed={days === period} onClick={() => setDays(period)}>{period === 365 ? '1Y' : `${period}D`}</button>)}</div></div>
        {error && <p role="alert" className="fd-alert">{error}</p>}
        {!identity && <EmailLinkForm createProvider={() => createLVTransportFirebaseProvider('founder')} busy={busy}
          onSignIn={(details, remember) => authenticate('interactive', details, remember)}
          onGoogle={remember => authenticate('interactive', undefined, remember)} />}
        {!identity && <p className="fd-access">Sign in with your authorized Founder OS account to inspect operational data.</p>}
        <div className="fd-kpis">{[
          ['Total Rides', snapshot ? String(completedInPeriod(snapshot.bookings, days, clock)) : '—', `Completed in the last ${days} days`],
          ['Total Revenue', '—', 'Financial source not connected'],
          ['Active Trips', snapshot ? String(operational.filter(b => ['en_route', 'arrived', 'in_progress'].includes(b.status)).length) : '—', 'From recorded booking lifecycle'],
          ['Available Drivers', snapshot ? String(available.length) : '—', 'Fresh reported availability'],
          ['Registered Vehicles', snapshot ? String(snapshot.vehicles.length) : '—', 'Own and external fleet'],
          ['Runtime Health', '—', 'Continuity not verified'],
        ].map(([label, value, note]) => <article key={label}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>)}</div>
        {snapshot && <p className={`fd-observation ${fresh ? '' : 'fd-stale'}`}>{fresh ? 'Snapshot received' : 'STALE — previously observed values'} · {formatTime(snapshot.at)} · <button disabled={refreshing} onClick={() => { if (client.current) void refresh(client.current, generation.current); }}>{refreshing ? 'Refreshing…' : 'Refresh'}</button></p>}
        {section === 'overview' ? <><div className="fd-dashboard-grid"><div className="fd-column"><Panel title="Attention Queue" eyebrow="Recorded exceptions and pending requests">{!snapshot ? <Unavailable text="Sign in to inspect the queue." /> : !attention.length ? <Unavailable text="No pending or failed bookings in the loaded snapshot." /> : <ul className="fd-queue">{attention.slice(0, 6).map(booking => <li key={booking.id}><span className="fd-tag">{booking.status}</span><span>{booking.referenceCode}</span><small>{formatTime(booking.scheduleAt)}</small></li>)}</ul>}<a href="/admin" className="fd-panel-link">Open Control Tower →</a></Panel><Panel title="Runtime Status" eyebrow="Evidence required"><div className="fd-runtime-grid">{['Production', 'Development', 'Edge Network', 'Mirror (DR)'].map(name => <div key={name}><h3>{name}</h3><strong>—</strong><small>Not verified</small></div>)}</div></Panel>{events}</div>
          <div className="fd-column"><Panel title="Live Operations Map" eyebrow="Antwerp · Driver-reported positions">
            <FounderOperationsMap points={points} caption={!identity ? 'Sign in to see shared positions.'
              : !fresh ? 'Waiting for current operational data.' : points.length ? `${points.length} fresh shared positions` : 'No fresh shared positions.'} />
          </Panel><Panel title="Trip Performance" eyebrow={`Completed trips · Last ${days} days`}>
            {snapshot ? <div className="fd-trip-chart" aria-label="Completed trips by time interval">
              {tripCounts.map((count, index) => <div key={index} className="fd-trip-bar">
                <span>{count}</span><div style={{ height: `${count / tripPeak * 100}%` }}
                  aria-label={`${count} trips ending ${formatTime(clock - (bucketCount - 1 - index) * bucketWidth)}`} />
              </div>)}
            </div> : <Unavailable text="Sign in to view completed trips." />}
            <p className="fd-note">Revenue data source unavailable.</p>
          </Panel><Panel title="Incident Analysis" eyebrow="Incident data"><Unavailable text="Incident data source unavailable." /></Panel></div>
          <div className="fd-column">{moniPanel}<Panel title="Pending Decisions" eyebrow="Separate governance authority"><Unavailable text="No approval provider connected. No decisions can be approved from this view." /></Panel><Panel title="Strategic Initiatives" eyebrow="Source not connected"><Unavailable text="No verified roadmap or progress records connected." /></Panel></div></div>{systemHealth}</>
          : section === 'operations' || section === 'control' || section === 'attention' ? <Panel title={activeTitle}>{bookingsTable(section === 'attention' ? attention : snapshot?.bookings ?? [])}<a className="fd-panel-link" href="/admin">Manage bookings in the authorized Admin portal →</a></Panel>
          : section === 'drivers' ? <div className="fd-two-columns"><Panel title="Drivers">{!snapshot ? <Unavailable text="Sign in to load authorized driver observations." /> : !snapshot.drivers.length ? <Unavailable text="No driver observations recorded." /> : <ul className="fd-feed">{snapshot.drivers.map(driver => <li key={driver.id}><strong>{driver.name}</strong><span>{clock - Date.parse(driver.lastSeenAt) > 120000 ? 'unknown' : driver.status}</span><small>{formatTime(driver.lastSeenAt)}</small></li>)}</ul>}</Panel><Panel title="Vehicles">{!snapshot ? <Unavailable text="Sign in to load registered vehicles." /> : !snapshot.vehicles.length ? <Unavailable text="No registered vehicles." /> : <ul className="fd-feed">{snapshot.vehicles.map(vehicle => <li key={vehicle.id}><strong>{vehicle.registration}</strong><span>{vehicle.name}</span><small>{vehicle.fleetType}</small></li>)}</ul>}</Panel></div>
          : section === 'audit' ? <>{events}<Panel title="Governance Decision Log"><Unavailable text="Lifecycle events above are not governance approvals. No governance decision source is connected." /></Panel></>
          : section === 'health' ? systemHealth : section === 'moni' ? moniPanel
          : <Panel title={activeTitle}><Unavailable text="This source is not connected. No operational values or actions are available for this section." /></Panel>}
      </main><footer className="fd-footer">Authority flows downward. Evidence flows upward.<span>Founder OS · observations require evidence</span></footer>
    </div></div>;
}

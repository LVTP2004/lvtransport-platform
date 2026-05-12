import { useEffect, useMemo, useState, type ReactNode } from 'react';

type MetricCardProps = {
  title: string;
  value: string;
  trend?: string;
  tone?: 'gold' | 'emerald' | 'blue' | 'rose';
};

function MetricCard({ title, value, trend, tone = 'gold' }: MetricCardProps) {
  const toneClass = {
    gold: 'from-amber-400/20 to-amber-300/5 border-amber-400/30 text-amber-200',
    emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-400/30 text-emerald-200',
    blue: 'from-sky-400/20 to-sky-300/5 border-sky-400/30 text-sky-200',
    rose: 'from-rose-400/20 to-rose-300/5 border-rose-400/30 text-rose-200',
  }[tone];

  return <article className={`rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-black/20`}><p className="text-xs uppercase tracking-[0.2em] text-zinc-300">{title}</p><p className="mt-3 text-2xl font-semibold text-white">{value}</p>{trend && <p className="mt-2 text-xs text-zinc-300">{trend}</p>}</article>;
}

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30"><div className="mb-4 flex items-center gap-2 text-amber-300">{icon}<h2 className="text-sm font-semibold uppercase tracking-[0.18em]">{title}</h2></div>{children}</section>;
}

type AdminBooking = { id: string; referenceCode: string; serviceType: string; status: string; scheduledAt: string };
type DriverLocation = { driverId: string; name: string; vehicleCode: string; status: 'on-trip'|'available'|'break'; lat: number; lng: number; speedKph: number; lastUpdateIso: string; activeBookingRef?: string };

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const navItems = [{ label: 'Dashboard', icon: '◫' },{ label: 'Bookings', icon: '◈' },{ label: 'Dispatch', icon: '⌖' },{ label: 'Fleet', icon: '▣' },{ label: 'Drivers', icon: '◍' },{ label: 'Incidents', icon: '⚠' },{ label: 'Settings', icon: '⚙' }];
const notificationFeed = ['New booking BK-2048 requires dispatcher review','Driver assigned for BK-2041, customer notified','Delivery retry queued for BK-2038 (mock_dev provider)'];
const mapBounds = { north: 36.278, south: 36.049, west: -115.302, east: -114.977 };
const seedDriverLocations: DriverLocation[] = [
  { driverId: 'DRV-1001', name: 'Nina R.', vehicleCode: 'LV-44', status: 'on-trip', lat: 36.1141, lng: -115.1729, speedKph: 34, lastUpdateIso: new Date().toISOString(), activeBookingRef: 'BK-2048' },
  { driverId: 'DRV-1020', name: 'Omar V.', vehicleCode: 'LV-12', status: 'available', lat: 36.1037, lng: -115.1606, speedKph: 0, lastUpdateIso: new Date().toISOString() },
  { driverId: 'DRV-1044', name: 'Ari D.', vehicleCode: 'LV-61', status: 'break', lat: 36.1209, lng: -115.1372, speedKph: 0, lastUpdateIso: new Date().toISOString() },
  { driverId: 'DRV-1059', name: 'Luca P.', vehicleCode: 'LV-03', status: 'on-trip', lat: 36.0845, lng: -115.1538, speedKph: 41, lastUpdateIso: new Date().toISOString(), activeBookingRef: 'BK-2041' }
];

const randomStep = (base: number, range = 0.0025) => Number((base + (Math.random() - 0.5) * range).toFixed(6));
const nextStatus = (current: DriverLocation['status']) => (Math.random() < 0.75 ? current : current === 'on-trip' ? 'available' : 'on-trip');
const statusTone = (status: DriverLocation['status']) => status === 'on-trip' ? 'text-emerald-300' : status === 'available' ? 'text-sky-300' : 'text-amber-200';
const latToTop = (lat: number) => Math.max(6, Math.min(94, ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100));
const lngToLeft = (lng: number) => Math.max(6, Math.min(94, ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100));

export function App() {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [driverLocations, setDriverLocations] = useState<DriverLocation[]>(seedDriverLocations);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/bookings`);
        const payload = await res.json();
        setBookings(payload.bookings ?? []);
      } catch {
        setBookings([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDriverLocations((previous) => previous.map((driver) => {
        const status = nextStatus(driver.status);
        const moving = status === 'on-trip';
        return { ...driver, status, lat: moving ? randomStep(driver.lat) : driver.lat, lng: moving ? randomStep(driver.lng) : driver.lng, speedKph: moving ? Math.max(18, Math.round(driver.speedKph + (Math.random() * 10 - 3))) : 0, lastUpdateIso: new Date().toISOString() };
      }));
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  const activeBookings = useMemo(() => bookings.filter((b) => ['assigned', 'in_progress', 'enroute', 'active'].includes(b.status.toLowerCase())), [bookings]);

  return <main className="min-h-screen bg-zinc-900 text-zinc-100"><div className="grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]"><aside className="border-r border-zinc-800 bg-black/90 p-6"><div className="mb-8"><p className="text-xs uppercase tracking-[0.28em] text-zinc-500">LV Transport</p><h1 className="mt-1 text-2xl font-bold text-amber-300">Control Tower</h1></div><nav className="space-y-2">{navItems.map(({ label, icon }, index) => <button key={label} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${index === 0 ? 'bg-amber-400/20 text-amber-200' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`}><span className="w-4 text-center">{icon}</span>{label}</button>)}</nav></aside><div className="flex flex-col"><header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-4"><div><p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Operations Center</p><p className="text-lg font-medium text-white">Regional Dispatch & Service Health</p></div></header><div className="space-y-5 p-5"><section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><MetricCard title="Revenue Today" value="$84,290" trend="+6.4% vs yesterday" tone="gold" /><MetricCard title="Active Rides" value="148" trend="12 nearing destination" tone="emerald" /><MetricCard title="Driver Utilization" value="91%" trend="Across 3 operating zones" tone="blue" /><MetricCard title="Critical Alerts" value="3" trend="2 requires dispatch intervention" tone="rose" /></section>

<section className="grid gap-5 xl:grid-cols-3"><div className="space-y-5 xl:col-span-2"><Panel title="Realtime Operations Map" icon={<span>🛰</span>}><div className="grid gap-4 lg:grid-cols-[2fr_1fr]"><div className="relative min-h-[260px] rounded-xl border border-zinc-700 bg-zinc-900/90"><div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_55%)]" />{driverLocations.map((d) => <div key={d.driverId} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ top: `${latToTop(d.lat)}%`, left: `${lngToLeft(d.lng)}%` }}><div className={`h-3 w-3 rounded-full ${d.status === 'on-trip' ? 'bg-emerald-400' : d.status === 'available' ? 'bg-sky-400' : 'bg-amber-300'}`} /><p className="mt-1 whitespace-nowrap text-[10px] text-zinc-300">{d.vehicleCode}</p></div>)}</div><div className="space-y-2 text-xs">{driverLocations.map((driver) => <div key={driver.driverId} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2"><p className="font-medium text-zinc-100">{driver.name} <span className="text-zinc-400">({driver.vehicleCode})</span></p><p className={statusTone(driver.status)}>{driver.status.toUpperCase()} • {driver.speedKph} km/h</p><p className="text-zinc-400">{driver.activeBookingRef ? `Booking ${driver.activeBookingRef}` : 'No active booking'}</p></div>)}</div></div><div className="mt-3 grid gap-2 text-xs text-zinc-300 sm:grid-cols-3"><p className="rounded-lg bg-zinc-900 p-2">Live drivers: <span className="text-white">{driverLocations.length}</span></p><p className="rounded-lg bg-zinc-900 p-2">Active bookings: <span className="text-white">{activeBookings.length}</span></p><p className="rounded-lg bg-zinc-900 p-2">GPS stream: <span className="text-emerald-300">ready abstraction</span></p></div></Panel>
<Panel title="Booking Management" icon={<span>◈</span>}><div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-sm"><thead className="text-xs uppercase tracking-[0.16em] text-zinc-400"><tr>{['Reference','Service','Status','Schedule'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead><tbody>{bookings.map((row) => <tr key={row.id} className="border-t border-zinc-800 text-zinc-200"><td className="px-2 py-3">{row.referenceCode}</td><td className="px-2 py-3">{row.serviceType}</td><td className="px-2 py-3">{row.status}</td><td className="px-2 py-3">{new Date(row.scheduledAt).toLocaleString()}</td></tr>)}</tbody></table></div></Panel></div>
<div className="space-y-5"><Panel title="Live Status Widgets" icon={<span>◌</span>}><div className="space-y-2 text-sm text-zinc-300"><p className="rounded-lg bg-zinc-900 p-2">System Health: <span className="text-emerald-300">Stable</span></p><p className="rounded-lg bg-zinc-900 p-2">Avg Wait Time: <span className="text-amber-200">5m 42s</span></p><p className="rounded-lg bg-zinc-900 p-2">Traffic Index: <span className="text-rose-300">High</span></p></div></Panel><Panel title="Notification Queue" icon={<span>🔔</span>}><ul className="space-y-2 text-sm text-zinc-300">{notificationFeed.map((item) => <li key={item} className="rounded-lg border border-zinc-800 bg-zinc-900 p-2">{item}</li>)}</ul></Panel></div></section></div></div></div></main>;
}

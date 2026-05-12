import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const navItems = [{ label: 'Dashboard', icon: '◫' }, { label: 'Bookings', icon: '◈' }, { label: 'Dispatch', icon: '⌖' }, { label: 'Fleet', icon: '▣' }, { label: 'Drivers', icon: '◍' }, { label: 'Incidents', icon: '⚠' }, { label: 'Settings', icon: '⚙' }];
function MetricCard({ title, value, trend, tone = 'gold' }) {
    const toneClass = { gold: 'from-amber-400/20 to-amber-300/5 border-amber-400/30 text-amber-200', emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-400/30 text-emerald-200', blue: 'from-sky-400/20 to-sky-300/5 border-sky-400/30 text-sky-200', rose: 'from-rose-400/20 to-rose-300/5 border-rose-400/30 text-rose-200' }[tone];
    return _jsxs("article", { className: `rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-black/20`, children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-300", children: title }), _jsx("p", { className: "mt-3 text-2xl font-semibold text-white", children: value }), trend && _jsx("p", { className: "mt-2 text-xs text-zinc-300", children: trend })] });
}
function Panel({ title, icon, children }) {
    return _jsxs("section", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-amber-300", children: [icon, _jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.18em]", children: title })] }), children] });
}
const normalizeBookingStatus = (status) => {
    const s = status.toLowerCase();
    if (['pending', 'accepted', 'quoted', 'confirmed', 'available'].includes(s))
        return 'pending';
    if (s === 'assigned')
        return 'assigned';
    if (['onderweg', 'arrived', 'in_progress', 'enroute', 'on_route', 'active'].includes(s))
        return 'on_route';
    if (['completed', 'done'].includes(s))
        return 'completed';
    if (s === 'cancelled')
        return 'cancelled';
    return 'other';
};
const normalizeDriverState = (state) => {
    const s = state.toLowerCase();
    if (s === 'onderweg')
        return 'on_route';
    if (['offline', 'available', 'assigned', 'arrived', 'in_progress', 'completed'].includes(s))
        return s;
    return 'unknown';
};
export function App() {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [syncState, setSyncState] = useState('recovering');
    const [lastSyncIso, setLastSyncIso] = useState('');
    const [refreshCycle, setRefreshCycle] = useState(0);
    const [statusFilter, setStatusFilter] = useState('all');
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
            }
            catch {
                setSyncState('degraded');
            }
            finally {
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
    return _jsx("main", { className: "min-h-screen bg-zinc-900 text-zinc-100", children: _jsxs("div", { className: "grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]", children: [_jsxs("aside", { className: "border-r border-zinc-800 bg-black/90 p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.28em] text-zinc-500", children: "LV Transport" }), _jsx("h1", { className: "mt-1 text-2xl font-bold text-amber-300", children: "Control Tower" })] }), _jsx("nav", { className: "space-y-2", children: navItems.map(({ label, icon }, index) => _jsxs("button", { className: `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${index === 0 ? 'bg-amber-400/20 text-amber-200' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`, children: [_jsx("span", { className: "w-4 text-center", children: icon }), label] }, label)) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("header", { className: "flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Operations Center" }), _jsx("p", { className: "text-lg font-medium text-white", children: "Regional Dispatch & Service Health" })] }), _jsxs("p", { className: "text-xs text-zinc-400", children: ["Sync: ", _jsx("span", { className: syncState === 'live' ? 'text-emerald-300' : syncState === 'recovering' ? 'text-amber-200' : 'text-rose-300', children: syncState.toUpperCase() }), " \u2022 cycle ", refreshCycle] })] }), _jsxs("div", { className: "space-y-5 p-5", children: [_jsxs("section", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { title: "Realtime Bookings", value: `${bookingsWithOps.length}`, trend: `${activeBookings.length} actively supervised`, tone: "gold" }), _jsx(MetricCard, { title: "Driver Operations", value: `${normalizedDrivers.length}`, trend: `${normalizedDrivers.filter((d) => d.normalizedState === 'on_route').length} on route`, tone: "emerald" }), _jsx(MetricCard, { title: "Moni Escalations", value: `${unresolvedIncidents.length}`, trend: "AI-human escalation visibility", tone: "blue" }), _jsx(MetricCard, { title: "Operational Warnings", value: `${staleBookings.length + disconnectedDrivers.length}`, trend: "stale/disconnected indicators", tone: "rose" })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("div", { className: "space-y-5 xl:col-span-2", children: [_jsxs(Panel, { title: "Booking Lifecycle Supervision", icon: _jsx("span", { children: "\u25C8" }), children: [_jsx("div", { className: "mb-3 flex flex-wrap gap-2", children: ['all', 'pending', 'assigned', 'on_route', 'completed', 'cancelled'].map((filter) => _jsx("button", { onClick: () => setStatusFilter(filter), className: `rounded-lg border px-2 py-1 text-xs uppercase ${statusFilter === filter ? 'border-amber-300 text-amber-200' : 'border-zinc-700 text-zinc-300'}`, children: filter }, filter)) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[900px] text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-[0.16em] text-zinc-400", children: _jsx("tr", { children: ['Reference', 'Service', 'Status', 'Lifecycle', 'Immutable', 'Timestamps', 'Ops Flags'].map((h) => _jsx("th", { className: "px-2 py-2", children: h }, h)) }) }), _jsx("tbody", { children: filteredBookings.map((row) => _jsxs("tr", { className: "border-t border-zinc-800 text-zinc-200", children: [_jsx("td", { className: "px-2 py-3", children: row.referenceCode ?? row.code ?? row.id }), _jsx("td", { className: "px-2 py-3", children: row.serviceType }), _jsx("td", { className: "px-2 py-3", children: row.status }), _jsx("td", { className: "px-2 py-3", children: row.normalizedStatus }), _jsx("td", { className: "px-2 py-3", children: row.immutable ? 'locked' : 'mutable' }), _jsxs("td", { className: "px-2 py-3 text-xs", children: [row.createdAt ? new Date(row.createdAt).toLocaleTimeString() : '-', " / ", row.updatedAt ? new Date(row.updatedAt).toLocaleTimeString() : '-'] }), _jsxs("td", { className: "px-2 py-3 text-xs", children: [row.duplicateTransition ? 'duplicate blocked' : 'clean', " ", row.stale ? '• stale' : ''] })] }, row.id)) })] }) })] }), _jsx(Panel, { title: "Driver Operations", icon: _jsx("span", { children: "\u25CD" }), children: _jsx("div", { className: "space-y-2 text-xs", children: normalizedDrivers.map((driver) => _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900 p-2", children: [_jsxs("p", { className: "font-medium text-zinc-100", children: [driver.driverId, " ", _jsx("span", { className: "text-zinc-400", children: driver.activeBookingId ? `• booking ${driver.activeBookingId}` : '• no active ride' })] }), _jsxs("p", { className: "text-zinc-300", children: ["state: ", driver.normalizedState, " \u2022 telemetry: ", driver.location ? `${driver.location.lat.toFixed(4)}, ${driver.location.lng.toFixed(4)}` : 'awaiting GPS', " \u2022 speed ", driver.location?.speed ?? 0] })] }, driver.driverId)) }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(Panel, { title: "Moni Escalation Visibility", icon: _jsx("span", { children: "\uD83E\uDD16" }), children: _jsxs("div", { className: "space-y-2 text-sm text-zinc-300", children: [_jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Escalation queue: ", _jsx("span", { className: "text-white", children: unresolvedIncidents.length })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Audit events visible: ", _jsx("span", { className: "text-white", children: incidents.length })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Assistant-human handoff: ", _jsx("span", { className: "text-emerald-300", children: "prepared" })] })] }) }), _jsx(Panel, { title: "Operational Monitoring", icon: _jsx("span", { children: "\u26A0" }), children: _jsxs("ul", { className: "space-y-2 text-sm text-zinc-300", children: [_jsxs("li", { className: `rounded-lg p-2 ${syncState === 'degraded' ? 'border border-rose-500/30 bg-rose-500/10' : 'border border-emerald-500/30 bg-emerald-500/10'}`, children: ["Realtime sync: ", syncState === 'degraded' ? 'degraded - recovery active' : 'healthy'] }), _jsxs("li", { className: "rounded-lg border border-zinc-800 bg-zinc-900 p-2", children: ["Stale bookings: ", staleBookings.length] }), _jsxs("li", { className: "rounded-lg border border-zinc-800 bg-zinc-900 p-2", children: ["Disconnected sessions (drivers): ", disconnectedDrivers.length] }), _jsx("li", { className: "rounded-lg border border-zinc-800 bg-zinc-900 p-2", children: "Booking recovery visibility: enabled" })] }) })] })] })] })] })] }) });
}

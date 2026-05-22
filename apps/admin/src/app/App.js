import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AccountStatus, UserRole } from '@lvtransport/auth';
import { adminAuthProvider, adminAuthService } from '../modules/auth/services/auth-client.service';
export function App() {
    const [authState, setAuthState] = useState({ isAuthenticated: false, isLoading: true });
    const [email, setEmail] = useState('admin@lvtransport.dev');
    const [password, setPassword] = useState('password123');
    const [allowed, setAllowed] = useState(false);
    useEffect(() => { adminAuthService.getInitialState().then(setAuthState); }, []);
    const login = async () => { const t = await adminAuthService.signIn({ email, password }); const u = await adminAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.ADMIN) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
    const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
    if (!authState.isAuthenticated)
        return _jsxs("main", { className: 'min-h-screen bg-zinc-900 p-8 text-white', children: [_jsx("h1", { className: 'text-3xl mb-4', children: "Admin Login" }), _jsx("input", { className: 'text-black p-2 mr-2', value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { className: 'text-black p-2 mr-2', type: 'password', value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { className: 'bg-amber-400 text-black px-3 py-2 rounded', onClick: login, children: "Sign in" })] });
    if (!allowed)
        return _jsxs("main", { className: 'min-h-screen bg-zinc-900 p-8 text-white', children: ["Access denied", _jsx("button", { onClick: logout, children: "Logout" })] });
    return _jsxs("main", { className: 'min-h-screen bg-zinc-900 text-white p-8', children: [_jsx("h1", { className: 'text-3xl text-amber-300', children: "Control Tower" }), _jsx("p", { children: "Authenticated admin session persisted with Firebase placeholder config." }), _jsx("button", { onClick: logout, children: "Logout" })] });
function MetricCard({ title, value, trend, tone = 'gold' }) {
    const toneClass = {
        gold: 'from-amber-400/20 to-amber-300/5 border-amber-400/30 text-amber-200',
        emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-400/30 text-emerald-200',
        blue: 'from-sky-400/20 to-sky-300/5 border-sky-400/30 text-sky-200',
        rose: 'from-rose-400/20 to-rose-300/5 border-rose-400/30 text-rose-200',
    }[tone];
    return (_jsxs("article", { className: `rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-black/20 transition duration-300 hover:-translate-y-0.5`, children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-300", children: title }), _jsx("p", { className: "mt-3 text-2xl font-semibold text-white", children: value }), trend && _jsx("p", { className: "mt-2 text-xs text-zinc-300", children: trend })] }));
}
function Panel({ title, icon, children }) {
    return (_jsxs("section", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-sm", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-amber-300", children: [icon, _jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.18em]", children: title })] }), children] }));
}
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
    ['BK-10924', 'Airport Transfer', 'Scheduled', 'Alicia D.', '10:40', 'paid'],
    ['BK-10925', 'Corporate Shuttle', 'In Progress', 'Lars M.', '10:55', 'requires_action'],
    ['BK-10926', 'VIP Point-to-Point', 'Delayed', 'Soren K.', '11:10', 'payment_failed_retrying'],
    ['BK-10927', 'Hotel Pickup', 'Completed', 'Priya T.', '11:30', 'refunded_pending_approval'],
];
export function App() {
    return (_jsx("main", { className: "min-h-screen bg-zinc-900 text-zinc-100", children: _jsxs("div", { className: "grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]", children: [_jsxs("aside", { className: "border-r border-zinc-800 bg-black/90 p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.28em] text-zinc-500", children: "LV Transport" }), _jsx("h1", { className: "mt-1 text-2xl font-bold text-amber-300", children: "Control Tower" })] }), _jsx("nav", { className: "space-y-2", children: navItems.map(({ label, icon }, index) => (_jsxs("button", { className: `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${index === 0
                                    ? 'bg-amber-400/20 text-amber-200'
                                    : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`, children: [_jsx("span", { className: "w-4 text-center", children: icon }), " ", label] }, label))) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsxs("header", { className: "flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Operations Center" }), _jsx("p", { className: "text-lg font-medium text-white", children: "Regional Dispatch & Service Health" })] }), _jsxs("div", { className: "flex items-center gap-3", children: [_jsx("button", { className: "rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm transition hover:border-amber-300 hover:text-amber-200", children: "Today" }), _jsx("button", { className: "rounded-xl border border-zinc-700 bg-zinc-900 p-2 transition hover:border-amber-300 hover:text-amber-200", children: _jsx("span", { children: "\uD83D\uDD14" }) })] })] }), _jsxs("div", { className: "space-y-5 p-5", children: [_jsxs("section", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { title: "Revenue Today", value: "$84,290", trend: "+6.4% vs yesterday", tone: "gold" }), _jsx(MetricCard, { title: "Active Rides", value: "148", trend: "12 nearing destination", tone: "emerald" }), _jsx(MetricCard, { title: "Driver Utilization", value: "91%", trend: "Across 3 operating zones", tone: "blue" }), _jsx(MetricCard, { title: "Critical Alerts", value: "3", trend: "2 requires dispatch intervention", tone: "rose" })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("div", { className: "space-y-5 xl:col-span-2", children: [_jsx(Panel, { title: "Booking Management", icon: _jsx("span", { children: "\u25C8" }), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[620px] text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-[0.16em] text-zinc-400", children: _jsx("tr", { children: ['ID', 'Service', 'Status', 'Driver', 'ETA', 'Payment'].map((h) => (_jsx("th", { className: "px-2 py-2", children: h }, h))) }) }), _jsx("tbody", { children: bookings.map((row) => (_jsx("tr", { className: "border-t border-zinc-800 text-zinc-200 transition hover:bg-zinc-900/70", children: row.map((cell) => (_jsx("td", { className: "px-2 py-3", children: cell }, cell))) }, row[0]))) })] }) }) }), _jsxs("div", { className: "grid gap-5 md:grid-cols-2", children: [_jsx(Panel, { title: "Active Rides", icon: _jsx("span", { children: "\u25C9" }), children: _jsxs("ul", { className: "space-y-3 text-sm text-zinc-300", children: [_jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8821 \u2022 Downtown to Terminal 1 \u2022 14 min" }), _jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8830 \u2022 Convention to Bellagio \u2022 9 min" }), _jsx("li", { className: "rounded-xl bg-zinc-900/80 p-3", children: "Ride #R-8833 \u2022 Wynn to Airport \u2022 21 min" })] }) }), _jsx(Panel, { title: "Driver Monitoring", icon: _jsx("span", { children: "\u25CD" }), children: _jsx("div", { className: "grid gap-3 text-sm", children: ['On Duty 126', 'Break 14', 'Offline 8'].map((d) => (_jsx("div", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-3 transition hover:border-amber-300/40", children: d }, d))) }) })] })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(Panel, { title: "Live Status Widgets", icon: _jsx("span", { children: "\u25CC" }), children: _jsxs("div", { className: "space-y-2 text-sm text-zinc-300", children: [_jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["System Health: ", _jsx("span", { className: "text-emerald-300", children: "Stable" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Avg Wait Time: ", _jsx("span", { className: "text-amber-200", children: "5m 42s" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Traffic Index: ", _jsx("span", { className: "text-rose-300", children: "High" })] })] }) }), _jsx(Panel, { title: "Alerts & Incidents", icon: _jsx("span", { children: "\u26A0" }), children: _jsxs("ul", { className: "space-y-2 text-sm text-zinc-300", children: [_jsx("li", { className: "rounded-lg border border-rose-500/30 bg-rose-500/10 p-2", children: "Engine anomaly \u2022 Unit DV-14" }), _jsx("li", { className: "rounded-lg border border-amber-500/30 bg-amber-500/10 p-2", children: "Late pickup cluster \u2022 Sector West" }), _jsx("li", { className: "rounded-lg border border-sky-500/30 bg-sky-500/10 p-2", children: "Road closure \u2022 Strip Blvd" })] }) })] })] }), _jsxs("section", { className: "grid gap-5 lg:grid-cols-3", children: [_jsx(Panel, { title: "Dispatch Overview", icon: _jsx("span", { children: "\u2316" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "56 open dispatch tasks, 18 pending route approvals." }) }), _jsx(Panel, { title: "Fleet Overview", icon: _jsx("span", { children: "\u25A3" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "184 vehicles total \u2022 169 available \u2022 10 maintenance \u2022 5 offline." }) }), _jsx(Panel, { title: "Admin Settings", icon: _jsx("span", { children: "\u2699" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "Role profiles, escalation rules, and SLA thresholds configuration panel placeholder." }) })] }), _jsxs("section", { className: "grid gap-5 lg:grid-cols-2", children: [_jsx(Panel, { title: "Customer Activity", icon: _jsx("span", { children: "\u25CE" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "Bookings/hour peak: 94 \u2022 Repeat customer ratio: 47% \u2022 App satisfaction: 4.8/5." }) }), _jsx(Panel, { title: "Audit / Activity Log", icon: _jsx("span", { children: "\u25F7" }), children: _jsx("p", { className: "text-sm text-zinc-300", children: "10:32 Dispatch reassigned R-8821 \u2022 10:29 Refund prepared (manual approval) \u2022 10:25 Stripe test webhook accepted." }) })] })] })] })] }) }));
import { useEffect, useMemo, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be/api/v1';
const stateTone = {
    Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
    Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100',
    Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100'
};
const severityRank = { Healthy: 0, Warning: 1, Degraded: 2, Critical: 3 };
const mergeState = (...states) => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy');
export function App() {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [sync, setSync] = useState('recovering');
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
            }
            catch {
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
    const founderAttention = useMemo(() => {
        const attention = [];
        bookings.forEach((ride) => {
            if (ride.status === 'arrived')
                attention.push({ title: `Pickup waiting · ${ride.referenceCode ?? ride.id}`, state: 'Warning', reason: 'Passenger pickup confirmation pending.' });
            if (ride.status === 'failed')
                attention.push({ title: `Failed ride · ${ride.referenceCode ?? ride.id}`, state: 'Degraded', reason: 'Manual intervention required.' });
        });
        if (sync !== 'live')
            attention.push({ title: 'Realtime sync health', state: sync === 'degraded' ? 'Degraded' : 'Warning', reason: 'Websocket reconnect in progress; operational stream not fully stable.' });
        return attention.slice(0, 4);
    }, [bookings, sync]);
    const runtimeState = useMemo(() => mergeState(...founderAttention.map((a) => a.state), incidents.length > 2 ? 'Warning' : 'Healthy'), [founderAttention, incidents.length]);
    const trustLevel = runtimeState === 'Healthy' ? 'High' : runtimeState === 'Warning' ? 'Guarded' : runtimeState === 'Degraded' ? 'Stressed' : 'Critical';
    const leoSummary = useMemo(() => {
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
    return _jsx("main", { className: "min-h-screen bg-lvtp-obsidian p-4 text-zinc-100 sm:p-5", children: _jsxs("div", { className: "relative mx-auto max-w-6xl space-y-4", children: [_jsx("header", { className: "lvtp-shell rounded-3xl p-5", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Founder Cockpit" }), _jsx("h1", { className: "text-lg font-semibold text-amber-200 sm:text-xl", children: "Realtime Operations" })] })] }), _jsx("span", { className: `rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`, children: runtimeState })] }) }), _jsxs("section", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Active rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: activeRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Pending rides" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: pendingRides })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "Drivers online" }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-zinc-100", children: onlineDrivers })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: "System trust level" }), _jsx("p", { className: "mt-2 text-lg font-semibold text-amber-100", children: trustLevel }), _jsxs("p", { className: "mt-1 text-xs text-zinc-400", children: ["Sync: ", sync] })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card xl:col-span-2 rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Ride lifecycle visibility" }), _jsx("div", { className: "mt-3 space-y-3", children: bookings.map((ride) => _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-3", children: [_jsxs("div", { className: "flex items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm text-zinc-100", children: ride.referenceCode ?? ride.id }), _jsx("span", { className: "text-xs uppercase text-zinc-300", children: ride.status.replaceAll('_', ' ') })] }), _jsxs("div", { className: "mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx("p", { children: "Status sync" }), _jsxs("p", { children: ["Version ", ride.lifecycle?.version ?? '-'] }), _jsxs("p", { children: ["Pickup ", ride.pickup ?? '-'] }), _jsxs("p", { children: ["Destination ", ride.destination ?? '-'] })] })] }, ride.id)) })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Founder priorities" }), _jsx("div", { className: "mt-3 space-y-2", children: founderAttention.length ? founderAttention.map((item) => _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 p-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("p", { className: "text-sm text-zinc-100", children: item.title }), _jsx("span", { className: `rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`, children: item.state })] }), _jsx("p", { className: "mt-1 text-xs text-zinc-300", children: item.reason })] }, item.title)) : _jsx("p", { className: "text-sm text-zinc-300", children: "No founder actions required." }) })] })] }), _jsxs("section", { className: "grid gap-4 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4 xl:col-span-2", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Leo IA executive summary" }), _jsx("p", { className: "mt-3 text-sm text-zinc-100", children: leoSummary.headline }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: leoSummary.priority }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: leoSummary.report })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Operational health" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsxs("li", { children: ["Airport pickups waiting: ", bookings.filter((r) => r.status === 'arrived').length] }), _jsxs("li", { children: ["Payment retries: ", bookings.filter((r) => r.status === 'failed').length] }), _jsxs("li", { children: ["Incidents observed: ", incidents.length] }), _jsxs("li", { children: ["Moni reassurance need: ", founderAttention.some((a) => a.title.startsWith('Airport pickup')) ? 'Elevated' : 'Normal'] })] })] })] })] }) });
}

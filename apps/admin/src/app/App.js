import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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

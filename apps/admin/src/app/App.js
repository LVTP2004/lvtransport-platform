import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const statusTone = {
    assigned: 'text-amber-200 bg-amber-500/15 border-amber-400/35',
    accepted: 'text-sky-200 bg-sky-500/15 border-sky-400/35',
    en_route: 'text-violet-200 bg-violet-500/15 border-violet-400/35',
    arrived: 'text-indigo-200 bg-indigo-500/15 border-indigo-400/35',
    in_progress: 'text-cyan-200 bg-cyan-500/15 border-cyan-400/35',
    completed: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/35',
    cancelled: 'text-rose-200 bg-rose-500/15 border-rose-400/35',
    failed: 'text-rose-200 bg-rose-500/15 border-rose-400/35'
};
export function App() {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [sync, setSync] = useState('recovering');
    const [tick, setTick] = useState(0);
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
        const poll = setInterval(() => { setSync((p) => p === 'degraded' ? 'recovering' : p); load(); }, 12000);
        return () => clearInterval(poll);
    }, []);
    const active = useMemo(() => bookings.filter((b) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status)).length, [bookings]);
    const warnings = useMemo(() => incidents.filter((i) => i.severity !== 'info').length, [incidents]);
    useEffect(() => { const t = setInterval(() => setTick((v) => v + 1), 1500); return () => clearInterval(t); }, []);
    return _jsxs("main", { className: "min-h-screen bg-lvtp-obsidian p-5 text-zinc-100", children: [_jsx("div", { className: "lvtp-network absolute inset-0 pointer-events-none opacity-50" }), _jsxs("div", { className: "relative mx-auto max-w-7xl space-y-5", children: [_jsxs("header", { className: "lvtp-shell rounded-3xl p-6", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "LV Transport \u00B7 Premium Control Tower" }), _jsx("h1", { className: "text-xl font-semibold text-amber-200", children: "Realtime operationeel overzicht" })] })] }), _jsx("span", { className: `rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${sync === 'live' ? 'border-emerald-300/40 bg-emerald-400/15 text-emerald-100' : sync === 'recovering' ? 'border-amber-300/40 bg-amber-400/15 text-amber-100' : 'border-rose-300/40 bg-rose-400/15 text-rose-100'}`, children: sync })] }), _jsx("p", { className: "mt-3 text-sm text-zinc-300", children: "Professionele dispatch-opvolging voor luchthaven-, business- en VIP-service met founder-level controle." })] }), _jsx("section", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [['Boekingen', bookings.length], ['Actieve ritten', active], ['Beschikbare chauffeurs', drivers.length], ['Waarschuwingen', warnings]].map(([label, value]) => _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "text-xs uppercase text-zinc-400", children: label }), _jsx("p", { className: "mt-2 text-2xl font-semibold text-amber-100", children: value })] }, label)) }), _jsx("section", { className: "lvtp-card overflow-hidden rounded-2xl p-0", children: _jsxs("div", { className: "relative h-[60vh] min-h-[420px] bg-[#06070a]", children: [_jsx("div", { className: "absolute inset-0 opacity-35", style: { backgroundImage: 'linear-gradient(rgba(245,191,73,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(245,191,73,.08) 1px, transparent 1px)', backgroundSize: '38px 38px' } }), drivers.slice(0, 12).map((driver, index) => _jsx("div", { className: "absolute h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(245,191,73,.75)] transition-all duration-1000", style: { left: `${12 + (index * 7 + tick * 1.6) % 76}%`, top: `${16 + (index * 11 + tick) % 66}%` } }, driver.driverId)), _jsxs("div", { className: "absolute left-3 right-3 top-3 flex items-center justify-between rounded-2xl border border-white/10 bg-black/55 px-3 py-2 text-xs text-zinc-200", children: [_jsx("span", { children: "Control Tower realtime command map" }), _jsxs("span", { children: [drivers.length, " live drivers \u00B7 ", active, " active rides"] })] }), _jsx("div", { className: "absolute bottom-3 left-3 right-3 rounded-2xl border border-white/10 bg-black/55 px-3 py-2 text-xs text-zinc-300", children: "Lifecycle synchronized dispatch \u00B7 congestion and assignment awareness enabled." })] }) }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card xl:col-span-2 rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Boekingen" }), _jsx("div", { className: "mt-3 overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[700px] text-sm", children: [_jsx("thead", { className: "text-zinc-400", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2 text-left", children: "Referentie" }), _jsx("th", { className: "py-2 text-left", children: "Service" }), _jsx("th", { className: "py-2 text-left", children: "Status" }), _jsx("th", { className: "py-2 text-left", children: "Chauffeur" })] }) }), _jsx("tbody", { children: bookings.map((b) => _jsxs("tr", { className: "border-t border-zinc-800/80", children: [_jsx("td", { className: "py-2", children: b.referenceCode ?? b.code ?? b.id }), _jsx("td", { children: b.serviceType }), _jsx("td", { children: _jsx("span", { className: `inline-flex rounded-full border px-2 py-0.5 text-xs ${statusTone[b.status] ?? 'border-zinc-600 bg-zinc-800 text-zinc-200'}`, children: b.status }) }), _jsx("td", { children: b.assignedDriverId ?? 'Nog niet toegewezen' })] }, b.id)) })] }) })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Readiness" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsx("li", { children: "Synchronisatie blijft realtime actief met herstelmodus." }), _jsx("li", { children: "Rittoewijzing en escalatie volgen premium lifecycle regels." }), _jsx("li", { children: "Fallbackcommunicatie via klantnummer beschikbaar." }), _jsx("li", { children: "Founder beta monitoring staat klaar." })] })] })] })] })] });
}

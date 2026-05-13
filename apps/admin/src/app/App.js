import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
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
        const poll = setInterval(() => { setSync((p) => p === 'degraded' ? 'recovering' : p); load(); }, 12000);
        return () => clearInterval(poll);
    }, []);
    const active = useMemo(() => bookings.filter((b) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(b.status)).length, [bookings]);
    const warnings = useMemo(() => incidents.filter((i) => i.severity !== 'info').length, [incidents]);
    return _jsx("main", { className: "min-h-screen bg-zinc-950 p-5 text-zinc-100", children: _jsxs("div", { className: "mx-auto max-w-7xl space-y-5", children: [_jsxs("header", { className: "rounded-2xl border border-amber-300/25 bg-black/80 p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "LV Transport \u00B7 Control Tower" }), _jsx("h1", { className: "text-xl font-semibold text-amber-300", children: "Realtime operationeel overzicht" })] })] }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Professionele ritopvolging voor luchthaven-, business- en VIP-service." })] }), _jsxs("section", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [_jsxs("article", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: [_jsx("p", { className: "text-xs uppercase text-zinc-400", children: "Boekingen" }), _jsx("p", { className: "mt-2 text-2xl font-semibold", children: bookings.length })] }), _jsxs("article", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: [_jsx("p", { className: "text-xs uppercase text-zinc-400", children: "Actieve ritten" }), _jsx("p", { className: "mt-2 text-2xl font-semibold", children: active })] }), _jsxs("article", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: [_jsx("p", { className: "text-xs uppercase text-zinc-400", children: "Beschikbare chauffeurs" }), _jsx("p", { className: "mt-2 text-2xl font-semibold", children: drivers.length })] }), _jsxs("article", { className: "rounded-xl border border-zinc-800 bg-zinc-900 p-4", children: [_jsx("p", { className: "text-xs uppercase text-zinc-400", children: "Waarschuwingen" }), _jsx("p", { className: "mt-2 text-2xl font-semibold", children: warnings })] })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("article", { className: "xl:col-span-2 rounded-2xl border border-zinc-800 bg-zinc-900 p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Boekingen" }), _jsx("div", { className: "mt-3 overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[700px] text-sm", children: [_jsx("thead", { className: "text-zinc-400", children: _jsxs("tr", { children: [_jsx("th", { className: "py-2 text-left", children: "Referentie" }), _jsx("th", { className: "py-2 text-left", children: "Service" }), _jsx("th", { className: "py-2 text-left", children: "Status" }), _jsx("th", { className: "py-2 text-left", children: "Chauffeur" })] }) }), _jsx("tbody", { children: bookings.map((b) => _jsxs("tr", { className: "border-t border-zinc-800", children: [_jsx("td", { className: "py-2", children: b.referenceCode ?? b.code ?? b.id }), _jsx("td", { children: b.serviceType }), _jsx("td", { children: b.status }), _jsx("td", { children: b.assignedDriverId ?? 'Nog niet toegewezen' })] }, b.id)) })] }) })] }), _jsxs("article", { className: "rounded-2xl border border-zinc-800 bg-zinc-900 p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Readiness" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsxs("li", { children: ["Synchronisatie: ", _jsx("span", { className: sync === 'live' ? 'text-emerald-300' : sync === 'recovering' ? 'text-amber-300' : 'text-rose-300', children: sync })] }), _jsx("li", { children: "LV Transport volgt elke rit actief op." }), _jsx("li", { children: "Fallbackcommunicatie via klantnummer beschikbaar." }), _jsx("li", { children: "Founder beta monitoring staat klaar." })] })] })] })] }) });
}

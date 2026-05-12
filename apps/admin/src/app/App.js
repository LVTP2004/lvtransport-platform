import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
function MetricCard({ title, value, trend, tone = 'gold' }) {
    const toneClass = {
        gold: 'from-amber-400/20 to-amber-300/5 border-amber-400/30 text-amber-200',
        emerald: 'from-emerald-400/20 to-emerald-300/5 border-emerald-400/30 text-emerald-200',
        blue: 'from-sky-400/20 to-sky-300/5 border-sky-400/30 text-sky-200',
        rose: 'from-rose-400/20 to-rose-300/5 border-rose-400/30 text-rose-200',
    }[tone];
    return _jsxs("article", { className: `rounded-2xl border bg-gradient-to-br ${toneClass} p-4 shadow-lg shadow-black/20`, children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-300", children: title }), _jsx("p", { className: "mt-3 text-2xl font-semibold text-white", children: value }), trend && _jsx("p", { className: "mt-2 text-xs text-zinc-300", children: trend })] });
}
function Panel({ title, icon, children }) {
    return _jsxs("section", { className: "rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-2xl shadow-black/30", children: [_jsxs("div", { className: "mb-4 flex items-center gap-2 text-amber-300", children: [icon, _jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.18em]", children: title })] }), children] });
}
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const navItems = [{ label: 'Dashboard', icon: '◫' }, { label: 'Bookings', icon: '◈' }, { label: 'Dispatch', icon: '⌖' }, { label: 'Fleet', icon: '▣' }, { label: 'Drivers', icon: '◍' }, { label: 'Incidents', icon: '⚠' }, { label: 'Settings', icon: '⚙' }];
const notificationFeed = ['New booking BK-2048 requires dispatcher review', 'Driver assigned for BK-2041, customer notified', 'Delivery retry queued for BK-2038 (mock_dev provider)'];
const mapBounds = { north: 36.278, south: 36.049, west: -115.302, east: -114.977 };
const seedDriverLocations = [
    { driverId: 'DRV-1001', name: 'Nina R.', vehicleCode: 'LV-44', status: 'on-trip', lat: 36.1141, lng: -115.1729, speedKph: 34, lastUpdateIso: new Date().toISOString(), activeBookingRef: 'BK-2048' },
    { driverId: 'DRV-1020', name: 'Omar V.', vehicleCode: 'LV-12', status: 'available', lat: 36.1037, lng: -115.1606, speedKph: 0, lastUpdateIso: new Date().toISOString() },
    { driverId: 'DRV-1044', name: 'Ari D.', vehicleCode: 'LV-61', status: 'break', lat: 36.1209, lng: -115.1372, speedKph: 0, lastUpdateIso: new Date().toISOString() },
    { driverId: 'DRV-1059', name: 'Luca P.', vehicleCode: 'LV-03', status: 'on-trip', lat: 36.0845, lng: -115.1538, speedKph: 41, lastUpdateIso: new Date().toISOString(), activeBookingRef: 'BK-2041' }
];
const randomStep = (base, range = 0.0025) => Number((base + (Math.random() - 0.5) * range).toFixed(6));
const nextStatus = (current) => (Math.random() < 0.75 ? current : current === 'on-trip' ? 'available' : 'on-trip');
const statusTone = (status) => status === 'on-trip' ? 'text-emerald-300' : status === 'available' ? 'text-sky-300' : 'text-amber-200';
const latToTop = (lat) => Math.max(6, Math.min(94, ((mapBounds.north - lat) / (mapBounds.north - mapBounds.south)) * 100));
const lngToLeft = (lng) => Math.max(6, Math.min(94, ((lng - mapBounds.west) / (mapBounds.east - mapBounds.west)) * 100));
export function App() {
    const [bookings, setBookings] = useState([]);
    const [driverLocations, setDriverLocations] = useState(seedDriverLocations);
    const [realtimeState, setRealtimeState] = useState('connecting');
    let lastSequence = 0;
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`${API_BASE}/bookings`);
                const payload = await res.json();
                setBookings(payload.bookings ?? []);
            }
            catch {
                setBookings([]);
            }
        };
        load();
        let ws = null;
        let reconnectTimer;
        let attempts = 0;
        let active = true;
        const connect = () => {
            if (!active)
                return;
            setRealtimeState(attempts > 0 ? 'reconnecting' : 'connecting');
            const query = lastSequence > 0 ? `?lastSequence=${lastSequence}` : '';
            ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws${query}`);
            ws.onopen = () => {
                attempts = 0;
                setRealtimeState('connected');
            };
            ws.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data);
                    if (typeof payload.sequence === 'number' && payload.sequence > lastSequence)
                        lastSequence = payload.sequence;
                    if (payload.event === 'booking.snapshot' && Array.isArray(payload.payload))
                        setBookings(payload.payload);
                    if (payload.event === 'booking.updated' && payload.payload && !Array.isArray(payload.payload)) {
                        const bookingPayload = payload.payload;
                        setBookings((current) => {
                            const next = [...current];
                            const index = next.findIndex((item) => item.id === bookingPayload.id);
                            if (index >= 0)
                                next[index] = bookingPayload;
                            else
                                next.unshift(bookingPayload);
                            return next;
                        });
                    }
                }
                catch {
                    // retain last valid state on malformed payload
                }
            };
            ws.onclose = () => {
                if (!active)
                    return;
                attempts += 1;
                setRealtimeState('offline');
                const backoffMs = Math.min(15000, 1000 * 2 ** Math.min(attempts, 4));
                reconnectTimer = window.setTimeout(connect, backoffMs);
            };
            ws.onerror = () => ws?.close();
        };
        connect();
        return () => {
            active = false;
            if (reconnectTimer)
                window.clearTimeout(reconnectTimer);
            ws?.close();
        };
    }, []);
    const assignDriver = async (booking) => {
        if (booking.assignedDriverName || booking.status !== 'pending')
            return;
        await fetch(`${API_BASE}/bookings/${booking.id}/assign-driver`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driverId: 'DRV-2001', driverName: 'Marco V.', idempotencyKey: `admin-assign-${booking.id}` })
        });
    };
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
    return _jsx("main", { className: "min-h-screen bg-zinc-900 text-zinc-100", children: _jsxs("div", { className: "grid min-h-screen grid-cols-1 lg:grid-cols-[260px_1fr]", children: [_jsxs("aside", { className: "border-r border-zinc-800 bg-black/90 p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.28em] text-zinc-500", children: "LV Transport" }), _jsx("h1", { className: "mt-1 text-2xl font-bold text-amber-300", children: "Control Tower" })] }), _jsx("nav", { className: "space-y-2", children: navItems.map(({ label, icon }, index) => _jsxs("button", { className: `flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm ${index === 0 ? 'bg-amber-400/20 text-amber-200' : 'text-zinc-300 hover:bg-zinc-800/80 hover:text-white'}`, children: [_jsx("span", { className: "w-4 text-center", children: icon }), label] }, label)) })] }), _jsxs("div", { className: "flex flex-col", children: [_jsx("header", { className: "flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-5 py-4", children: _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Operations Center" }), _jsx("p", { className: "text-lg font-medium text-white", children: "Regional Dispatch & Service Health" })] }) }), _jsxs("div", { className: "space-y-5 p-5", children: [_jsxs("section", { className: "grid gap-4 sm:grid-cols-2 xl:grid-cols-4", children: [_jsx(MetricCard, { title: "Revenue Today", value: "$84,290", trend: "+6.4% vs yesterday", tone: "gold" }), _jsx(MetricCard, { title: "Active Rides", value: "148", trend: "12 nearing destination", tone: "emerald" }), _jsx(MetricCard, { title: "Driver Utilization", value: "91%", trend: "Across 3 operating zones", tone: "blue" }), _jsx(MetricCard, { title: "Critical Alerts", value: "3", trend: "2 requires dispatch intervention", tone: "rose" })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("div", { className: "space-y-5 xl:col-span-2", children: [_jsxs(Panel, { title: "Realtime Operations Map", icon: _jsx("span", { children: "\uD83D\uDEF0" }), children: [_jsxs("div", { className: "grid gap-4 lg:grid-cols-[2fr_1fr]", children: [_jsxs("div", { className: "relative min-h-[260px] rounded-xl border border-zinc-700 bg-zinc-900/90", children: [_jsx("div", { className: "absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.12),transparent_55%)]" }), driverLocations.map((d) => _jsxs("div", { className: "absolute -translate-x-1/2 -translate-y-1/2", style: { top: `${latToTop(d.lat)}%`, left: `${lngToLeft(d.lng)}%` }, children: [_jsx("div", { className: `h-3 w-3 rounded-full ${d.status === 'on-trip' ? 'bg-emerald-400' : d.status === 'available' ? 'bg-sky-400' : 'bg-amber-300'}` }), _jsx("p", { className: "mt-1 whitespace-nowrap text-[10px] text-zinc-300", children: d.vehicleCode })] }, d.driverId))] }), _jsx("div", { className: "space-y-2 text-xs", children: driverLocations.map((driver) => _jsxs("div", { className: "rounded-lg border border-zinc-800 bg-zinc-900 p-2", children: [_jsxs("p", { className: "font-medium text-zinc-100", children: [driver.name, " ", _jsxs("span", { className: "text-zinc-400", children: ["(", driver.vehicleCode, ")"] })] }), _jsxs("p", { className: statusTone(driver.status), children: [driver.status.toUpperCase(), " \u2022 ", driver.speedKph, " km/h"] }), _jsx("p", { className: "text-zinc-400", children: driver.activeBookingRef ? `Booking ${driver.activeBookingRef}` : 'No active booking' })] }, driver.driverId)) })] }), _jsxs("div", { className: "mt-3 grid gap-2 text-xs text-zinc-300 sm:grid-cols-3", children: [_jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Live drivers: ", _jsx("span", { className: "text-white", children: driverLocations.length })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Active bookings: ", _jsx("span", { className: "text-white", children: activeBookings.length })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["GPS stream: ", _jsx("span", { className: "text-emerald-300", children: "ready abstraction" })] })] })] }), _jsx(Panel, { title: "Booking Management", icon: _jsx("span", { children: "\u25C8" }), children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full min-w-[720px] text-left text-sm", children: [_jsx("thead", { className: "text-xs uppercase tracking-[0.16em] text-zinc-400", children: _jsx("tr", { children: ['Reference', 'Service', 'Status', 'Driver', 'Schedule', 'Action'].map((h) => _jsx("th", { className: "px-2 py-2", children: h }, h)) }) }), _jsx("tbody", { children: bookings.map((row) => _jsxs("tr", { className: "border-t border-zinc-800 text-zinc-200", children: [_jsx("td", { className: "px-2 py-3", children: row.referenceCode }), _jsx("td", { className: "px-2 py-3", children: row.serviceType }), _jsx("td", { className: "px-2 py-3", children: row.status }), _jsx("td", { className: "px-2 py-3", children: row.assignedDriverName ?? 'Unassigned' }), _jsx("td", { className: "px-2 py-3", children: new Date(row.scheduledAt).toLocaleString() }), _jsx("td", { className: "px-2 py-3", children: row.status === 'pending' && !row.assignedDriverName ? _jsx("button", { onClick: () => assignDriver(row), className: "rounded border border-amber-500/60 px-2 py-1 text-amber-200", children: "Assign Marco V." }) : _jsx("span", { className: "text-zinc-500", children: "\u2014" }) })] }, row.id)) })] }) }) })] }), _jsxs("div", { className: "space-y-5", children: [_jsx(Panel, { title: "Live Status Widgets", icon: _jsx("span", { children: "\u25CC" }), children: _jsxs("div", { className: "space-y-2 text-sm text-zinc-300", children: [_jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["System Health: ", _jsx("span", { className: "text-emerald-300", children: "Stable" })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Realtime Link: ", _jsx("span", { className: realtimeState === 'connected' ? 'text-emerald-300' : realtimeState === 'reconnecting' ? 'text-amber-200' : 'text-rose-300', children: realtimeState.toUpperCase() })] }), _jsxs("p", { className: "rounded-lg bg-zinc-900 p-2", children: ["Traffic Index: ", _jsx("span", { className: "text-rose-300", children: "High" })] })] }) }), _jsx(Panel, { title: "Notification Queue", icon: _jsx("span", { children: "\uD83D\uDD14" }), children: _jsx("ul", { className: "space-y-2 text-sm text-zinc-300", children: notificationFeed.map((item) => _jsx("li", { className: "rounded-lg border border-zinc-800 bg-zinc-900 p-2", children: item }, item)) }) })] })] })] })] })] }) });
}

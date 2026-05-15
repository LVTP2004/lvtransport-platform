import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const LIFECYCLE = ['booking_created', 'driver_assigned', 'en_route', 'airport_arrival', 'pickup_waiting', 'passenger_onboard', 'destination_sync', 'payment_completed', 'ride_closed'];
const stateTone = {
    Healthy: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100',
    Warning: 'border-amber-300/40 bg-amber-400/10 text-amber-100',
    Degraded: 'border-orange-300/40 bg-orange-400/10 text-orange-100',
    Critical: 'border-rose-300/40 bg-rose-400/10 text-rose-100'
};
const severityRank = { Healthy: 0, Warning: 1, Degraded: 2, Critical: 3 };
const mergeState = (...states) => states.reduce((worst, next) => (severityRank[next] > severityRank[worst] ? next : worst), 'Healthy');
const simulatedRidesSeed = [
    { id: 'airport-01', ref: 'LV-AIR-401', serviceType: 'Airport Premium', stage: 'driver_assigned', etaMin: 14, gpsFreshnessSec: 8, airportRisk: 'Healthy', paymentState: 'clear' },
    { id: 'airport-02', ref: 'LV-AIR-402', serviceType: 'Airport Premium', stage: 'en_route', etaMin: 22, gpsFreshnessSec: 9, airportRisk: 'Warning', paymentState: 'clear' },
    { id: 'airport-03', ref: 'LV-AIR-403', serviceType: 'Airport Executive', stage: 'airport_arrival', etaMin: 7, gpsFreshnessSec: 11, airportRisk: 'Healthy', paymentState: 'retrying' }
];
export function App() {
    const [bookings, setBookings] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [incidents, setIncidents] = useState([]);
    const [sync, setSync] = useState('recovering');
    const [simRides, setSimRides] = useState(simulatedRidesSeed);
    const [leoFeed, setLeoFeed] = useState(['Leo IA observing baseline airport flow.']);
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
        const poll = setInterval(() => {
            setSync((prev) => (prev === 'degraded' ? 'recovering' : prev));
            load();
        }, 12000);
        return () => clearInterval(poll);
    }, []);
    useEffect(() => {
        const lifecycleTick = setInterval(() => {
            setSimRides((current) => current.map((ride, index) => {
                const stageIndex = LIFECYCLE.indexOf(ride.stage);
                const nextStage = LIFECYCLE[(stageIndex + 1) % LIFECYCLE.length];
                const reconnectDrift = stageIndex % 4 === 1 ? 6 : 0;
                const staleGps = stageIndex % 5 === 2 ? 18 : 0;
                const paymentStress = nextStage === 'payment_completed' && index === 2 ? 'retrying' : nextStage === 'ride_closed' ? 'clear' : ride.paymentState;
                return {
                    ...ride,
                    stage: nextStage,
                    etaMin: Math.max(4, nextStage === 'pickup_waiting' ? ride.etaMin + 3 : ride.etaMin - 2 + reconnectDrift / 6),
                    gpsFreshnessSec: Math.max(6, 8 + staleGps),
                    airportRisk: nextStage === 'pickup_waiting' || reconnectDrift > 0 ? 'Warning' : nextStage === 'destination_sync' ? 'Degraded' : 'Healthy',
                    paymentState: paymentStress
                };
            }));
            setSync((prev) => (prev === 'live' ? 'recovering' : 'live'));
        }, 4500);
        return () => clearInterval(lifecycleTick);
    }, []);
    const activeRides = useMemo(() => bookings.filter((booking) => ['assigned', 'accepted', 'en_route', 'arrived', 'in_progress'].includes(booking.status)), [bookings]);
    const simAnomalies = useMemo(() => {
        const anomalies = [];
        simRides.forEach((ride) => {
            if (ride.gpsFreshnessSec > 20)
                anomalies.push({ code: `stale-gps-${ride.id}`, severity: 'Warning', detail: `${ride.ref} GPS freshness degraded to ${ride.gpsFreshnessSec}s`, emotionalImpact: 'Passenger uncertainty increases', subsystem: 'Tracking' });
            if (ride.stage === 'pickup_waiting')
                anomalies.push({ code: `pickup-waiting-${ride.id}`, severity: 'Warning', detail: `${ride.ref} waiting at terminal coordination zone`, emotionalImpact: 'Pickup confusion risk', subsystem: 'Airport Coordination' });
            if (ride.paymentState !== 'clear')
                anomalies.push({ code: `payment-retry-${ride.id}`, severity: ride.paymentState === 'retrying' ? 'Degraded' : 'Critical', detail: `${ride.ref} payment verification retry loop observed`, emotionalImpact: 'Trust pressure at ride closure', subsystem: 'Payments' });
        });
        if (sync !== 'live')
            anomalies.push({ code: 'websocket-reconnect', severity: sync === 'degraded' ? 'Degraded' : 'Warning', detail: 'Realtime stream reconnect delay detected', emotionalImpact: 'Founder confidence dips if prolonged', subsystem: 'Realtime Sync' });
        return anomalies;
    }, [simRides, sync]);
    const runtimeState = useMemo(() => mergeState(...simAnomalies.map((a) => a.severity), sync === 'degraded' ? 'Degraded' : sync === 'recovering' ? 'Warning' : 'Healthy'), [simAnomalies, sync]);
    useEffect(() => {
        const latest = simAnomalies[0];
        if (!latest)
            return;
        setLeoFeed((feed) => [
            `Leo IA: ${latest.subsystem} shows ${latest.severity.toLowerCase()} pressure. Suggested simplification: tighten pickup handoff signal clarity.`,
            ...feed
        ].slice(0, 4));
    }, [simAnomalies]);
    const pulseItems = useMemo(() => [
        { label: 'Operational Pulse', state: runtimeState, detail: `${simAnomalies.length} active operational anomalies` },
        { label: 'Realtime Sync Status', state: sync === 'live' ? 'Healthy' : sync === 'recovering' ? 'Warning' : 'Degraded', detail: sync === 'live' ? 'Websocket healthy' : 'Recovering continuity' },
        { label: 'Airport Coordination', state: mergeState(...simRides.map((ride) => ride.airportRisk)), detail: `${simRides.filter((r) => r.stage === 'pickup_waiting').length} pickup waiting · ${simRides.filter((r) => r.stage === 'airport_arrival').length} terminal arrivals` },
        { label: 'Payment Trust', state: simRides.some((r) => r.paymentState !== 'clear') ? 'Degraded' : 'Healthy', detail: simRides.some((r) => r.paymentState !== 'clear') ? 'Retry loops need calm closure handling' : 'Payment integrity stable' }
    ], [runtimeState, simAnomalies.length, sync, simRides]);
    const founderAttention = useMemo(() => simAnomalies.slice(0, 4).map((item) => ({ title: `${item.subsystem} attention`, state: item.severity, reason: `${item.detail}. Impact: ${item.emotionalImpact}.` })), [simAnomalies]);
    return _jsxs("main", { className: "min-h-screen bg-lvtp-obsidian p-5 text-zinc-100", children: [_jsx("div", { className: "lvtp-network absolute inset-0 pointer-events-none opacity-40" }), _jsxs("div", { className: "relative mx-auto max-w-7xl space-y-5", children: [_jsx("header", { className: "lvtp-shell rounded-3xl p-6", children: _jsxs("div", { className: "flex flex-wrap items-center justify-between gap-3", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-11 w-auto rounded-md border border-amber-400/30 bg-black p-1" }), _jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Founder Operational Cockpit" }), _jsx("h1", { className: "text-xl font-semibold text-amber-200", children: "LVTP Realtime Control Environment" })] })] }), _jsx("span", { className: `rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] ${stateTone[runtimeState]}`, children: runtimeState })] }) }), _jsx("section", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: pulseItems.map((item) => _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.12em] text-zinc-400", children: item.label }), _jsx("span", { className: `rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`, children: item.state })] }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: item.detail })] }, item.label)) }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card xl:col-span-2 rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Active Rides \u00B7 Lifecycle Breathing" }), _jsx("div", { className: "mt-3 space-y-3", children: simRides.map((ride) => _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/20 p-3", children: [_jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [_jsx("p", { className: "text-sm text-zinc-100", children: ride.ref }), _jsx("span", { className: "text-xs uppercase text-zinc-300", children: ride.stage })] }), _jsxs("div", { className: "mt-2 grid gap-2 text-xs text-zinc-300 sm:grid-cols-2 lg:grid-cols-4", children: [_jsxs("p", { children: ["ETA: ", ride.etaMin, "m"] }), _jsxs("p", { children: ["GPS freshness: ", ride.gpsFreshnessSec, "s"] }), _jsxs("p", { children: ["Airport risk: ", ride.airportRisk] }), _jsxs("p", { children: ["Payment: ", ride.paymentState] })] })] }, ride.id)) })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Founder Attention Queue" }), _jsx("div", { className: "mt-3 space-y-2", children: founderAttention.map((item) => _jsxs("div", { className: "rounded-xl border border-white/10 bg-black/25 p-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("p", { className: "text-sm text-zinc-100", children: item.title }), _jsx("span", { className: `rounded-full border px-2 py-0.5 text-[10px] uppercase ${stateTone[item.state]}`, children: item.state })] }), _jsx("p", { className: "mt-1 text-xs text-zinc-300", children: item.reason })] }, item.title + item.reason)) })] })] }), _jsxs("section", { className: "grid gap-5 xl:grid-cols-3", children: [_jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Weakness Chains" }), _jsxs("ol", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsx("li", { children: "Degraded LTE \u2192 reconnect delay" }), _jsx("li", { children: "Reconnect delay \u2192 stale GPS" }), _jsx("li", { children: "Stale GPS \u2192 ETA drift" }), _jsx("li", { children: "ETA drift \u2192 airport pickup uncertainty" }), _jsx("li", { children: "Pickup uncertainty \u2192 Moni reassurance escalation" })] })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Leo IA Observational Feed" }), _jsx("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: leoFeed.map((feed, idx) => _jsx("li", { className: "rounded-lg border border-white/10 bg-black/20 p-2", children: feed }, idx)) })] }), _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("h2", { className: "text-sm font-semibold uppercase tracking-[0.16em] text-amber-300", children: "Runtime Scorecard" }), _jsxs("ul", { className: "mt-3 space-y-2 text-sm text-zinc-300", children: [_jsxs("li", { children: ["Operational calmness: ", runtimeState === 'Healthy' ? 'High' : 'Monitored'] }), _jsxs("li", { children: ["Airport coordination maturity: ", simRides.some((r) => r.airportRisk !== 'Healthy') ? 'Stressed' : 'Stable'] }), _jsxs("li", { children: ["Reconnect recovery quality: ", sync === 'live' ? 'Recovered' : 'Recovering'] }), _jsxs("li", { children: ["Founder visibility clarity: ", founderAttention.length ? 'Actionable' : 'Clear'] })] })] })] })] })] });
}

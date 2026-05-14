import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const TRACKING_KEY = 'lvtransport.tracking.v1';
const TERMINAL_STATUSES = new Set(['completed', 'cancelled']);
const vehicles = [
    { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
    { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
    { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];
const nowIso = () => new Date().toISOString();
const loadDraft = () => { try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}
catch {
    return null;
} };
const detectTheme = () => (window.location.hostname === 'app.lvtransport.be' || window.location.search.includes('theme=ops')) ? 'ops' : 'premium';
function BookingCore({ theme }) {
    const restored = loadDraft();
    const [step, setStep] = useState(restored?.step ?? 1);
    const [pickup, setPickup] = useState(restored?.pickup ?? '');
    const [destination, setDestination] = useState(restored?.destination ?? '');
    const [dateTime, setDateTime] = useState(restored?.dateTime ?? '');
    const [passengers, setPassengers] = useState(restored?.passengers ?? 1);
    const [vehicle, setVehicle] = useState(vehicles.find((v) => v.name === restored?.vehicleName) ?? vehicles[0]);
    const [airportTransfer, setAirportTransfer] = useState(restored?.airportTransfer ?? false);
    const [businessVip, setBusinessVip] = useState(restored?.businessVip ?? false);
    const [confirmation, setConfirmation] = useState(restored?.confirmation ?? null);
    const [requestKey, setRequestKey] = useState(restored?.requestKey ?? null);
    const [events, setEvents] = useState(restored?.events ?? []);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [liveStatus, setLiveStatus] = useState(restored?.confirmation?.status ?? null);
    const [socketState, setSocketState] = useState('connecting');
    const inFlightKeyRef = useRef(null);
    const lastSequenceRef = useRef(0);
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events })); }, [step, pickup, destination, dateTime, passengers, vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events]);
    useEffect(() => { if (restored)
        setEvents((prev) => [...prev.slice(-49), { type: 'draft_restored', at: nowIso() }]); }, []);
    useEffect(() => {
        if (!confirmation?.id)
            return;
        if (TERMINAL_STATUSES.has(confirmation.status)) {
            setLiveStatus(confirmation.status);
            return;
        }
        let ws = null;
        let timer;
        const connect = () => {
            const query = lastSequenceRef.current > 0 ? `?lastSequence=${lastSequenceRef.current}` : '';
            ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws${query}`);
            ws.onopen = () => setSocketState('connected');
            ws.onmessage = (m) => { try {
                const p = JSON.parse(m.data);
                if (typeof p.sequence === 'number' && p.sequence > lastSequenceRef.current)
                    lastSequenceRef.current = p.sequence;
                if (p.event === 'booking.updated' && p.payload?.id === confirmation.id)
                    setLiveStatus(p.payload.status);
            }
            catch { } };
            ws.onclose = () => { setSocketState('offline'); timer = window.setTimeout(connect, 2500); };
        };
        connect();
        return () => { if (timer)
            clearTimeout(timer); ws?.close(); };
    }, [confirmation?.id, confirmation?.status]);
    const fare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup, destination, passengers, airportTransfer, businessVip, vehicle.priceMultiplier]);
    const serviceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
    const submitBooking = async () => {
        if (loading)
            return;
        const key = requestKey ?? `${Date.now()}-${Math.random()}`;
        if (inFlightKeyRef.current === key)
            return;
        inFlightKeyRef.current = key;
        setLoading(true);
        setError('');
        setRequestKey(key);
        setEvents((v) => [...v.slice(-49), { type: 'submit_started', at: nowIso() }]);
        try {
            const res = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': key }, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType }) });
            const payload = await res.json();
            if (!res.ok)
                throw new Error(payload?.message ?? 'Boeking mislukt');
            setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
            localStorage.setItem(TRACKING_KEY, payload.booking.id);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Boeking mislukt');
        }
        finally {
            setLoading(false);
            inFlightKeyRef.current = null;
        }
    };
    const wrap = theme === 'premium' ? 'glass-panel' : 'ops-panel';
    return _jsxs("section", { className: "grid gap-6 lg:grid-cols-[1.2fr_0.8fr]", children: [_jsx("div", { className: `${wrap} rounded-3xl p-6`, children: confirmation ? _jsxs("div", { children: [_jsxs("h2", { className: "text-2xl font-semibold", children: ["Reference: ", confirmation.referenceCode] }), _jsxs("p", { children: ["Status: ", liveStatus ?? confirmation.status] }), _jsxs("p", { className: "text-xs", children: ["Realtime: ", socketState] })] }) : _jsxs(_Fragment, { children: [_jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Pickup" }), _jsx("input", { value: pickup, onChange: (e) => setPickup(e.target.value) })] }), _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Destination" }), _jsx("input", { value: destination, onChange: (e) => setDestination(e.target.value) })] }), _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Datum & tijd" }), _jsx("input", { type: "datetime-local", value: dateTime, onChange: (e) => setDateTime(e.target.value) })] }), _jsx("div", { className: "my-3 flex gap-2", children: vehicles.map((v) => _jsx("button", { className: `vehicle-card ${vehicle.name === v.name ? 'vehicle-card--active' : ''}`, onClick: () => setVehicle(v), children: v.name }, v.name)) }), _jsxs("div", { className: "my-3 flex gap-2", children: [_jsx("button", { className: `toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`, onClick: () => setAirportTransfer((v) => !v), children: "Airport" }), _jsx("button", { className: `toggle-card ${businessVip ? 'toggle-card--active' : ''}`, onClick: () => setBusinessVip((v) => !v), children: "VIP" })] }), error && _jsx("p", { className: "text-rose-300", children: error }), _jsx(Button, { onClick: submitBooking, disabled: loading || !pickup || !destination || !dateTime, children: loading ? 'Submitting...' : 'Confirm booking' })] }) }), _jsxs("aside", { className: "space-y-4", children: [_jsxs("article", { className: `${wrap} rounded-3xl p-6`, children: [_jsx("p", { children: "Prijsindicatie" }), _jsxs("p", { className: "text-4xl font-semibold", children: ["\u20AC", fare] })] }), _jsxs("article", { className: `${wrap} rounded-3xl p-6`, children: [_jsx("p", { children: "Passagiers" }), _jsxs("div", { className: "mt-2 flex gap-3", children: [_jsx(Button, { variant: "secondary", onClick: () => setPassengers((v) => Math.max(1, v - 1)), children: "-" }), _jsx("strong", { className: "text-xl", children: passengers }), _jsx(Button, { variant: "secondary", onClick: () => setPassengers((v) => Math.min(12, v + 1)), children: "+" })] })] }), _jsx("article", { className: `${wrap} rounded-3xl p-6`, children: _jsxs("p", { children: ["Lifecycle events: ", events.length] }) })] })] });
}
function SiteShell() {
    const theme = detectTheme();
    const path = window.location.pathname;
    const isPremium = theme === 'premium';
    const links = ['/', '/booking', '/prijzen', '/tracking', '/moni-ride', '/maps', '/diensten', '/contact', '/driver', '/admin'];
    const titleMap = { '/': 'LV Transport', '/booking': 'Boeking', '/prijzen': 'Prijzen', '/tracking': 'Tracking', '/moni-ride': 'Moni Ride', '/maps': 'Maps', '/diensten': 'Diensten', '/contact': 'Contact', '/driver': 'Driver', '/admin': 'Admin' };
    const page = titleMap[path] ?? 'LV Transport';
    return _jsxs("div", { className: `min-h-screen ${isPremium ? 'premium-theme' : 'ops-theme'} px-4 py-6 text-white`, children: [_jsxs("div", { className: "mx-auto w-full max-w-6xl space-y-6", children: [_jsxs("header", { className: `${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs uppercase tracking-[0.25em]", children: isPremium ? 'LV Transport Premium' : 'LVTP Operational SaaS' }), _jsx("h1", { className: "text-3xl font-semibold", children: page })] }), _jsx("img", { src: "/lv-logo.svg", className: "h-10", onError: (e) => ((e.currentTarget.style.display = 'none')) })] }), _jsx("nav", { className: "mt-4 flex flex-wrap gap-2", children: links.map((href) => _jsx("a", { href: href, className: `rounded-full px-3 py-1 text-sm ${href === path ? 'bg-lv-gold text-black' : 'bg-white/10'}`, children: href }, href)) })] }), (path === '/booking' || path === '/') && _jsx(BookingCore, { theme: theme }), path === '/prijzen' && _jsxs("section", { className: `${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`, children: [_jsx("h2", { className: "text-2xl", children: "Prijsmodule" }), _jsx("p", { children: "Zelfde pricing engine en fallback logica in beide tracks." })] }), path === '/tracking' && _jsxs("section", { className: `${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`, children: [_jsx("h2", { className: "text-2xl", children: "Tracking" }), _jsx("p", { children: "Tracking code lifecycle en realtime updates actief." })] }), path === '/moni-ride' && _jsxs("section", { className: `${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`, children: [_jsx("h2", { className: "text-2xl", children: "Moni Ride" }), _jsx("p", { children: "Moni Ride assistent en API health/fallback gedeeld." })] }), ['/maps', '/diensten', '/contact', '/driver', '/admin'].includes(path) && _jsxs("section", { className: `${isPremium ? 'glass-panel' : 'ops-panel'} rounded-3xl p-6`, children: [_jsx("h2", { className: "text-2xl", children: page }), _jsx("p", { children: "Zelfde operationele core, alleen UI-thema verschilt." })] })] }), _jsx(MoniAssistant, {})] });
}
export function App() { return _jsx(SiteShell, {}); }

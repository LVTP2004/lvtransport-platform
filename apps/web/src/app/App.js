import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
import { TERMINAL_STATES, resolveLifecycleState } from './bookingLifecycle';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const TRACKING_KEY = 'lvtransport.tracking.v1';
const vehicles = [
    { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
    { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
    { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];
const formatDateTime = (value) => {
    if (!value)
        return 'Select schedule';
    return new Date(value).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
};
const nowIso = () => new Date().toISOString();
const loadDraft = () => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    }
    catch {
        return null;
    }
};
function TrackingPage({ code }) { return _jsxs("div", { className: "min-h-screen bg-lv-black px-4 py-8 text-white sm:px-6 lg:px-8", children: [_jsx("div", { className: "mx-auto w-full max-w-6xl", children: _jsxs("section", { className: "glass-panel rounded-3xl p-6 sm:p-8", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.24em] text-lv-champagne", children: "LV Transport Tracking" }), _jsx("h1", { className: "mt-3 text-3xl font-semibold sm:text-5xl", children: "Track your chauffeur in real time." }), _jsxs("p", { className: "mt-4 text-sm text-lv-mist sm:text-base", children: ["Tracking code ", _jsx("span", { className: "font-semibold text-white", children: code }), " is active. Customer-safe location updates stream only while ride is live."] })] }) }), _jsx(MoniAssistant, {})] }); }
function DriverLocationPanel() {
    const [driverId, setDriverId] = useState('DRV-001');
    const [bookingId, setBookingId] = useState('');
    const [sharing, setSharing] = useState(false);
    const [status, setStatus] = useState('GPS idle');
    const watcherRef = useRef(null);
    const stop = () => { if (watcherRef.current !== null)
        navigator.geolocation.clearWatch(watcherRef.current); watcherRef.current = null; setSharing(false); };
    const push = async (coords) => {
        await fetch(`${API_BASE}/drivers/${encodeURIComponent(driverId)}/location`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ bookingId, lat: coords.latitude, lng: coords.longitude, heading: coords.heading ?? undefined, accuracyMeters: coords.accuracy, source: 'gps' }) });
    };
    const start = async () => {
        if (!bookingId) {
            setStatus('Add active booking ID first.');
            return;
        }
        if (!('geolocation' in navigator)) {
            setStatus('Geolocation unavailable on this device/browser.');
            return;
        }
        setStatus('Requesting GPS permission...');
        watcherRef.current = navigator.geolocation.watchPosition(async (position) => { setSharing(true); setStatus(`Live GPS enabled • ±${Math.round(position.coords.accuracy)}m`); await push(position.coords); }, () => { setStatus('GPS denied/unavailable. Sharing stopped safely.'); stop(); }, { enableHighAccuracy: true, maximumAge: 4000, timeout: 12000 });
    };
    return _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6 space-y-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Driver live GPS" }), _jsx("input", { className: "field-wrap", value: driverId, onChange: (e) => setDriverId(e.target.value), placeholder: "Driver ID" }), _jsx("input", { className: "field-wrap", value: bookingId, onChange: (e) => setBookingId(e.target.value), placeholder: "Assigned Booking ID" }), _jsx("p", { className: "text-xs text-lv-mist", children: status }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: start, className: "flex-1", disabled: sharing, children: "Start sharing" }), _jsx(Button, { onClick: stop, variant: "secondary", className: "flex-1", children: "Stop sharing" })] })] });
}
function AdminLivePanel() {
    const [last, setLast] = useState(null);
    useEffect(() => { const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`); ws.onmessage = (m) => { try {
        const data = JSON.parse(m.data);
        if (data.event === 'admin.live.updated' && data.payload?.location)
            setLast(data.payload);
    }
    catch { } }; return () => ws.close(); }, []);
    return _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Admin control tower live map feed" }), _jsx("p", { className: "mt-2 text-sm text-lv-mist", children: last ? `Driver ${last.driverId} • Booking ${last.bookingId}` : 'Waiting for live driver coordinates...' }), last?.location && _jsxs("p", { className: "mt-2 text-sm", children: ["Lat ", last.location.lat.toFixed(5), ", Lng ", last.location.lng.toFixed(5)] })] });
}
export function App() {
    const params = new URLSearchParams(window.location.search);
    const presentationMode = params.get('mode') === 'demo';
    const mode = params.get('mode');
    const trackingMatch = window.location.pathname.match(/^\/tracking\/([A-Za-z0-9-]+)/);
    if (trackingMatch)
        return _jsx(TrackingPage, { code: trackingMatch[1] });
    if (mode === 'driver')
        return _jsx("div", { className: "min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8", children: _jsx("div", { className: "mx-auto w-full max-w-4xl", children: _jsx(DriverLocationPanel, {}) }) });
    if (mode === 'admin')
        return _jsx("div", { className: "min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8", children: _jsx("div", { className: "mx-auto w-full max-w-4xl", children: _jsx(AdminLivePanel, {}) }) });
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
    const [liveStatus, setLiveStatus] = useState(resolveLifecycleState(null, restored?.confirmation?.status));
    const [socketState, setSocketState] = useState('connecting');
    const inFlightKeyRef = useRef(null);
    const lastSequenceRef = useRef(0);
    useEffect(() => {
        if (!presentationMode || restored)
            return;
        setPickup('Wynn Las Vegas, South Valet');
        setDestination('Harry Reid Terminal 3, Private Aviation Gate');
        const inNinetyMinutes = new Date(Date.now() + 90 * 60 * 1000);
        setDateTime(inNinetyMinutes.toISOString().slice(0, 16));
        setPassengers(3);
        setVehicle(vehicles[1]);
        setAirportTransfer(true);
        setBusinessVip(true);
        setStep(3);
    }, [presentationMode, restored]);
    useEffect(() => {
        const draft = { step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, [airportTransfer, businessVip, confirmation, dateTime, destination, events, passengers, pickup, requestKey, step, vehicle.name]);
    const appendEvent = (type, meta) => setEvents((prev) => [...prev.slice(-49), { type, at: nowIso(), meta }]);
    useEffect(() => { if (restored)
        appendEvent('draft_restored', { hasConfirmation: Boolean(restored.confirmation) }); }, []);
    useEffect(() => {
        if (!confirmation?.id)
            return;
        const tracked = localStorage.getItem(TRACKING_KEY);
        if (tracked !== confirmation.id)
            localStorage.setItem(TRACKING_KEY, confirmation.id);
        const initialState = resolveLifecycleState(liveStatus, confirmation.status);
        if (initialState && TERMINAL_STATES.has(initialState)) {
            setLiveStatus(initialState);
            setSocketState('offline');
            return;
        }
        let ws = null;
        let reconnectTimer;
        let attempts = 0;
        let active = true;
        const connect = () => {
            if (!active)
                return;
            setSocketState(attempts > 0 ? 'reconnecting' : 'connecting');
            const query = lastSequenceRef.current > 0 ? `?lastSequence=${lastSequenceRef.current}` : '';
            ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws${query}`);
            ws.onopen = () => { attempts = 0; setSocketState('connected'); };
            ws.onmessage = (message) => {
                try {
                    const payload = JSON.parse(message.data);
                    if (typeof payload.sequence === 'number' && payload.sequence > lastSequenceRef.current)
                        lastSequenceRef.current = payload.sequence;
                    if (payload.event === 'booking.snapshot' && Array.isArray(payload.payload)) {
                        const current = payload.payload.find((item) => item.id === confirmation.id);
                        if (current?.status)
                            setLiveStatus((prev) => resolveLifecycleState(prev, current.status));
                    }
                    if (payload.event === 'booking.updated' && !Array.isArray(payload.payload)) {
                        const bookingUpdate = payload.payload;
                        if (bookingUpdate?.id === confirmation.id && bookingUpdate.status) {
                            setLiveStatus((prev) => resolveLifecycleState(prev, bookingUpdate.status));
                        }
                    }
                }
                catch { }
            };
            ws.onclose = () => {
                if (!active || (liveStatus && TERMINAL_STATES.has(liveStatus)))
                    return;
                attempts += 1;
                setSocketState('offline');
                reconnectTimer = window.setTimeout(connect, Math.min(15000, 1000 * 2 ** Math.min(attempts, 4)));
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
    }, [confirmation?.id, confirmation?.status, liveStatus]);
    const baseFare = useMemo(() => {
        const distanceFactor = Math.max(14, (pickup.length + destination.length) * 0.8);
        const passengerFactor = passengers > 3 ? (passengers - 3) * 6 : 0;
        const airportFee = airportTransfer ? 18 : 0;
        const vipFee = businessVip ? 24 : 0;
        return Math.round((distanceFactor + passengerFactor + airportFee + vipFee) * vehicle.priceMultiplier);
    }, [airportTransfer, businessVip, destination.length, passengers, pickup.length, vehicle.priceMultiplier]);
    const serviceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
    const opsMetrics = useMemo(() => {
        const expectedArrival = Math.max(8, Math.round(baseFare / 8));
        return [
            { label: 'Live chauffeurs', value: '42', detail: '37 en route • 5 standby' },
            { label: 'On-time performance', value: '98.7%', detail: 'Last 24h completed rides' },
            { label: 'Dispatch SLA', value: `${expectedArrival} min`, detail: 'Current booking region forecast' }
        ];
    }, [baseFare]);
    const nextStep = () => setStep((v) => (v < 3 ? (v + 1) : v));
    const prevStep = () => setStep((v) => (v > 1 ? (v - 1) : v));
    const submitBooking = async () => {
        if (loading)
            return;
        const dedupeKey = requestKey ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
        if (inFlightKeyRef.current === dedupeKey)
            return;
        inFlightKeyRef.current = dedupeKey;
        setRequestKey(dedupeKey);
        setError('');
        setLoading(true);
        appendEvent('submit_started', { dedupeKey, step });
        try {
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey },
                body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType })
            });
            const payload = await response.json();
            if (!response.ok)
                throw new Error(payload?.message ?? 'Unable to create booking');
            const nextLifecycleState = resolveLifecycleState(null, payload.booking.status) ?? 'pending';
            setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: nextLifecycleState });
            setLiveStatus((prev) => resolveLifecycleState(prev, nextLifecycleState));
            appendEvent('submit_succeeded', { dedupeKey, bookingId: payload.booking.id });
        }
        catch (e) {
            appendEvent('submit_failed', { dedupeKey });
            setError(e instanceof Error ? e.message : 'Unable to create booking');
        }
        finally {
            inFlightKeyRef.current = null;
            setLoading(false);
        }
    };
    const resetDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TRACKING_KEY);
        appendEvent('draft_cleared');
        window.location.reload();
    };
    return _jsxs("div", { className: "min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mx-auto w-full max-w-6xl", children: [presentationMode && _jsxs("section", { className: "mb-6 rounded-3xl border border-lv-gold/30 bg-gradient-to-r from-lv-gold/20 via-black/40 to-black/20 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-lv-champagne", children: "Investor demo mode" }), _jsx("p", { className: "mt-2 text-sm text-lv-mist", children: "Preloaded premium itinerary, resilient booking draft recovery, and live operational telemetry for realistic service simulation." })] }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-[1.2fr_0.8fr]", children: [_jsx("div", { className: "glass-panel rounded-3xl p-4 sm:p-6", children: confirmation ? _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Booking confirmed" }), _jsxs("h2", { className: "text-2xl font-semibold", children: ["Reference: ", confirmation.referenceCode] }), _jsxs("p", { className: "text-lv-mist", children: ["Status: ", liveStatus ?? confirmation.status] }), _jsxs("p", { className: "text-xs text-lv-mist", children: ["Realtime channel: ", _jsx("span", { className: socketState === 'connected' ? 'text-emerald-300' : socketState === 'reconnecting' ? 'text-amber-200' : 'text-rose-300', children: socketState.toUpperCase() })] }), _jsx(Button, { className: "shadow-gold-md", onClick: resetDraft, children: "Create another booking" })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("p", { className: "text-sm text-lv-mist", children: ["Step ", step, " of 3"] }), _jsx("div", { className: "flex w-32 gap-2", children: [1, 2, 3].map((i) => _jsx("span", { className: `h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-lv-gold' : 'bg-white/15'}` }, i)) })] }), _jsxs("div", { className: "booking-step-fade space-y-4", children: [step === 1 && _jsxs(_Fragment, { children: [_jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Pickup" }), _jsx("input", { value: pickup, onChange: (e) => setPickup(e.target.value), placeholder: "Hotel, office, terminal..." })] }), _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Destination" }), _jsx("input", { value: destination, onChange: (e) => setDestination(e.target.value), placeholder: "Airport, venue, client site..." })] }), _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Date & time" }), _jsx("input", { type: "datetime-local", value: dateTime, onChange: (e) => setDateTime(e.target.value) })] })] }), step === 2 && _jsxs(_Fragment, { children: [_jsxs("div", { className: "field-wrap", children: [_jsx("span", { children: "Passengers" }), _jsxs("div", { className: "mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3", children: [_jsx("button", { className: "control-btn", onClick: () => setPassengers((v) => Math.max(1, v - 1)), children: "\u2212" }), _jsx("strong", { className: "text-lg", children: passengers }), _jsx("button", { className: "control-btn", onClick: () => setPassengers((v) => Math.min(12, v + 1)), children: "+" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-2 text-sm text-lv-mist", children: "Vehicle" }), _jsx("div", { className: "grid gap-3", children: vehicles.map((item) => _jsxs("button", { onClick: () => setVehicle(item), className: `vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: item.name }), _jsxs("p", { className: "text-xs text-lv-mist", children: ["ETA ", item.eta, " \u2022 up to ", item.seats, " passengers"] })] }), _jsxs("p", { className: "text-lv-champagne", children: ["x", item.priceMultiplier.toFixed(2)] })] }, item.name)) })] })] }), step === 3 && _jsxs(_Fragment, { children: [_jsxs("button", { className: `toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`, onClick: () => setAirportTransfer((v) => !v), children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Airport transfer" }), _jsx("p", { className: "text-xs text-lv-mist", children: "Terminal-aware handoff and buffer timing prep." })] }), _jsx("span", { children: airportTransfer ? 'On' : 'Off' })] }), _jsxs("button", { className: `toggle-card ${businessVip ? 'toggle-card--active' : ''}`, onClick: () => setBusinessVip((v) => !v), children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Business / VIP" }), _jsx("p", { className: "text-xs text-lv-mist", children: "Priority allocation, premium chauffeur protocol." })] }), _jsx("span", { children: businessVip ? 'On' : 'Off' })] })] })] }), error && _jsx("p", { className: "mt-4 text-sm text-rose-300", children: error }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx(Button, { variant: "secondary", className: "flex-1", onClick: prevStep, children: "Back" }), step < 3 ? _jsx(Button, { className: "flex-1", onClick: nextStep, children: "Continue" }) : _jsx(Button, { className: "flex-1 shadow-gold-md", onClick: submitBooking, disabled: loading || !pickup || !destination || !dateTime, children: loading ? 'Submitting...' : 'Confirm booking' })] })] }) }), _jsxs("aside", { className: "space-y-6", children: [_jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Price estimate" }), _jsxs("p", { className: "mt-3 text-4xl font-semibold", children: ["$", baseFare] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Booking summary" }), _jsxs("ul", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Pickup:" }), " ", pickup || 'Not set'] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Destination:" }), " ", destination || 'Not set'] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Schedule:" }), " ", formatDateTime(dateTime)] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Passengers:" }), " ", passengers] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Vehicle:" }), " ", vehicle.name] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Options:" }), " ", airportTransfer ? 'Airport' : 'Standard', " \u2022 ", businessVip ? 'VIP' : 'Classic'] })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Operations snapshot" }), _jsx("div", { className: "mt-4 grid gap-3", children: opsMetrics.map((metric) => _jsxs("div", { className: "rounded-2xl border border-white/10 bg-black/30 p-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.14em] text-lv-mist", children: metric.label }), _jsx("p", { className: "mt-1 text-2xl font-semibold", children: metric.value }), _jsx("p", { className: "text-xs text-lv-mist", children: metric.detail })] }, metric.label)) })] })] })] })] }), _jsx(MoniAssistant, {})] });
}

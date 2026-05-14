import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
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
function TrackingPage({ code }) { return _jsxs("div", { className: "min-h-screen bg-lv-black px-4 py-8 text-white sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mx-auto w-full max-w-6xl", children: [_jsxs("section", { className: "glass-panel rounded-3xl p-6 sm:p-8", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.24em] text-lv-champagne", children: "LV Transport Tracking" }), _jsx("h1", { className: "mt-3 text-3xl font-semibold sm:text-5xl", children: "Track your chauffeur in real time." }), _jsxs("p", { className: "mt-4 text-sm text-lv-mist sm:text-base", children: ["Tracking code ", _jsx("span", { className: "font-semibold text-white", children: code }), " is active. Customer-safe location updates stream only while ride is live."] })] }), _jsxs("section", { className: "mt-8 grid gap-6 lg:grid-cols-3", children: [_jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Transparante workflow" }), _jsxs("ol", { className: "mt-4 space-y-3 text-sm text-lv-mist", children: [_jsxs("li", { children: [_jsx("span", { className: "font-semibold text-white", children: "1. Reservatie" }), " \u2014 Uw ritaanvraag wordt direct operationeel gevalideerd."] }), _jsxs("li", { children: [_jsx("span", { className: "font-semibold text-white", children: "2. Dispatch" }), " \u2014 Chauffeur en voertuig worden toegewezen op serviceklasse."] }), _jsxs("li", { children: [_jsx("span", { className: "font-semibold text-white", children: "3. Live opvolging" }), " \u2014 U ontvangt ritcode, tracking en statusupdates."] })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Zakelijk & VIP" }), _jsxs("ul", { className: "mt-4 space-y-3 text-sm", children: [_jsx("li", { children: "\u2022 Facturatie op bedrijfsprofiel en periodieke rapportering" }), _jsx("li", { children: "\u2022 Prioritaire airport-operaties met terminal buffers" }), _jsx("li", { children: "\u2022 Terugkerende routes voor directie, crew en klanten" }), _jsx("li", { children: "\u2022 Service level communicatie voor assistants & travel desks" })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Realtime gereed" }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-xs", children: [_jsx("span", { className: "ops-badge", children: "Online bevestiging" }), _jsx("span", { className: "ops-badge", children: "Live tracking" }), _jsx("span", { className: "ops-badge", children: "Dispatch monitoring" }), _jsx("span", { className: "ops-badge", children: "Airport-ready" })] }), _jsx("p", { className: "mt-4 text-sm text-lv-mist", children: "Operationele workflow ontworpen voor betrouwbare uitvoering, niet enkel presentatie." })] })] }), _jsxs("section", { className: "mt-8 grid gap-6 lg:grid-cols-2", children: [_jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Luchthaven tarieven" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Brussel Centrum \u2192 BRU" }), _jsx("strong", { children: "Vanaf \u20AC95" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Antwerpen \u2192 BRU" }), _jsx("strong", { children: "Vanaf \u20AC145" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Gent \u2192 BRU" }), _jsx("strong", { children: "Vanaf \u20AC175" })] })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Populaire zakelijke routes" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("div", { className: "route-card", children: [_jsx("span", { children: "EU Quarter \u2194 Zaventem" }), _jsx("strong", { children: "Corporate SLA" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Antwerp Port \u2194 BRU" }), _jsx("strong", { children: "Priority dispatch" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Brussels \u2194 Luxembourg" }), _jsx("strong", { children: "VIP recurring" })] })] })] })] }), _jsxs("footer", { className: "mt-8 glass-panel rounded-3xl p-5 text-sm text-lv-mist sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "LV Transport \u2014 Premium Mobility Operations" }), _jsxs("div", { className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx("p", { children: "Telefoon: +32 000 00 00 00" }), _jsx("p", { children: "E-mail: info@lvtransport.be" }), _jsx("p", { children: "Website: https://lvtransport.be" }), _jsx("p", { children: "BTW: BE 0000.000.000" })] })] })] }), _jsx(MoniAssistant, {})] }); }
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
    const [liveStatus, setLiveStatus] = useState(resolveLifecycleState(null, restored?.confirmation?.status));
    const [socketState, setSocketState] = useState('connecting');
    const inFlightKeyRef = useRef(null);
    const lastSequenceRef = useRef(0);
    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify({ step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events })); }, [step, pickup, destination, dateTime, passengers, vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events]);
    useEffect(() => { if (restored)
        setEvents((prev) => [...prev.slice(-49), { type: 'draft_restored', at: nowIso() }]); }, []);
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
        if (TERMINAL_STATUSES.has(confirmation.status)) {
            setLiveStatus(confirmation.status);
            return;
        }
        let ws = null;
        let timer;
        const connect = () => {
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
    const resetDraft = () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(TRACKING_KEY);
        appendEvent('draft_cleared');
        window.location.reload();
    };
    return _jsxs("div", { className: "min-h-screen bg-lv-black px-4 py-6 text-white sm:px-6 lg:px-8", children: [_jsxs("div", { className: "mx-auto w-full max-w-6xl", children: [presentationMode && _jsxs("section", { className: "mb-6 rounded-3xl border border-lv-gold/30 bg-gradient-to-r from-lv-gold/20 via-black/40 to-black/20 p-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.25em] text-lv-champagne", children: "Investor demo mode" }), _jsx("p", { className: "mt-2 text-sm text-lv-mist", children: "Preloaded premium itinerary, resilient booking draft recovery, and live operational telemetry for realistic service simulation." })] }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-[1.2fr_0.8fr]", children: [_jsx("div", { className: "glass-panel rounded-3xl p-4 sm:p-6", children: confirmation ? _jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Booking confirmed" }), _jsxs("h2", { className: "text-2xl font-semibold", children: ["Reference: ", confirmation.referenceCode] }), _jsxs("p", { className: "text-lv-mist", children: ["Status: ", liveStatus ?? confirmation.status] }), _jsx("p", { className: "text-sm text-lv-mist", children: "Uw reservatie wordt operationeel verwerkt." }), _jsx("p", { className: "text-sm text-lv-mist", children: "Ontvang uw ritcode en volg uw chauffeur online." }), _jsxs("p", { className: "text-xs text-lv-mist", children: ["Realtime channel: ", _jsx("span", { className: socketState === 'connected' ? 'text-emerald-300' : socketState === 'reconnecting' ? 'text-amber-200' : 'text-rose-300', children: socketState.toUpperCase() })] }), _jsx(Button, { className: "shadow-gold-md", onClick: resetDraft, children: "Create another booking" })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-6 flex items-center justify-between", children: [_jsxs("p", { className: "text-sm text-lv-mist", children: ["Step ", step, " of 3"] }), _jsx("div", { className: "flex w-32 gap-2", children: [1, 2, 3].map((i) => _jsx("span", { className: `h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-lv-gold' : 'bg-white/15'}` }, i)) })] }), _jsxs("div", { className: "booking-step-fade space-y-4", children: [step === 1 && _jsxs(_Fragment, { children: [_jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Pickup" }), _jsx("input", { value: pickup, onChange: (e) => setPickup(e.target.value), placeholder: "Hotel, office, terminal..." })] }), _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Destination" }), _jsx("input", { value: destination, onChange: (e) => setDestination(e.target.value), placeholder: "Airport, venue, client site..." })] }), _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: "Date & time" }), _jsx("input", { type: "datetime-local", value: dateTime, onChange: (e) => setDateTime(e.target.value) })] })] }), step === 2 && _jsxs(_Fragment, { children: [_jsxs("div", { className: "field-wrap", children: [_jsx("span", { children: "Passengers" }), _jsxs("div", { className: "mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3", children: [_jsx("button", { className: "control-btn", onClick: () => setPassengers((v) => Math.max(1, v - 1)), children: "\u2212" }), _jsx("strong", { className: "text-lg", children: passengers }), _jsx("button", { className: "control-btn", onClick: () => setPassengers((v) => Math.min(12, v + 1)), children: "+" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "mb-2 text-sm text-lv-mist", children: "Vehicle" }), _jsx("div", { className: "grid gap-3", children: vehicles.map((item) => _jsxs("button", { onClick: () => setVehicle(item), className: `vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`, children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: item.name }), _jsxs("p", { className: "text-xs text-lv-mist", children: ["ETA ", item.eta, " \u2022 up to ", item.seats, " passengers"] })] }), _jsxs("p", { className: "text-lv-champagne", children: ["x", item.priceMultiplier.toFixed(2)] })] }, item.name)) })] })] }), step === 3 && _jsxs(_Fragment, { children: [_jsxs("button", { className: `toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`, onClick: () => setAirportTransfer((v) => !v), children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Airport transfer" }), _jsx("p", { className: "text-xs text-lv-mist", children: "Terminal-aware handoff and buffer timing prep." })] }), _jsx("span", { children: airportTransfer ? 'On' : 'Off' })] }), _jsxs("button", { className: `toggle-card ${businessVip ? 'toggle-card--active' : ''}`, onClick: () => setBusinessVip((v) => !v), children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: "Business / VIP" }), _jsx("p", { className: "text-xs text-lv-mist", children: "Priority allocation, premium chauffeur protocol." })] }), _jsx("span", { children: businessVip ? 'On' : 'Off' })] })] })] }), error && _jsx("p", { className: "mt-4 text-sm text-rose-300", children: error }), _jsxs("div", { className: "mt-6 flex gap-3", children: [_jsx(Button, { variant: "secondary", className: "flex-1", onClick: prevStep, children: "Back" }), step < 3 ? _jsx(Button, { className: "flex-1", onClick: nextStep, children: "Continue" }) : _jsx(Button, { className: "flex-1 shadow-gold-md", onClick: submitBooking, disabled: loading || !pickup || !destination || !dateTime, children: loading ? 'Submitting...' : 'Bevestig reservatie' })] })] }) }), _jsxs("aside", { className: "space-y-6", children: [_jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Price estimate" }), _jsxs("p", { className: "mt-3 text-4xl font-semibold", children: ["$", baseFare] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Booking summary" }), _jsxs("ul", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Pickup:" }), " ", pickup || 'Not set'] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Destination:" }), " ", destination || 'Not set'] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Schedule:" }), " ", formatDateTime(dateTime)] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Passengers:" }), " ", passengers] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Vehicle:" }), " ", vehicle.name] }), _jsxs("li", { children: [_jsx("span", { className: "text-lv-mist", children: "Options:" }), " ", airportTransfer ? 'Airport' : 'Standard', " \u2022 ", businessVip ? 'VIP' : 'Classic'] })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Operations snapshot" }), _jsx("div", { className: "mt-4 grid gap-3", children: opsMetrics.map((metric) => _jsxs("div", { className: "rounded-2xl border border-white/10 bg-black/30 p-3", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.14em] text-lv-mist", children: metric.label }), _jsx("p", { className: "mt-1 text-2xl font-semibold", children: metric.value }), _jsx("p", { className: "text-xs text-lv-mist", children: metric.detail })] }, metric.label)) })] })] })] }), _jsxs("section", { className: "mt-8 grid gap-6 lg:grid-cols-3", children: [_jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Transparante workflow" }), _jsxs("ol", { className: "mt-4 space-y-3 text-sm text-lv-mist", children: [_jsxs("li", { children: [_jsx("span", { className: "font-semibold text-white", children: "1. Reservatie" }), " \u2014 Uw ritaanvraag wordt direct operationeel gevalideerd."] }), _jsxs("li", { children: [_jsx("span", { className: "font-semibold text-white", children: "2. Dispatch" }), " \u2014 Chauffeur en voertuig worden toegewezen op serviceklasse."] }), _jsxs("li", { children: [_jsx("span", { className: "font-semibold text-white", children: "3. Live opvolging" }), " \u2014 U ontvangt ritcode, tracking en statusupdates."] })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Zakelijk & VIP" }), _jsxs("ul", { className: "mt-4 space-y-3 text-sm", children: [_jsx("li", { children: "\u2022 Facturatie op bedrijfsprofiel en periodieke rapportering" }), _jsx("li", { children: "\u2022 Prioritaire airport-operaties met terminal buffers" }), _jsx("li", { children: "\u2022 Terugkerende routes voor directie, crew en klanten" }), _jsx("li", { children: "\u2022 Service level communicatie voor assistants & travel desks" })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Realtime gereed" }), _jsxs("div", { className: "mt-4 flex flex-wrap gap-2 text-xs", children: [_jsx("span", { className: "ops-badge", children: "Online bevestiging" }), _jsx("span", { className: "ops-badge", children: "Live tracking" }), _jsx("span", { className: "ops-badge", children: "Dispatch monitoring" }), _jsx("span", { className: "ops-badge", children: "Airport-ready" })] }), _jsx("p", { className: "mt-4 text-sm text-lv-mist", children: "Operationele workflow ontworpen voor betrouwbare uitvoering, niet enkel presentatie." })] })] }), _jsxs("section", { className: "mt-8 grid gap-6 lg:grid-cols-2", children: [_jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Luchthaven tarieven" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Brussel Centrum \u2192 BRU" }), _jsx("strong", { children: "Vanaf \u20AC95" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Antwerpen \u2192 BRU" }), _jsx("strong", { children: "Vanaf \u20AC145" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Gent \u2192 BRU" }), _jsx("strong", { children: "Vanaf \u20AC175" })] })] })] }), _jsxs("article", { className: "glass-panel rounded-3xl p-5 sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "Populaire zakelijke routes" }), _jsxs("div", { className: "mt-4 space-y-3 text-sm", children: [_jsxs("div", { className: "route-card", children: [_jsx("span", { children: "EU Quarter \u2194 Zaventem" }), _jsx("strong", { children: "Corporate SLA" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Antwerp Port \u2194 BRU" }), _jsx("strong", { children: "Priority dispatch" })] }), _jsxs("div", { className: "route-card", children: [_jsx("span", { children: "Brussels \u2194 Luxembourg" }), _jsx("strong", { children: "VIP recurring" })] })] })] })] }), _jsxs("footer", { className: "mt-8 glass-panel rounded-3xl p-5 text-sm text-lv-mist sm:p-6", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-lv-champagne", children: "LV Transport \u2014 Premium Mobility Operations" }), _jsxs("div", { className: "mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4", children: [_jsx("p", { children: "Telefoon: +32 000 00 00 00" }), _jsx("p", { children: "E-mail: info@lvtransport.be" }), _jsx("p", { children: "Website: https://lvtransport.be" }), _jsx("p", { children: "BTW: BE 0000.000.000" })] })] })] }), _jsx(MoniAssistant, {})] });
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

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const STORAGE_KEY = 'lvtransport.booking.v1';
const SESSION_KEY = 'lvtransport.mobile.session.v1';
const vehicles = [
    { name: 'Executive Sedan', eta: '3 min', priceMultiplier: 1, seats: 3, serviceType: 'standard' },
    { name: 'Business SUV', eta: '5 min', priceMultiplier: 1.35, seats: 6, serviceType: 'airport' },
    { name: 'VIP Sprinter', eta: '10 min', priceMultiplier: 1.8, seats: 10, serviceType: 'vip' }
];
const formatDateTime = (value) => !value ? 'Select schedule' : new Date(value).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const nowIso = () => new Date().toISOString();
const loadDraft = () => { try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
}
catch {
    return null;
} };
export function App() {
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
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [installReady, setInstallReady] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const inFlightKeyRef = useRef(null);
    useEffect(() => {
        const draft = { step, pickup, destination, dateTime, passengers, vehicleName: vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    }, [step, pickup, destination, dateTime, passengers, vehicle.name, airportTransfer, businessVip, confirmation, requestKey, events]);
    const appendEvent = (type, meta) => setEvents((prev) => [...prev.slice(-49), { type, at: nowIso(), meta }]);
    useEffect(() => { if (restored)
        appendEvent('draft_restored', { hasConfirmation: Boolean(restored.confirmation) }); }, []);
    useEffect(() => {
        const sessionPayload = { lastSeenAt: nowIso(), path: window.location.pathname, step, online: navigator.onLine };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
    }, [step]);
    useEffect(() => {
        const prior = sessionStorage.getItem(SESSION_KEY);
        if (prior)
            appendEvent('session_recovered', { recovered: true });
        const onOnline = () => setIsOnline(true);
        const onOffline = () => setIsOnline(false);
        const onInstall = () => setInstallReady(true);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        window.addEventListener('lv:pwa-install-available', onInstall);
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible')
                sessionStorage.setItem(SESSION_KEY, JSON.stringify({ lastSeenAt: nowIso(), step, online: navigator.onLine }));
        });
        return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); window.removeEventListener('lv:pwa-install-available', onInstall); };
    }, [step]);
    const baseFare = useMemo(() => Math.round((Math.max(14, (pickup.length + destination.length) * 0.8) + (passengers > 3 ? (passengers - 3) * 6 : 0) + (airportTransfer ? 18 : 0) + (businessVip ? 24 : 0)) * vehicle.priceMultiplier), [pickup.length, destination.length, passengers, airportTransfer, businessVip, vehicle.priceMultiplier]);
    const serviceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
    const submitBooking = async () => {
        if (loading || !isOnline)
            return;
        if (!pickup || !destination || !dateTime) {
            setError('Please complete pickup, destination, and schedule before confirming.');
            return;
        }
        const dedupeKey = requestKey ?? (globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`);
        if (inFlightKeyRef.current === dedupeKey)
            return;
        inFlightKeyRef.current = dedupeKey;
        setRequestKey(dedupeKey);
        setError('');
        setInfo('Submitting your booking securely...');
        setLoading(true);
        appendEvent('submit_started', { dedupeKey, step });
        try {
            const response = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey }, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType }) });
            const payload = await response.json();
            if (!response.ok)
                throw new Error(payload?.message ?? 'Unable to create booking');
            setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
            setInfo('Booking created successfully.');
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
    const resetDraft = () => { localStorage.removeItem(STORAGE_KEY); appendEvent('draft_cleared'); window.location.reload(); };
    return _jsxs("div", { className: 'premium-shell min-h-screen px-3 py-4 text-white sm:px-6 lg:px-8', children: [_jsxs("div", { className: 'mx-auto w-full max-w-6xl space-y-4', children: [_jsxs("header", { className: 'glass-panel rounded-3xl p-4 sm:p-6', children: [_jsxs("div", { className: 'flex flex-wrap items-center justify-between gap-4', children: [_jsxs("div", { children: [_jsx("p", { className: 'logo-mark', children: "LV TRANSPORT" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Executive mobility platform \u00B7 Antwerp \u00B7 Airport & Business" })] }), _jsx("div", { className: 'network-dot-grid hidden md:block' })] }), _jsxs("div", { className: 'mt-4 grid gap-2 md:grid-cols-3', children: [_jsxs("div", { className: 'status-pill', children: ["Realtime Network: ", _jsx("span", { className: isOnline ? 'text-emerald-300' : 'text-amber-300', children: isOnline ? 'Dispatch online' : 'Offline-safe mode' })] }), _jsxs("div", { className: 'status-pill', children: ["Platform Session: ", _jsx("span", { className: 'text-lv-champagne', children: installReady ? 'PWA install ready' : 'Browser install pending' })] }), _jsxs("div", { className: 'status-pill', children: ["Operational Promise: ", _jsx("span", { className: 'text-lv-champagne', children: "Founder-operated premium service" })] })] })] }), _jsxs("section", { className: 'grid gap-4 lg:grid-cols-[1.2fr_0.8fr]', children: [_jsx("div", { className: 'glass-panel rounded-3xl p-4 sm:p-6', children: confirmation ? _jsxs("div", { className: 'space-y-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Booking confirmed" }), _jsxs("h2", { className: 'text-2xl font-semibold', children: ["Reference: ", confirmation.referenceCode] }), _jsxs("p", { className: 'text-lv-mist', children: ["Status: ", confirmation.status] }), _jsx("p", { className: 'text-xs text-lv-mist', children: "Your itinerary is now monitored by our realtime operations layer." }), _jsx(Button, { className: 'shadow-gold-md', onClick: resetDraft, children: "Create another booking" })] }) : _jsxs(_Fragment, { children: [_jsxs("div", { className: 'mb-4 flex items-center justify-between', children: [_jsxs("p", { className: 'text-sm text-lv-mist', children: ["Reservation step ", step, " of 3"] }), _jsx("p", { className: 'text-xs text-lv-mist', children: "Premium itinerary intake with secure dispatch handoff." })] }), step === 1 && _jsxs("div", { className: 'space-y-4 booking-step-fade', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Pickup" }), _jsx("input", { placeholder: 'Hotel, office, airport terminal...', value: pickup, onChange: (e) => setPickup(e.target.value) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Destination" }), _jsx("input", { placeholder: 'Boardroom, residence, event venue...', value: destination, onChange: (e) => setDestination(e.target.value) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Date & time" }), _jsx("input", { type: 'datetime-local', value: dateTime, onChange: (e) => setDateTime(e.target.value) })] })] }), step === 2 && _jsxs("div", { className: 'space-y-4 booking-step-fade', children: [_jsxs("div", { className: 'field-wrap', children: [_jsx("span", { children: "Passengers" }), _jsxs("div", { className: 'mt-2 flex items-center justify-between rounded-2xl border border-lv-gold/20 bg-white/5 px-4 py-3', children: [_jsx("button", { className: 'control-btn', onClick: () => setPassengers((v) => Math.max(1, v - 1)), children: "\u2212" }), _jsx("strong", { className: 'text-lg', children: passengers }), _jsx("button", { className: 'control-btn', onClick: () => setPassengers((v) => Math.min(12, v + 1)), children: "+" })] })] }), _jsx("div", { className: 'grid gap-2', children: vehicles.map((item) => _jsx("button", { onClick: () => setVehicle(item), className: `vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`, children: _jsxs("div", { children: [_jsx("p", { className: 'font-medium', children: item.name }), _jsxs("p", { className: 'text-xs text-lv-mist', children: ["ETA ", item.eta, " \u2022 up to ", item.seats, " passengers"] })] }) }, item.name)) })] }), step === 3 && _jsxs("div", { className: 'space-y-3 booking-step-fade', children: [_jsx("button", { className: `toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`, onClick: () => setAirportTransfer((v) => !v), children: "Airport transfer" }), _jsx("button", { className: `toggle-card ${businessVip ? 'toggle-card--active' : ''}`, onClick: () => setBusinessVip((v) => !v), children: "Business / VIP concierge" })] }), info && _jsx("p", { className: 'mt-3 text-sm text-lv-champagne', children: info }), error && _jsx("p", { className: 'mt-3 text-sm text-rose-300', children: error }), _jsxs("div", { className: 'mt-5 flex gap-2', children: [_jsx(Button, { variant: 'secondary', className: 'flex-1', disabled: loading, onClick: () => setStep((v) => (v > 1 ? (v - 1) : v)), children: "Back" }), step < 3 ? _jsx(Button, { className: 'flex-1', disabled: loading, onClick: () => setStep((v) => (v < 3 ? (v + 1) : v)), children: "Continue" }) : _jsx(Button, { className: 'flex-1 shadow-gold-md', onClick: submitBooking, disabled: loading || !pickup || !destination || !dateTime || !isOnline, children: loading ? 'Submitting...' : 'Confirm premium booking' })] })] }) }), _jsxs("aside", { className: 'space-y-4', children: [_jsxs("article", { className: 'glass-panel rounded-3xl p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Live fare estimate" }), _jsxs("p", { className: 'mt-2 text-3xl font-semibold', children: ["\u20AC", baseFare] })] }), _jsxs("article", { className: 'glass-panel rounded-3xl p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Trip brief" }), _jsxs("ul", { className: 'mt-3 space-y-2 text-sm', children: [_jsxs("li", { children: ["Pickup: ", pickup || 'Not set'] }), _jsxs("li", { children: ["Destination: ", destination || 'Not set'] }), _jsxs("li", { children: ["Schedule: ", formatDateTime(dateTime)] })] })] }), _jsxs("article", { className: 'glass-panel network-panel rounded-3xl p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Control tower snapshot" }), _jsxs("ul", { className: 'mt-3 space-y-2 text-sm text-lv-mist', children: [_jsx("li", { children: "\u2022 Driver readiness synced" }), _jsx("li", { children: "\u2022 Route confidence nominal" }), _jsx("li", { children: "\u2022 ETA telemetry stable" })] })] })] })] })] }), _jsx(MoniAssistant, {})] });
}

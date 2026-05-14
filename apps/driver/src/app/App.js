import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { BookingLifecycle, canTransitionLifecycle, isImmutableLifecycleStatus, registerLifecycleEvent } from '@lvtransport/realtime';
import { createDriverGpsService } from '../modules/tracking/services/driver-gps.service';
const DRIVER_ID = 'drv-101';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const API_ORIGIN = new URL(API_BASE).origin;
const stepLabel = {
    assigned: 'Rit accepteren',
    accepted: 'Onderweg naar klant',
    en_route: 'Aangekomen',
    arrived: 'Rit gestart',
    in_progress: 'Rit afronden'
};
export function App() {
    const [bookings, setBookings] = useState([]);
    const [liveLocation, setLiveLocation] = useState(false);
    const [gpsMessage, setGpsMessage] = useState('Locatiedeling staat uit.');
    const gpsService = useMemo(() => createDriverGpsService({ minUpdateMs: 8000, minDistanceMeters: 25 }), []);
    const refresh = async () => {
        const response = await fetch(`${API_BASE}/bookings`);
        const result = await response.json();
        setBookings(result.bookings.filter((b) => b.assignedDriverName === 'Marco V.' || b.status === 'assigned'));
    };
    const activeBookingId = bookings.find((b) => !['completed', 'cancelled', 'failed'].includes(b.status))?.id;
    const sendLocation = async (snapshot) => {
        await fetch(`${API_BASE}/drivers/${DRIVER_ID}/location`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...snapshot, bookingId: activeBookingId, idempotencyKey: `gps-${DRIVER_ID}-${snapshot.capturedAt}` })
        });
        setGpsMessage(`Live locatie bijgewerkt om ${new Date(snapshot.capturedAt).toLocaleTimeString('nl-BE')}.`);
    };
    useEffect(() => { refresh(); const wsProtocol = API_ORIGIN.startsWith('https') ? 'wss' : 'ws'; const wsHost = API_ORIGIN.replace(/^https?:\/\//, ''); const ws = new WebSocket(`${wsProtocol}://${wsHost}/ws`); ws.onmessage = () => refresh(); return () => ws.close(); }, []);
    useEffect(() => { if (!liveLocation) {
        gpsService.stop();
        setGpsMessage('Locatiedeling staat uit.');
        return;
    } gpsService.start(sendLocation, setGpsMessage); return () => gpsService.stop(); }, [liveLocation, activeBookingId, gpsService]);
    const updateStatus = async (booking) => {
        const transitionMap = {
            [BookingLifecycle.ASSIGNED]: BookingLifecycle.ACCEPTED,
            [BookingLifecycle.ACCEPTED]: BookingLifecycle.EN_ROUTE,
            [BookingLifecycle.EN_ROUTE]: BookingLifecycle.ARRIVED,
            [BookingLifecycle.ARRIVED]: BookingLifecycle.IN_PROGRESS,
            [BookingLifecycle.IN_PROGRESS]: BookingLifecycle.COMPLETED
        };
        const nextStatus = transitionMap[booking.status];
        if (!nextStatus || !canTransitionLifecycle(booking.status, nextStatus))
            return;
        if (isImmutableLifecycleStatus(booking.status))
            return;
        const eventKey = `driver-${booking.id}-${booking.version}`;
        if (!registerLifecycleEvent(eventKey))
            return;
        setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: nextStatus, version: b.version + 1 } : b));
        const response = await fetch(`${API_BASE}/bookings/${booking.id}/status`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus, actor: 'driver', expectedVersion: booking.version, idempotencyKey: eventKey })
        });
        if (!response.ok)
            refresh();
        if (response.ok && isImmutableLifecycleStatus(nextStatus))
            setLiveLocation(false);
    };
    return _jsxs("main", { className: "min-h-screen bg-lvtp-obsidian p-4 text-white sm:p-6", children: [_jsx("div", { className: "lvtp-network absolute inset-0 pointer-events-none opacity-40" }), _jsxs("div", { className: "relative mx-auto max-w-3xl space-y-4", children: [_jsxs("header", { className: "lvtp-shell rounded-3xl p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black/80 p-1" }), _jsx("h1", { className: "text-xl font-semibold text-amber-200", children: "Driver Operations" })] }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Snelle lifecycle-controle voor professionele, veilige rituitvoering." })] }), _jsxs("section", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("button", { className: "lvtp-btn-primary w-full", onClick: () => setLiveLocation((v) => !v), children: liveLocation ? 'Locatiedeling stoppen' : 'Locatiedeling starten' }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: gpsMessage })] }), _jsx("section", { className: "grid gap-3", children: bookings.map((booking) => _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "font-semibold text-amber-100", children: booking.code }), _jsxs("p", { className: "text-sm text-zinc-300", children: ["Status: ", booking.status] }), stepLabel[booking.status] && _jsx("button", { className: "lvtp-btn-primary mt-3 w-full", onClick: () => updateStatus(booking), children: stepLabel[booking.status] }), booking.status === 'completed' && _jsx("p", { className: "mt-2 text-sm text-emerald-300", children: "Rit correct afgerond." })] }, booking.id)) })] })] });
}

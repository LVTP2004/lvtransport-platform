import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { createDriverGpsService } from '../modules/tracking/services/driver-gps.service';
const statusFlow = ['pending', 'assigned', 'accepted', 'en_route', 'arrived', 'in_progress', 'completed'];
const DRIVER_ID = 'drv-101';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
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
        await fetch(`http://localhost:8080/api/v1/drivers/${DRIVER_ID}/location`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...snapshot, bookingId: activeBookingId, idempotencyKey: `gps-${DRIVER_ID}-${snapshot.capturedAt}` })
        });
        setGpsMessage(`Live locatie bijgewerkt om ${new Date(snapshot.capturedAt).toLocaleTimeString('nl-BE')}.`);
    };
    useEffect(() => { refresh(); const ws = new WebSocket(`${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8080/ws`); ws.onmessage = () => refresh(); return () => ws.close(); }, []);
    useEffect(() => { if (!liveLocation) {
        gpsService.stop();
        setGpsMessage('Locatiedeling staat uit.');
        return;
    } gpsService.start(sendLocation, setGpsMessage); return () => gpsService.stop(); }, [liveLocation, activeBookingId, gpsService]);
    const updateStatus = async (booking) => {
        const idx = statusFlow.findIndex((s) => s === booking.status);
        if (idx < 0 || idx >= statusFlow.length - 1)
            return;
        const nextStatus = statusFlow[idx + 1];
        setBookings((prev) => prev.map((b) => b.id === booking.id ? { ...b, status: nextStatus, version: b.version + 1 } : b));
        const response = await fetch(`${API_BASE}/bookings/${booking.id}/status`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: nextStatus, actor: 'driver', expectedVersion: booking.version, idempotencyKey: `driver-${booking.id}-${booking.version}` })
        });
        if (!response.ok)
            refresh();
    };
    return _jsx("main", { className: "min-h-screen bg-zinc-950 p-4 text-white sm:p-6", children: _jsxs("div", { className: "mx-auto max-w-3xl space-y-4", children: [_jsxs("header", { className: "rounded-2xl border border-amber-300/25 bg-black/70 p-4", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black/80 p-1" }), _jsx("h1", { className: "text-xl font-semibold text-amber-300", children: "Driver Panel" })] }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Duidelijke ritstatus voor veilige en professionele uitvoering." })] }), _jsxs("section", { className: "rounded-2xl border border-zinc-700 bg-zinc-900 p-4", children: [_jsx("button", { className: "w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-black", onClick: () => setLiveLocation((v) => !v), children: liveLocation ? 'Locatiedeling stoppen' : 'Locatiedeling starten' }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: gpsMessage })] }), _jsx("section", { className: "grid gap-3", children: bookings.map((booking) => _jsxs("article", { className: "rounded-2xl border border-zinc-700 bg-zinc-900 p-4", children: [_jsx("p", { className: "font-semibold", children: booking.code }), _jsxs("p", { className: "text-sm text-zinc-300", children: ["Status: ", booking.status] }), booking.status === 'assigned' && _jsx("button", { className: "mt-3 w-full rounded-lg bg-amber-500 px-3 py-2 font-medium text-black", onClick: () => updateStatus(booking), children: "Rit accepteren" }), !['completed', 'cancelled', 'failed'].includes(booking.status) && _jsx("button", { className: "mt-2 w-full rounded-lg border border-zinc-600 px-3 py-2", onClick: () => updateStatus(booking), children: "Volgende status" }), booking.status === 'completed' && _jsx("p", { className: "mt-2 text-sm text-emerald-300", children: "Rit correct afgerond." })] }, booking.id)) })] }) });
}

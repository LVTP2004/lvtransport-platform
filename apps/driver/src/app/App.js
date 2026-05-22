import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { AccountStatus, UserRole } from '@lvtransport/auth';
import { driverAuthProvider, driverAuthService } from '../modules/auth/services/auth-client.service';
export function App() {
    const [authState, setAuthState] = useState({ isAuthenticated: false, isLoading: true });
    const [email, setEmail] = useState('driver@lvtransport.dev');
    const [password, setPassword] = useState('password123');
    const [allowed, setAllowed] = useState(false);
    useEffect(() => { driverAuthService.getInitialState().then(setAuthState); }, []);
    const login = async () => { const t = await driverAuthService.signIn({ email, password }); const u = await driverAuthProvider.getUserProfile(t.accessToken); setAllowed(Boolean(u?.roles.includes(UserRole.DRIVER) && u.status === AccountStatus.ACTIVE)); setAuthState({ isAuthenticated: true, isLoading: false, tokens: t }); };
    const logout = async () => { localStorage.clear(); setAuthState({ isAuthenticated: false, isLoading: false }); setAllowed(false); };
    if (!authState.isAuthenticated)
        return _jsxs("main", { className: 'min-h-screen bg-zinc-950 p-8 text-white', children: [_jsx("h1", { className: 'text-3xl mb-4', children: "Driver Login" }), _jsx("input", { className: 'text-black p-2 mr-2', value: email, onChange: (e) => setEmail(e.target.value) }), _jsx("input", { className: 'text-black p-2 mr-2', type: 'password', value: password, onChange: (e) => setPassword(e.target.value) }), _jsx("button", { className: 'bg-amber-400 text-black px-3 py-2 rounded', onClick: login, children: "Sign in" })] });
    if (!allowed)
        return _jsxs("main", { className: 'min-h-screen bg-zinc-950 p-8 text-white', children: ["Access denied", _jsx("button", { onClick: logout, children: "Logout" })] });
    return _jsxs("main", { className: 'min-h-screen bg-zinc-950 text-white p-8', children: [_jsx("h1", { className: 'text-3xl text-amber-300', children: "Driver Console" }), _jsx("p", { children: "Authenticated driver session ready for trip state modules." }), _jsx("button", { onClick: logout, children: "Logout" })] });
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
    const [driverDot, setDriverDot] = useState({ x: 28, y: 72 });
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
    useEffect(() => { const t = setInterval(() => setDriverDot((d) => ({ x: d.x > 78 ? 28 : d.x + 2, y: d.y < 34 ? 72 : d.y - 1.3 })), 1300); return () => clearInterval(t); }, []);
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
    return _jsxs("main", { className: "min-h-screen bg-lvtp-obsidian p-4 text-white sm:p-6", children: [_jsx("div", { className: "lvtp-network absolute inset-0 pointer-events-none opacity-40" }), _jsxs("div", { className: "relative mx-auto max-w-3xl space-y-4", children: [_jsxs("header", { className: "lvtp-shell rounded-3xl p-5", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("img", { src: "/brand/lv-logo-primary.svg", alt: "LV Transport", className: "h-10 w-auto rounded-md border border-amber-400/30 bg-black/80 p-1" }), _jsx("h1", { className: "text-xl font-semibold text-amber-200", children: "Driver Operations" })] }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: "Snelle lifecycle-controle voor professionele, veilige rituitvoering." })] }), _jsxs("section", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("button", { className: "lvtp-btn-primary w-full", onClick: () => setLiveLocation((v) => !v), children: liveLocation ? 'Locatiedeling stoppen' : 'Locatiedeling starten' }), _jsx("p", { className: "mt-2 text-sm text-zinc-300", children: gpsMessage })] }), _jsx("section", { className: "lvtp-card overflow-hidden rounded-2xl p-0", children: _jsxs("div", { className: "relative h-[52vh] min-h-[340px] bg-[#06070a]", children: [_jsx("div", { className: "absolute inset-0 opacity-40", style: { backgroundImage: 'linear-gradient(rgba(245,191,73,.08) 1px, transparent 1px),linear-gradient(90deg, rgba(245,191,73,.08) 1px, transparent 1px)', backgroundSize: '34px 34px' } }), _jsx("div", { className: "absolute left-[12%] top-[62%] rounded-full border border-amber-300/40 bg-black/70 px-2 py-1 text-xs text-amber-100", children: "Pickup" }), _jsx("div", { className: "absolute right-[14%] top-[20%] rounded-full border border-amber-300/40 bg-black/70 px-2 py-1 text-xs text-amber-100", children: "Dropoff" }), _jsx("div", { className: "absolute left-[13%] top-[64%] h-[2px] w-[72%] -rotate-[29deg] bg-amber-300/70" }), _jsx("div", { className: "absolute z-20 h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_16px_rgba(245,191,73,.8)] transition-all duration-1000", style: { left: `${driverDot.x}%`, top: `${driverDot.y}%` } })] }) }), _jsx("section", { className: "grid gap-3", children: bookings.map((booking) => _jsxs("article", { className: "lvtp-card rounded-2xl p-4", children: [_jsx("p", { className: "font-semibold text-amber-100", children: booking.code }), _jsxs("p", { className: "text-sm text-zinc-300", children: ["Status: ", booking.status] }), stepLabel[booking.status] && _jsx("button", { className: "lvtp-btn-primary mt-3 w-full", onClick: () => updateStatus(booking), children: stepLabel[booking.status] }), booking.status === 'completed' && _jsx("p", { className: "mt-2 text-sm text-emerald-300", children: "Rit correct afgerond." })] }, booking.id)) })] })] });
}

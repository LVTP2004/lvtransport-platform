import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { BookingLifecycle, isImmutableLifecycleStatus } from '@lvtransport/realtime';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';
const routeMap = {
    '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin'
};
const navItems = [
    { label: 'Boeken', path: '/booking', section: 'booking' },
    { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
    { label: 'Rit volgen', path: '/tracking', section: 'tracking' },
    { label: 'Diensten', path: '/diensten', section: 'diensten' },
    { label: 'LV VIP', path: '/vip', section: 'vip' },
    { label: 'Contact', path: '/contact', section: 'contact' }
];
const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
const normalizeLifecycle = (status) => {
    const map = {
        draft: BookingLifecycle.PENDING,
        submitted: BookingLifecycle.PENDING,
        confirmed: BookingLifecycle.ASSIGNED,
        assigned: BookingLifecycle.ASSIGNED,
        accepted: BookingLifecycle.ACCEPTED,
        en_route: BookingLifecycle.EN_ROUTE,
        arrived: BookingLifecycle.ARRIVED,
        in_progress: BookingLifecycle.IN_PROGRESS,
        completed: BookingLifecycle.COMPLETED,
        cancelled: BookingLifecycle.CANCELLED,
        failed: BookingLifecycle.FAILED,
        pending: BookingLifecycle.PENDING
    };
    return map[String(status).toLowerCase()] ?? null;
};
export function App() {
    const [route, setRoute] = useState(() => routeMap[window.location.pathname] ?? 'home');
    const [menuOpen, setMenuOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
    const [confirm, setConfirm] = useState('');
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om realtime lifecycle-status te controleren.');
    const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
    const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);
    useEffect(() => {
        const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);
    const navigate = (path, section) => {
        window.history.pushState({}, '', path);
        setRoute(routeMap[path] ?? 'home');
        setMenuOpen(false);
        if (section)
            setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
    };
    const onSubmitBooking = async (event) => {
        event.preventDefault();
        const code = createRideCode();
        const payload = { ...form, code, createdAt: new Date().toISOString(), status: 'submitted' };
        const dedupeKey = `web-booking-${payload.phone}-${payload.date}-${payload.time}-${payload.pickup}`;
        const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]');
        if (sessionStorage.getItem(dedupeKey)) {
            setConfirm('Dubbele verzending geblokkeerd. Uw eerdere boeking werd al verwerkt.');
            return;
        }
        localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));
        sessionStorage.setItem(dedupeKey, payload.code);
        let message = `Bedankt ${form.name || 'klant'}, uw rit ${code} is ingediend.`;
        try {
            if (API_BASE_URL) {
                const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                message += response.ok ? ' Sync met dispatch bevestigd.' : ' API tijdelijk offline: veilige lokale fallback actief.';
            }
            else {
                message += ' API endpoint ontbreekt: veilige lokale fallback actief.';
            }
        }
        catch {
            message += ' Synchronisatie tijdelijk verstoord, rit veilig lokaal opgeslagen.';
        }
        setConfirm(message);
    };
    const checkTracking = () => {
        const normalized = trackingInput.trim().toUpperCase();
        if (!/^LV\d{5}$/.test(normalized))
            return setTrackingResult('Ongeldige code. Gebruik formaat LV12345.');
        const records = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]');
        const ride = records.find((record) => record.code === normalized);
        if (!ride)
            return setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);
        const lifecycle = normalizeLifecycle(ride.status);
        if (!lifecycle)
            return setTrackingResult(`Rit ${ride.code}: status onbekend, neem contact op met dispatch.`);
        const immutable = isImmutableLifecycleStatus(lifecycle);
        setTrackingResult(`Rit ${ride.code}: status ${lifecycle.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
    };
    return _jsx("div", { className: 'premium-shell min-h-screen text-white', children: _jsxs("div", { className: 'mx-auto max-w-6xl px-4 py-4 sm:px-6', children: [_jsxs("header", { className: 'glass-panel sticky top-3 z-40 rounded-3xl p-3 sm:p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("button", { onClick: () => navigate('/', 'hero'), children: _jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-9', alt: 'LV Transport logo' }) }), _jsx("button", { className: 'hamburger md:hidden', onClick: () => setMenuOpen((value) => !value), children: menuOpen ? 'Sluit' : 'Menu' }), _jsxs("nav", { className: 'ml-auto hidden items-center gap-2 md:flex', children: [navItems.map((item) => _jsx("button", { className: 'nav-btn', onClick: () => navigate(item.path, item.section), children: item.label }, item.path)), _jsx("button", { className: 'surface-btn', onClick: () => navigate('/driver'), children: "Driver" }), _jsx("button", { className: 'surface-btn', onClick: () => navigate('/admin'), children: "Admin" })] })] }), _jsxs("div", { className: `mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`, children: [navItems.map((item) => _jsx("button", { className: 'mobile-nav-btn', onClick: () => navigate(item.path, item.section), children: item.label }, item.path)), _jsx("button", { className: 'mobile-nav-btn', onClick: () => navigate('/driver'), children: "Driver omgeving" }), _jsx("button", { className: 'mobile-nav-btn', onClick: () => navigate('/admin'), children: "Admin omgeving" })] })] }), _jsxs("section", { id: 'hero', className: 'glass-panel hero-panel mt-4 rounded-3xl p-6 sm:p-10', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.25em] text-lv-champagne', children: "LV Transport Platform" }), _jsx("h1", { className: 'mt-3 text-4xl font-semibold sm:text-6xl', children: "Premium vervoer in Antwerpen en Belgi\u00EB" }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "Airport, VIP en zakelijke ritten met operationele opvolging, realtime statuscommunicatie en dispatch-ready lifecycle." }), _jsxs("div", { className: 'mt-6 flex flex-wrap gap-2', children: [_jsx("button", { className: 'nav-btn', onClick: () => navigate('/booking', 'booking'), children: "Start boeking" }), _jsx("button", { className: 'nav-btn', onClick: () => navigate('/tracking', 'tracking'), children: "Volg uw rit" })] })] }), _jsxs("section", { id: 'booking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Boekingsaanvraag" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Uw aanvraag wordt lokaal veilig vastgelegd en indien beschikbaar direct met dispatch gesynchroniseerd." }), _jsxs("form", { className: 'mt-4 grid gap-3 sm:grid-cols-2', onSubmit: onSubmitBooking, children: [['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) => _jsxs("label", { className: `field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: key }), _jsx("input", { required: key !== 'notes', value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) })] }, key)), _jsx("div", { className: 'sm:col-span-2', children: _jsx(Button, { type: 'submit', children: "Reserveer nu" }) })] }), confirm && _jsx("p", { className: 'mt-3 status-line status-line--active', children: confirm })] }), _jsxs("section", { id: 'prijzen', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Prijs berekenen" }), _jsxs("div", { className: 'mt-4 grid gap-3 md:grid-cols-2', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Afstand (km)" }), _jsx("input", { type: 'number', min: 1, value: calc.km, onChange: (event) => setCalc({ ...calc, km: Number(event.target.value) || 0 }) })] }), _jsxs("div", { className: 'flex flex-col gap-2 rounded-2xl border border-lv-gold/25 bg-black/30 p-4 text-sm', children: [_jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.airport, onChange: (event) => setCalc({ ...calc, airport: event.target.checked }) }), " Airport toeslag"] }), _jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.business, onChange: (event) => setCalc({ ...calc, business: event.target.checked }) }), " Business service"] }), _jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.isNight, onChange: (event) => setCalc({ ...calc, isNight: event.target.checked }) }), " Nachtregeling"] })] })] }), _jsxs("p", { className: 'mt-4 text-lg', children: ["Geschatte prijs: ", _jsxs("b", { className: 'text-lv-champagne', children: ["\u20AC", price] })] })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Volg uw taxi" }), _jsxs("div", { className: 'mt-3 flex flex-col gap-2 sm:flex-row', children: [_jsx("input", { className: 'estimate-input', placeholder: 'LV12345', value: trackingInput, onChange: (event) => setTrackingInput(event.target.value) }), _jsx(Button, { variant: 'secondary', onClick: checkTracking, children: "Controleer status" })] }), _jsx("p", { className: 'mt-3 status-line', children: trackingResult })] }), _jsx("section", { id: 'diensten', className: 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: ['Airport transfers', 'Private rides', 'Business & VIP', '24/7 dispatch opvolging'].map((service) => _jsx("article", { className: 'glass-panel service-card rounded-2xl p-4', children: service }, service)) }), _jsx("section", { id: 'vip', className: 'glass-panel mt-4 rounded-3xl p-6 text-lv-mist', children: "Prioriteitsservice, facturatie, vaste accountmanager en gecentraliseerde operationele opvolging voor bedrijven en frequente reizigers." }), _jsx("footer", { id: 'contact', className: 'glass-panel my-4 rounded-3xl p-6 text-sm', children: "info@lvtransport.be \u2022 +32 466 48 79 36 \u2022 Antwerpen \u2022 Belgi\u00EB" }), _jsx(MoniAssistant, {}), (route === 'driver' || route === 'admin') && _jsx("div", { className: 'fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm', children: route === 'driver' ? _jsx("a", { href: DRIVER_SURFACE_URL, children: "Open Driver omgeving" }) : _jsx("a", { href: ADMIN_SURFACE_URL, children: "Open Admin omgeving" }) })] }) });
}

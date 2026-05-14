import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';
const routeMap = {
    '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin'
};
const navItems = [
    { label: 'Boeken', path: '/booking', section: 'booking' },
    { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
    { label: 'Volg uw taxi', path: '/tracking', section: 'tracking' },
    { label: 'Diensten', path: '/diensten', section: 'diensten' },
    { label: 'LV VIP', path: '/vip', section: 'vip' },
    { label: 'Contact', path: '/contact', section: 'contact' }
];
const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
export function App() {
    const [route, setRoute] = useState(() => routeMap[window.location.pathname] ?? 'home');
    const [menuOpen, setMenuOpen] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
    const [confirm, setConfirm] = useState('');
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om lifecycle-status te valideren.');
    const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
    const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);
    useEffect(() => {
        const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);
    useEffect(() => {
        if (route !== 'home')
            document.getElementById(route)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [route]);
    const navigate = (path, section) => {
        window.history.pushState({}, '', path);
        setRoute(routeMap[path] ?? 'home');
        setMenuOpen(false);
        if (section)
            setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
    };
    const onSubmitBooking = async (event) => {
        event.preventDefault();
        const code = createRideCode();
        const payload = { ...form, code, createdAt: new Date().toISOString(), status: 'submitted' };
        const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]');
        localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));
        let message = `Bedankt ${form.name || 'klant'}, uw rit ${code} is ingediend.`;
        try {
            if (API_BASE_URL) {
                const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                message += response.ok ? ' De aanvraag is gesynchroniseerd met dispatch.' : ' API offline: lokale fallback actief.';
            }
            else {
                message += ' API endpoint ontbreekt: lokale fallback actief.';
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
        const ride = records.find((r) => r.code === normalized);
        if (!ride)
            return setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);
        const immutable = ride.status === 'completed' || ride.status === 'cancelled';
        setTrackingResult(`Rit ${ride.code}: status ${ride.status.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
    };
    return _jsx("div", { className: 'premium-shell min-h-screen text-white', children: _jsxs("div", { className: 'mx-auto max-w-6xl px-4 py-4 sm:px-6', children: [_jsx("header", { className: 'glass-panel sticky top-3 z-40 rounded-3xl p-4', children: _jsxs("nav", { className: 'hidden items-center gap-3 md:flex', children: [_jsx("button", { onClick: () => navigate('/', 'hero'), children: _jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-9', alt: 'LV Transport logo' }) }), _jsx("div", { className: 'mx-auto flex gap-2', children: navItems.map((item) => _jsx("button", { className: 'nav-btn', onClick: () => navigate(item.path, item.section), children: item.label }, item.path)) }), _jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/driver'), children: "Driver" }), _jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/admin'), children: "Admin" })] }) }), _jsxs("section", { id: 'hero', className: 'glass-panel mt-4 rounded-3xl p-6 sm:p-10', children: [_jsx("h1", { className: 'text-4xl font-semibold sm:text-6xl', children: "Premium vervoer in Antwerpen en Belgi\u00EB" }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "Airport, VIP en zakelijke ritten met realtime operationele opvolging." })] }), _jsxs("section", { id: 'booking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Boekingsaanvraag" }), _jsxs("form", { className: 'mt-4 grid gap-3 sm:grid-cols-2', onSubmit: onSubmitBooking, children: [['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((k) => _jsxs("label", { className: `field-wrap ${k === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: k }), _jsx("input", { required: k !== 'notes', value: form[k], onChange: (e) => setForm({ ...form, [k]: e.target.value }) })] }, k)), _jsx("div", { className: 'sm:col-span-2', children: _jsx(Button, { type: 'submit', children: "Reserveer nu" }) })] }), confirm && _jsx("p", { className: 'mt-3 status-line status-line--active', children: confirm })] }), _jsxs("section", { id: 'prijzen', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Prijs berekenen" }), _jsxs("p", { className: 'mt-4 text-lg', children: ["Geschatte prijs: ", _jsxs("b", { className: 'text-lv-champagne', children: ["\u20AC", price] })] })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Volg uw taxi" }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx("input", { className: 'estimate-input', placeholder: 'LV12345', value: trackingInput, onChange: (e) => setTrackingInput(e.target.value) }), _jsx(Button, { variant: 'secondary', onClick: checkTracking, children: "Controleer" })] }), _jsx("p", { className: 'mt-3 status-line', children: trackingResult })] }), _jsx("section", { id: 'diensten', className: 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: ['Airport transfer', 'Private rides', 'Business/VIP', '24/7 dispatch'].map((service) => _jsx("article", { className: 'glass-panel service-card rounded-2xl p-4', children: service }, service)) }), _jsx("section", { id: 'vip', className: 'glass-panel mt-4 rounded-3xl p-6', children: "Prioriteitsservice, facturatie en vaste accountmanager voor bedrijven." }), _jsx("footer", { id: 'contact', className: 'glass-panel my-4 rounded-3xl p-6 text-sm', children: "info@lvtransport.be \u2022 +32 466 48 79 36 \u2022 Antwerpen" }), _jsx(MoniAssistant, {}), (route === 'driver' || route === 'admin') && _jsx("div", { className: 'fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm', children: route === 'driver' ? _jsx("a", { href: DRIVER_SURFACE_URL, children: "Open Driver omgeving" }) : _jsx("a", { href: ADMIN_SURFACE_URL, children: "Open Admin omgeving" }) })] }) });
}

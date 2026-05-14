import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';
const routeMap = {
    '/': 'home',
    '/booking': 'booking',
    '/prijzen': 'prijzen',
    '/tracking': 'tracking',
    '/diensten': 'diensten',
    '/contact': 'contact',
    '/moni-ride': 'moni',
    '/maps': 'maps',
    '/driver': 'driver',
    '/admin': 'admin',
    '/dashboard': 'dashboard'
};
const navItems = [
    { label: 'Boeken', path: '/booking', section: 'booking' },
    { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
    { label: 'Volg uw taxi', path: '/tracking', section: 'tracking' },
    { label: 'Diensten', path: '/diensten', section: 'diensten' },
    { label: 'LV VIP', path: '/dashboard', section: 'vip' },
    { label: 'Contact', path: '/contact', section: 'contact' }
];
const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
export function App() {
    const [route, setRoute] = useState(() => routeMap[window.location.pathname] ?? 'home');
    const [menuOpen, setMenuOpen] = useState(false);
    const [rideCode, setRideCode] = useState('');
    const [confirm, setConfirm] = useState('');
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingResult, setTrackingResult] = useState('Tracking wordt gekoppeld aan uw ritcode zodra de rit bevestigd is.');
    const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
    const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
    useEffect(() => {
        const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);
    useEffect(() => {
        const section = route === 'dashboard' ? 'vip' : route;
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [route]);
    const price = useMemo(() => {
        const base = 28;
        const perKm = calc.isNight ? 2.8 : 2.3;
        const airportFee = calc.airport ? 12 : 0;
        const businessFee = calc.business ? 8 : 0;
        return Math.round(base + calc.km * perKm + airportFee + businessFee);
    }, [calc]);
    const navigate = (path, section) => {
        window.history.pushState({}, '', path);
        setRoute(routeMap[path] ?? 'home');
        setMenuOpen(false);
        if (section) {
            setTimeout(() => {
                document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 30);
        }
    };
    const onSubmitBooking = async (event) => {
        event.preventDefault();
        const code = createRideCode();
        const payload = { ...form, code, createdAt: new Date().toISOString() };
        const stored = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]');
        localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...stored].slice(0, 25)));
        let apiText = 'Opgeslagen op uw toestel.';
        try {
            if (API_BASE_URL) {
                const response = await fetch(`${API_BASE_URL}/bookings`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                apiText = response.ok ? 'Rit ook doorgestuurd naar LV Transport.' : 'Backend tijdelijk onbereikbaar, lokaal bewaard.';
            }
        }
        catch {
            apiText = 'Backend tijdelijk onbereikbaar, lokaal bewaard.';
        }
        setRideCode(code);
        setConfirm(`Bedankt ${form.name || 'klant'}, uw ritaanvraag is ontvangen. Ritcode: ${code}. ${apiText}`);
    };
    const whatsappText = encodeURIComponent(`Nieuwe ritaanvraag ${rideCode || 'LV?????'}. Naam: ${form.name}. Pickup: ${form.pickup}. Bestemming: ${form.destination}. Datum: ${form.date} ${form.time}. Service: ${form.serviceType}.`);
    return _jsxs("div", { className: 'premium-shell min-h-screen text-white', children: [_jsxs("div", { className: 'mx-auto max-w-6xl px-4 py-4 sm:px-6', children: [_jsxs("header", { className: 'glass-panel sticky top-3 z-40 rounded-3xl p-4', children: [_jsxs("nav", { className: 'hidden items-center gap-3 md:flex', children: [_jsx("button", { onClick: () => navigate('/', 'hero'), children: _jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-9', alt: 'LV Transport logo' }) }), _jsx("div", { className: 'mx-auto flex gap-2', children: navItems.map((item) => _jsx("button", { className: 'nav-btn', onClick: () => navigate(item.path, item.section), children: item.label }, item.path)) }), _jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/driver'), children: "Driver" }), _jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/admin'), children: "Admin" })] }), _jsxs("div", { className: 'flex items-center justify-between md:hidden', children: [_jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-8', alt: 'LV Transport' }), _jsx("button", { className: 'nav-btn', onClick: () => setMenuOpen((v) => !v), children: "\u2630" })] }), menuOpen && _jsxs("div", { className: 'mobile-menu mt-3 md:hidden', children: [navItems.map((item) => _jsx("button", { className: 'mobile-link', onClick: () => navigate(item.path, item.section), children: item.label }, item.path)), _jsxs("div", { className: 'mt-2 grid grid-cols-2 gap-2', children: [_jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/driver'), children: "Driver" }), _jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/admin'), children: "Admin" })] })] })] }), _jsxs("section", { id: 'hero', className: 'glass-panel mt-4 rounded-3xl p-6 sm:p-10', children: [_jsx("p", { className: 'text-sm uppercase tracking-[0.2em] text-lv-champagne', children: "Antwerpen, Belgi\u00EB \u2022 24/7 service" }), _jsx("h1", { className: 'mt-3 text-4xl font-semibold sm:text-6xl', children: "LV Transport" }), _jsx("h2", { className: 'mt-2 text-xl text-lv-mist sm:text-3xl', children: "Premium Taxi & Airport Service Antwerpen" }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "Luchthavenvervoer, priv\u00E9ritten en business/VIP verplaatsingen met professionele chauffeurs in Antwerpen en heel Belgi\u00EB." }), _jsxs("div", { className: 'mt-6 flex flex-wrap gap-3', children: [_jsx(Button, { onClick: () => navigate('/booking', 'booking'), children: "Reserveer nu" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/prijzen', 'prijzen'), children: "Bereken prijs" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/tracking', 'tracking'), children: "Volg uw taxi" })] })] }), _jsxs("section", { id: 'booking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Boekingsaanvraag" }), _jsxs("form", { className: 'mt-4 grid gap-3 sm:grid-cols-2', onSubmit: onSubmitBooking, children: [['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) => _jsxs("label", { className: `field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: key }), _jsx("input", { required: key !== 'notes', value: form[key], onChange: (e) => setForm({ ...form, [key]: e.target.value }) })] }, key)), _jsxs("div", { className: 'sm:col-span-2 flex flex-wrap gap-3', children: [_jsx(Button, { type: 'submit', children: "Reserveer nu" }), rideCode && _jsxs("p", { className: 'self-center rounded-xl border border-lv-gold/40 bg-black/40 px-3 py-2 text-sm', children: ["Ritcode: ", _jsx("b", { children: rideCode })] })] })] }), confirm && _jsx("p", { className: 'mt-3 rounded-xl border border-lv-gold/35 bg-black/35 p-3 text-sm text-lv-mist', children: confirm }), _jsx("a", { className: 'mt-3 inline-block nav-btn', href: `https://wa.me/32466487936?text=${whatsappText}`, target: '_blank', rel: 'noreferrer', children: "Boek via WhatsApp" })] }), _jsxs("section", { id: 'prijzen', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Prijs berekenen" }), _jsxs("div", { className: 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Afstand (km)" }), _jsx("input", { type: 'number', min: 1, max: 250, value: calc.km, onChange: (e) => setCalc({ ...calc, km: Number(e.target.value || 1) }) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Nacht" }), _jsx("input", { type: 'checkbox', checked: calc.isNight, onChange: (e) => setCalc({ ...calc, isNight: e.target.checked }) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Luchthaven" }), _jsx("input", { type: 'checkbox', checked: calc.airport, onChange: (e) => setCalc({ ...calc, airport: e.target.checked }) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Business" }), _jsx("input", { type: 'checkbox', checked: calc.business, onChange: (e) => setCalc({ ...calc, business: e.target.checked }) })] })] }), _jsxs("p", { className: 'mt-4 text-lg', children: ["Geschatte prijs: ", _jsxs("b", { className: 'text-lv-champagne', children: ["\u20AC", price] }), " (minimumtarief \u20AC28)"] }), _jsx("p", { className: 'text-sm text-lv-mist', children: "Indicatieve berekening. Definitieve prijs wordt bevestigd door LV Transport." })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Volg uw taxi" }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx("input", { className: 'estimate-input', placeholder: 'LV12345', value: trackingInput, onChange: (e) => setTrackingInput(e.target.value.toUpperCase()) }), _jsx(Button, { variant: 'secondary', onClick: () => setTrackingResult(trackingInput ? `Rit ${trackingInput}: bevestiging in verwerking.` : 'Voer een ritcode in.'), children: "Controleer" })] }), _jsx("p", { className: 'mt-3 rounded-xl border border-lv-gold/30 bg-black/35 p-3 text-sm text-lv-mist', children: trackingResult }), _jsx("p", { className: 'mt-2 text-xs text-lv-mist', children: "Tracking wordt gekoppeld aan uw ritcode zodra de rit bevestigd is." })] }), _jsx("section", { id: 'diensten', className: 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5', children: ['Airport transfer', 'Private rides', 'Business/VIP', 'Long-distance rides', '24/7 planned rides'].map((service) => _jsx("article", { className: 'glass-panel service-card rounded-2xl p-4', children: _jsx("h4", { className: 'font-semibold', children: service }) }, service)) }), _jsxs("section", { id: 'vip', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Business & LV VIP" }), _jsx("p", { className: 'mt-3 text-lv-mist', children: "Voor zakelijke klanten: vaste routes, maandelijkse facturen, VIP frequent client ondersteuning en prioriteitsservice voor kritieke verplaatsingen." })] }), _jsxs("section", { id: 'moni', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Moni Ride assistant" }), _jsx("p", { className: 'mt-2 text-lv-mist', children: "Moni helpt u snel met boeken, prijsberekening, tracking, luchthavenritten en VIP/business vragen." })] }), _jsx("footer", { id: 'contact', className: 'glass-panel my-4 rounded-3xl p-6 text-sm', children: _jsx("p", { children: "info@lvtransport.be \u2022 lvtransport.be \u2022 Antwerpen, Belgi\u00EB" }) }), _jsx(MoniAssistant, {})] }), (route === 'driver' || route === 'admin') && _jsx("div", { className: 'fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm', children: route === 'driver' ? _jsx("a", { href: DRIVER_SURFACE_URL, children: "Open Driver omgeving" }) : _jsx("a", { href: ADMIN_SURFACE_URL, children: "Open Admin omgeving" }) })] });
}

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
    { label: 'Reserveer nu', path: '/booking', section: 'booking', intent: 'booking' },
    { label: 'Prijs berekenen', path: '/prijzen', section: 'prijzen' },
    { label: 'Volg uw rit', path: '/tracking', section: 'tracking', intent: 'tracking' },
    { label: 'Diensten', path: '/diensten', section: 'diensten' },
    { label: 'LV VIP', path: '/vip', section: 'vip', intent: 'vip' },
    { label: 'Contact', path: '/contact', section: 'contact' }
];
const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
const interactionCopy = {
    booking: 'Reserveer premium ritten en operational lifecycle updates.',
    tracking: 'Bekijk realtime lifecycle, dispatch updates en ride intelligence.',
    vip: 'Activeer VIP/business privileges binnen het private LV-ecosysteem.',
    business: 'Open uw business dashboard en account governance.',
    driver: 'Toegang tot operator tools en driver lifecycle flows.',
    admin: 'Founder-grade operational oversight en dispatch orchestration.',
    reviews: 'Plaats enkel Verified Ride Reviews na completed rides.',
    expansion: 'Start verified partner/operator onboarding voor LV Business Expansion.'
};
const customerMapStates = [
    { key: 'searching', label: 'Searching', tone: 'bg-sky-400/20 text-sky-100 border-sky-300/40' },
    { key: 'booking_pending', label: 'Booking pending', tone: 'bg-amber-400/20 text-amber-100 border-amber-300/40' },
    { key: BookingLifecycle.ASSIGNED, label: 'Driver assigned', tone: 'bg-violet-400/20 text-violet-100 border-violet-300/40' },
    { key: BookingLifecycle.EN_ROUTE, label: 'Driver approaching', tone: 'bg-indigo-400/20 text-indigo-100 border-indigo-300/40' },
    { key: BookingLifecycle.ARRIVED, label: 'Arrived', tone: 'bg-cyan-400/20 text-cyan-100 border-cyan-300/40' },
    { key: BookingLifecycle.IN_PROGRESS, label: 'In ride', tone: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/40' },
    { key: BookingLifecycle.COMPLETED, label: 'Completed', tone: 'bg-lv-gold/25 text-lv-champagne border-lv-gold/40' }
];
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
    const [authMode, setAuthMode] = useState('signin');
    const [authOpen, setAuthOpen] = useState(false);
    const [authIntent, setAuthIntent] = useState('booking');
    const [identity, setIdentity] = useState(() => JSON.parse(localStorage.getItem('lvtp_verified_identity') ?? 'null'));
    const [authForm, setAuthForm] = useState({ name: '', email: '', phone: '', password: '', company: '', roleIntent: 'Customer' });
    const [authStatus, setAuthStatus] = useState('');
    const [authLoading, setAuthLoading] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', serviceType: 'Airport transfer', notes: '' });
    const [confirm, setConfirm] = useState('');
    const [bookingSubmitting, setBookingSubmitting] = useState(false);
    const [trackingInput, setTrackingInput] = useState('');
    const [trackingResult, setTrackingResult] = useState('Voer uw ritcode in om realtime lifecycle-status te controleren.');
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [customerMapPhase, setCustomerMapPhase] = useState('searching');
    const [driverProgress, setDriverProgress] = useState(10);
    const [verifiedReviews, setVerifiedReviews] = useState([]);
    const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
    const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);
    useEffect(() => {
        const onPopState = () => setRoute(routeMap[window.location.pathname] ?? 'home');
        window.addEventListener('popstate', onPopState);
        return () => window.removeEventListener('popstate', onPopState);
    }, []);
    const startIntent = (intent) => {
        setAuthIntent(intent);
        setAuthOpen(true);
        setAuthStatus('');
    };
    const requireIdentity = (intent, action) => identity ? action() : startIntent(intent);
    const navigate = (path, section) => {
        window.history.pushState({}, '', path);
        setRoute(routeMap[path] ?? 'home');
        setMenuOpen(false);
        if (section)
            setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
    };
    const activateIdentity = (method) => {
        if (authLoading)
            return;
        if (!authForm.email.trim() || !authForm.phone.trim()) {
            setAuthStatus('Email en telefoon zijn verplicht voor verified operational toegang.');
            return;
        }
        setAuthLoading(true);
        const nextIdentity = {
            name: authForm.name || 'LV Member',
            email: authForm.email,
            phone: authForm.phone,
            company: authForm.company || undefined,
            roleIntent: authForm.roleIntent || 'Customer',
            method,
            verifiedAt: new Date().toISOString()
        };
        localStorage.setItem('lvtp_verified_identity', JSON.stringify(nextIdentity));
        setIdentity(nextIdentity);
        setAuthStatus('Verified identity geactiveerd. Welkom in het private LV-ecosysteem.');
        setTimeout(() => {
            setAuthOpen(false);
            setAuthLoading(false);
        }, 500);
    };
    const onSubmitBooking = async (event) => {
        event.preventDefault();
        if (bookingSubmitting)
            return;
        if (!identity)
            return startIntent('booking');
        setBookingSubmitting(true);
        setConfirm('Boeking wordt veilig verwerkt...');
        const code = createRideCode();
        const payload = { ...form, name: identity.name, phone: identity.phone || form.phone, code, createdAt: new Date().toISOString(), status: 'submitted' };
        const dedupeKey = `web-booking-${payload.phone}-${payload.date}-${payload.time}-${payload.pickup}`;
        const existing = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]');
        if (sessionStorage.getItem(dedupeKey)) {
            setConfirm('Dubbele verzending geblokkeerd. Uw eerdere boeking werd al verwerkt.');
            setBookingSubmitting(false);
            return;
        }
        localStorage.setItem('lvtransport_bookings', JSON.stringify([payload, ...existing].slice(0, 50)));
        sessionStorage.setItem(dedupeKey, payload.code);
        let message = `Bedankt ${identity.name || 'klant'}, uw verified rit ${code} is ingediend.`;
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
        setConfirmedReviewSeed(payload.code);
        setConfirm(message);
        setBookingSubmitting(false);
    };
    const setConfirmedReviewSeed = (rideCode) => {
        setVerifiedReviews((existing) => Array.from(new Set([`Verified Ride Review unlocked for ${rideCode}`, ...existing])).slice(0, 5));
    };
    const checkTracking = () => {
        if (trackingLoading)
            return;
        if (!identity)
            return startIntent('tracking');
        setTrackingLoading(true);
        const normalized = trackingInput.trim().toUpperCase();
        if (!/^LV\d{5}$/.test(normalized)) {
            setTrackingResult('Ongeldige code. Gebruik formaat LV12345.');
            setTrackingLoading(false);
            return;
        }
        const records = JSON.parse(localStorage.getItem('lvtransport_bookings') ?? '[]');
        const ride = records.find((record) => record.code === normalized);
        if (!ride) {
            setTrackingResult(`Rit ${normalized} niet gevonden. Controleer uw bevestigingsbericht.`);
            setTrackingLoading(false);
            return;
        }
        const lifecycle = normalizeLifecycle(ride.status);
        if (!lifecycle) {
            setTrackingResult(`Rit ${ride.code}: status onbekend, neem contact op met dispatch.`);
            setTrackingLoading(false);
            return;
        }
        const immutable = isImmutableLifecycleStatus(lifecycle);
        setTrackingResult(`Rit ${ride.code}: status ${lifecycle.toUpperCase()} • ${immutable ? 'immutable' : 'actief'} lifecycle.`);
        setTrackingLoading(false);
    };
    useEffect(() => {
        const timer = setInterval(() => setDriverProgress((p) => (p >= 92 ? 12 : p + 4)), 1800);
        return () => clearInterval(timer);
    }, []);
    const mapPhase = customerMapStates.find((state) => state.key === customerMapPhase) ?? customerMapStates[0];
    return _jsx("div", { className: 'premium-shell min-h-screen text-white', children: _jsxs("div", { className: 'mx-auto max-w-6xl px-4 py-4 sm:px-6', children: [_jsxs("header", { className: 'glass-panel sticky top-3 z-40 rounded-3xl p-3 sm:p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("button", { onClick: () => navigate('/', 'hero'), children: _jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-9', alt: 'LV Transport logo' }) }), _jsx("button", { className: 'hamburger md:hidden', onClick: () => setMenuOpen((value) => !value), children: menuOpen ? 'Sluit' : 'Menu' }), _jsxs("nav", { className: 'ml-auto hidden items-center gap-2 md:flex', children: [navItems.map((item) => _jsx("button", { className: 'nav-btn', onClick: () => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section), children: item.label }, item.path)), _jsx("button", { className: 'surface-btn', onClick: () => requireIdentity('driver', () => navigate('/driver')), children: "Driver portal" }), _jsx("button", { className: 'surface-btn', onClick: () => requireIdentity('admin', () => navigate('/admin')), children: "Admin portal" })] })] }), _jsxs("div", { className: `mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`, children: [navItems.map((item) => _jsx("button", { className: 'mobile-nav-btn', onClick: () => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section), children: item.label }, item.path)), _jsx("button", { className: 'mobile-nav-btn', onClick: () => requireIdentity('driver', () => navigate('/driver')), children: "Driver portal" }), _jsx("button", { className: 'mobile-nav-btn', onClick: () => requireIdentity('admin', () => navigate('/admin')), children: "Admin portal" })] })] }), _jsxs("section", { id: 'hero', className: 'glass-panel hero-panel mt-4 rounded-3xl p-6 sm:p-10', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.25em] text-lv-champagne', children: "LV Transport Platform" }), _jsx("h1", { className: 'mt-3 text-4xl font-semibold sm:text-6xl', children: "Verified Premium Mobility Ecosystem" }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "Public exploration is open. Operational actions run through verified identity, trusted lifecycle orchestration and premium onboarding." }), _jsxs("div", { className: 'mt-6 flex flex-wrap gap-2', children: [_jsx("button", { className: 'nav-btn', onClick: () => requireIdentity('booking', () => navigate('/booking', 'booking')), children: "Reserveer nu" }), _jsx("button", { className: 'nav-btn', onClick: () => requireIdentity('tracking', () => navigate('/tracking', 'tracking')), children: "Volg uw rit" })] })] }), _jsxs("section", { id: 'tracking-map', className: 'glass-panel mt-4 overflow-hidden rounded-3xl', children: [_jsxs("div", { className: 'map-surface', children: [_jsx("div", { className: 'map-grid-overlay' }), _jsx("div", { className: 'map-route' }), _jsx("div", { className: 'map-pin map-pin--pickup', children: "Pickup" }), _jsx("div", { className: 'map-pin map-pin--drop', children: "Destination" }), _jsx("div", { className: 'map-driver', style: { left: `${driverProgress}%`, top: `${58 - driverProgress * 0.22}%` } }), _jsxs("div", { className: 'map-overlay-top', children: [_jsx("p", { children: "Realtime mobility intelligence" }), _jsx("span", { className: `map-state-pill ${mapPhase.tone}`, children: mapPhase.label })] }), _jsx("div", { className: 'map-overlay-bottom', children: _jsx("p", { children: "ETA 6 min \u00B7 Airport corridor focus \u00B7 Lifecycle synchronized" }) })] }), _jsx("div", { className: 'flex flex-wrap gap-2 p-3', children: customerMapStates.map((state) => _jsx("button", { className: 'nav-btn text-xs', onClick: () => setCustomerMapPhase(state.key), children: state.label }, String(state.key))) })] }), _jsxs("section", { id: 'prijzen', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Prijs berekenen" }), _jsxs("div", { className: 'mt-4 grid gap-3 md:grid-cols-2', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Afstand (km)" }), _jsx("input", { type: 'number', min: 1, value: calc.km, onChange: (event) => setCalc({ ...calc, km: Number(event.target.value) || 0 }) })] }), _jsxs("div", { className: 'flex flex-col gap-2 rounded-2xl border border-lv-gold/25 bg-black/30 p-4 text-sm', children: [_jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.airport, onChange: (event) => setCalc({ ...calc, airport: event.target.checked }) }), " Airport toeslag"] }), _jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.business, onChange: (event) => setCalc({ ...calc, business: event.target.checked }) }), " Business service"] }), _jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.isNight, onChange: (event) => setCalc({ ...calc, isNight: event.target.checked }) }), " Nachtregeling"] })] })] }), _jsxs("p", { className: 'mt-4 text-lg', children: ["Geschatte prijs: ", _jsxs("b", { className: 'text-lv-champagne', children: ["\u20AC", price] })] })] }), _jsx("section", { id: 'diensten', className: 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: ['Airport transfers', 'Private rides', 'Business & VIP', '24/7 dispatch opvolging'].map((service) => _jsx("article", { className: 'glass-panel service-card rounded-2xl p-4', children: service }, service)) }), _jsx("section", { id: 'vip', className: 'glass-panel mt-4 rounded-3xl p-6 text-lv-mist', children: "Prioriteitsservice, facturatie, vaste accountmanager en gecentraliseerde operationele opvolging voor bedrijven en frequente reizigers." }), _jsxs("section", { id: 'booking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Premium Operational Booking" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Alle betekenisvolle acties verlopen via verified identity." }), _jsxs("form", { className: 'mt-4 grid gap-3 sm:grid-cols-2', onSubmit: onSubmitBooking, children: [" ", ['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) => _jsxs("label", { className: `field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: key }), _jsx("input", { required: key !== 'notes', value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) })] }, key)), _jsx("div", { className: 'sm:col-span-2', children: _jsx(Button, { type: 'submit', disabled: bookingSubmitting, children: bookingSubmitting ? 'Verwerken...' : 'Reserveer nu' }) })] }), confirm && _jsx("p", { className: 'mt-3 status-line status-line--active', children: confirm })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Verified Tracking" }), _jsxs("div", { className: 'mt-3 flex flex-col gap-2 sm:flex-row', children: [_jsx("input", { className: 'estimate-input', placeholder: 'LV12345', value: trackingInput, onChange: (event) => setTrackingInput(event.target.value) }), _jsx(Button, { variant: 'secondary', onClick: checkTracking, disabled: trackingLoading, children: trackingLoading ? 'Controleren...' : 'Controleer status' })] }), _jsx("p", { className: 'mt-3 status-line', children: trackingResult })] }), _jsxs("section", { className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "Verified Ride Reviews" }), _jsx("p", { className: 'text-sm text-lv-mist', children: "Alle reviews zijn gekoppeld aan completed rides en verified identities." }), _jsx("ul", { className: 'mt-3 space-y-2', children: verifiedReviews.length ? verifiedReviews.map((review) => _jsx("li", { className: 'status-line status-line--active', children: review }, review)) : _jsx("li", { className: 'status-line', children: "Nog geen eligible verified reviews." }) }), _jsx(Button, { variant: 'secondary', className: 'mt-3', onClick: () => requireIdentity('reviews', () => setTrackingResult('Verified review flow geactiveerd na completed ride lifecycle.')), children: "Open review flow" })] }), _jsxs("section", { className: 'glass-panel mt-4 rounded-3xl p-6', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "LV Business Expansion" }), _jsx("p", { className: 'text-lv-mist text-sm', children: "LVTP levert dispatch, realtime infrastructuur en premium klantacquisitie. Operators brengen voertuigen en lokale uitvoering." }), _jsx(Button, { className: 'mt-3', onClick: () => requireIdentity('expansion', () => setTrackingResult('Expansion onboarding geopend voor verified operator intake.')), children: "Start Expansion Onboarding" })] }), _jsx("footer", { id: 'contact', className: 'glass-panel my-4 rounded-3xl p-6 text-sm', children: "info@lvtransport.be \u2022 +32 466 48 79 36 \u2022 Antwerpen \u2022 Belgi\u00EB" }), _jsx(MoniAssistant, {}), authOpen && _jsx("div", { className: 'auth-overlay', children: _jsxs("div", { className: 'auth-card glass-panel', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Premium Operational Onboarding" }), _jsx("h3", { className: 'mt-2 text-2xl font-semibold', children: "Aanmelden / Registreren" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: interactionCopy[authIntent] }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx("button", { className: 'surface-btn', onClick: () => setAuthMode('signin'), children: "Aanmelden" }), _jsx("button", { className: 'surface-btn', onClick: () => setAuthMode('register'), children: "Registreren" }), _jsx("button", { className: 'surface-btn', disabled: authLoading, onClick: () => activateIdentity('google'), children: authLoading ? 'Verifiëren...' : 'Google Sign-In' })] }), _jsxs("div", { className: 'mt-3 grid gap-2', children: [['name', 'email', 'phone', 'password', 'company'].map((key) => _jsx("input", { className: 'estimate-input', type: key === 'password' ? 'password' : 'text', placeholder: key, value: authForm[key], onChange: (e) => setAuthForm({ ...authForm, [key]: e.target.value }) }, key)), _jsx("input", { className: 'estimate-input', placeholder: 'Operational role intent', value: authForm.roleIntent, onChange: (e) => setAuthForm({ ...authForm, roleIntent: e.target.value }) })] }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx(Button, { disabled: authLoading, onClick: () => activateIdentity('email'), children: authLoading ? 'Verifiëren...' : authMode === 'signin' ? 'Verifieer en ga verder' : 'Account creëren' }), _jsx("button", { className: 'surface-btn', onClick: () => setAuthOpen(false), children: "Sluiten" })] }), authStatus && _jsx("p", { className: 'status-line status-line--active mt-3', children: authStatus })] }) }), identity && _jsxs("div", { className: 'identity-chip glass-panel', children: ["Verified: ", identity.name, " \u2022 ", identity.roleIntent, " ", _jsx("button", { onClick: () => { localStorage.removeItem('lvtp_verified_identity'); setIdentity(null); }, children: "Afmelden" })] }), (route === 'driver' || route === 'admin') && _jsx("div", { className: 'fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm', children: route === 'driver' ? _jsx("a", { href: DRIVER_SURFACE_URL, children: "Open Driver omgeving" }) : _jsx("a", { href: ADMIN_SURFACE_URL, children: "Open Admin omgeving" }) })] }) });
}

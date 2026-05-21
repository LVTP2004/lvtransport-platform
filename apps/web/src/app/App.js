import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { getInstallPromptState } from '../pwa';
import { Button } from '@lvtransport/ui';
import { BookingLifecycle, isImmutableLifecycleStatus } from '@lvtransport/realtime';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const readOperationalArtifacts = () => {
    const fromWindow = window.__LV_OPERATIONAL_MEMORY__;
    const fromScript = document.getElementById('lv-operational-memory')?.textContent;
    const fromStorage = localStorage.getItem('lv_operational_memory_artifacts');
    const candidates = [fromWindow, fromScript, fromStorage];
    for (const candidate of candidates) {
        if (!candidate)
            continue;
        try {
            const parsed = typeof candidate === 'string' ? JSON.parse(candidate) : candidate;
            const list = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.artifacts) ? parsed.artifacts : null;
            if (!list)
                continue;
            return list
                .map((item, index) => ({ ...item, id: String(item.id ?? `artifact-${index}`) }))
                .filter((item) => typeof item.id === 'string');
        }
        catch {
            continue;
        }
    }
    return [];
};
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? '/driver';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? '/admin';
const routeMap = {
    '/': 'home', '/booking': 'booking', '/prijzen': 'prijzen', '/tracking': 'tracking', '/investigation': 'investigation', '/diensten': 'diensten', '/vip': 'vip', '/contact': 'contact', '/driver': 'driver', '/admin': 'admin'
};
const primaryNavItems = [
    { label: 'Home', path: '/', section: 'hero' },
    { label: 'Booking', path: '/booking', section: 'booking', intent: 'booking' },
    { label: 'Tracking', path: '/tracking', section: 'tracking', intent: 'tracking' },
    { label: 'Investigation', path: '/investigation', section: 'investigation', intent: 'investigation' },
    { label: 'Diensten', path: '/diensten', section: 'diensten' },
    { label: 'Contact', path: '/contact', section: 'contact' }
];
const secondaryItems = [{ label: 'Maps', section: 'tracking-map' }, { label: 'Driver', path: '/driver' }, { label: 'Admin', path: '/admin' }];
const utilityNavItems = [
    { label: 'Driver', path: '/driver', intent: 'driver' },
    { label: 'Admin', path: '/admin', intent: 'admin' },
    { label: 'Maps', path: '/tracking-map', section: 'tracking-map' },
    { label: 'Moni Ride', path: '/vip', section: 'vip', intent: 'vip' }
];
const createRideCode = () => `LV${Math.floor(10000 + Math.random() * 90000)}`;
const trustSignals = ['Verified Driver', 'Realtime Connected', 'Airport Synchronized', 'Secure Payment', 'LV Certified', 'Premium Operator'];
const interactionCopy = {
    booking: 'Reserveer premium ritten en operational lifecycle updates.',
    tracking: 'Bekijk realtime lifecycle, dispatch updates en ride intelligence.',
    investigation: 'Inspecteer operationele continuiteit met read-only evidence en lineage.',
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
    const [booting, setBooting] = useState(true);
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
    const [syncPhase, setSyncPhase] = useState(0);
    const [verifiedReviews, setVerifiedReviews] = useState([]);
    const [installReady, setInstallReady] = useState(false);
    const [calc, setCalc] = useState({ km: 22, isNight: false, airport: true, business: false });
    const price = useMemo(() => Math.round(28 + calc.km * (calc.isNight ? 2.8 : 2.3) + (calc.airport ? 12 : 0) + (calc.business ? 8 : 0)), [calc]);
    const [operationalArtifacts, setOperationalArtifacts] = useState([]);
    const [investigationFilters, setInvestigationFilters] = useState({ entityType: '', entityId: '', correlationId: '', requestId: '', category: '', sourceFile: '', from: '', to: '' });
    useEffect(() => {
        setOperationalArtifacts(readOperationalArtifacts());
    }, []);
    useEffect(() => {
        const installState = getInstallPromptState();
        setInstallReady(installState.available);
        const onReady = () => setInstallReady(true);
        const onInstalled = () => setInstallReady(false);
        window.addEventListener('lv:pwa-install-available', onReady);
        window.addEventListener('lv:pwa-installed', onInstalled);
        return () => {
            window.removeEventListener('lv:pwa-install-available', onReady);
            window.removeEventListener('lv:pwa-installed', onInstalled);
        };
    }, []);
    const installEcosystemApp = async () => {
        const accepted = await getInstallPromptState().promptInstall();
        if (!accepted)
            return;
        setInstallReady(false);
        setConfirm('LV app installed. U geniet nu van een native premium experience.');
    };
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
        if (!API_BASE_URL) {
            setConfirm('Boeking kan niet verzonden worden: API endpoint ontbreekt. Contacteer dispatch.');
            setBookingSubmitting(false);
            return;
        }
        const code = createRideCode();
        const payload = { ...form, name: identity.name, phone: identity.phone || form.phone, code, createdAt: new Date().toISOString(), status: 'submitted' };
        const dedupeKey = `web-booking-${payload.phone}-${payload.date}-${payload.time}-${payload.pickup}`;
        if (sessionStorage.getItem(dedupeKey)) {
            setConfirm('Dubbele verzending geblokkeerd. Uw eerdere boeking werd al verwerkt.');
            setBookingSubmitting(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if (!response.ok) {
                setConfirm('Boeking niet opgeslagen in dispatch. Probeer opnieuw of contacteer support.');
                setBookingSubmitting(false);
                return;
            }
            const result = await response.json();
            const referenceCode = result.referenceCode ?? payload.code;
            sessionStorage.setItem(dedupeKey, referenceCode);
            setConfirmedReviewSeed(referenceCode);
            setConfirm(`Bedankt ${identity.name || 'klant'}, uw rit ${referenceCode} is bevestigd in dispatch.`);
        }
        catch {
            setConfirm('Boeking niet verzonden door netwerkfout. Geen lokale fallback gebruikt. Probeer opnieuw.');
        }
        setBookingSubmitting(false);
    };
    const setConfirmedReviewSeed = (rideCode) => {
        setVerifiedReviews((existing) => Array.from(new Set([`Verified Ride Review unlocked for ${rideCode}`, ...existing])).slice(0, 5));
    };
    const checkTracking = async () => {
        if (trackingLoading)
            return;
        if (!identity)
            return startIntent('tracking');
        setTrackingLoading(true);
        const normalized = trackingInput.trim().toUpperCase();
        if (!normalized) {
            setTrackingResult('Voer een trackingcode in uit uw bevestiging.');
            setTrackingLoading(false);
            return;
        }
        if (!API_BASE_URL) {
            setTrackingResult('Tracking niet beschikbaar: API endpoint ontbreekt. Contacteer dispatch.');
            setTrackingLoading(false);
            return;
        }
        try {
            const response = await fetch(`${API_BASE_URL}/tracking/booking/${normalized}`);
            if (!response.ok) {
                setTrackingResult(`Rit ${normalized} niet gevonden in operationele database.`);
                setTrackingLoading(false);
                return;
            }
            const payload = await response.json();
            const ride = payload.data;
            if (!ride?.code || !ride?.status) {
                setTrackingResult(`Rit ${normalized}: onvolledige trackingdata, contacteer dispatch.`);
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
        }
        catch {
            setTrackingResult('Tracking tijdelijk niet bereikbaar door netwerkfout. Probeer opnieuw.');
        }
        setTrackingLoading(false);
    };
    useEffect(() => {
        const timer = setInterval(() => setDriverProgress((p) => (p >= 92 ? 12 : p + 4)), 1800);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const timer = setInterval(() => setSyncPhase((value) => (value + 1) % 4), 2400);
        return () => clearInterval(timer);
    }, []);
    useEffect(() => {
        const timer = setTimeout(() => setBooting(false), 2000);
        return () => clearTimeout(timer);
    }, []);
    const filteredArtifacts = useMemo(() => operationalArtifacts.filter((item) => {
        const timestamp = item.timestamp ? new Date(item.timestamp).getTime() : null;
        const from = investigationFilters.from ? new Date(investigationFilters.from).getTime() : null;
        const to = investigationFilters.to ? new Date(investigationFilters.to).getTime() : null;
        return (!investigationFilters.entityType || item.entityType === investigationFilters.entityType)
            && (!investigationFilters.entityId || item.entityId === investigationFilters.entityId)
            && (!investigationFilters.correlationId || item.correlationId === investigationFilters.correlationId)
            && (!investigationFilters.requestId || item.requestId === investigationFilters.requestId)
            && (!investigationFilters.category || item.category === investigationFilters.category)
            && (!investigationFilters.sourceFile || item.sourceFile === investigationFilters.sourceFile)
            && (!from || (timestamp !== null && timestamp >= from))
            && (!to || (timestamp !== null && timestamp <= to));
    }), [operationalArtifacts, investigationFilters]);
    const replayArtifacts = filteredArtifacts.filter((item) => item.replayReference);
    const transitionArtifacts = filteredArtifacts.filter((item) => item.transitionReference);
    const mapPhase = customerMapStates.find((state) => state.key === customerMapPhase) ?? customerMapStates[0];
    const playUiSound = (tone = 'click') => {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx)
            return;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = tone === 'success' ? 620 : 460;
        gain.gain.value = 0.0001;
        osc.connect(gain);
        gain.connect(ctx.destination);
        const now = ctx.currentTime;
        gain.gain.exponentialRampToValueAtTime(0.025, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + (tone === 'success' ? 0.18 : 0.08));
        osc.start(now);
        osc.stop(now + (tone === 'success' ? 0.2 : 0.1));
    };
    return _jsxs("div", { className: 'premium-shell min-h-screen text-white', children: [booting && _jsxs("div", { className: 'boot-splash', "aria-label": 'LVTP startup experience', children: [_jsx("div", { className: 'boot-splash__glow' }), _jsx("img", { src: '/brand/lv-logo-dark.svg', alt: 'LV ecosystem symbol', className: 'boot-splash__logo' }), _jsx("p", { className: 'boot-splash__caption', children: "Premium realtime mobility ecosystem" }), _jsxs("p", { className: 'boot-splash__status', children: ["Operational systems synchronizing ", '.'.repeat(syncPhase + 1)] })] }), _jsxs("div", { className: 'mx-auto max-w-6xl space-y-5 px-4 py-4 sm:px-6 sm:py-6', children: [_jsxs("header", { className: 'glass-panel sticky top-3 z-40 rounded-3xl p-3 sm:p-4', children: [_jsxs("div", { className: 'flex items-center gap-2', children: [_jsx("button", { onClick: () => navigate('/', 'hero'), children: _jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-9', alt: 'LV Transport logo' }) }), _jsx("button", { className: 'hamburger md:hidden', onClick: () => setMenuOpen((value) => !value), children: menuOpen ? 'Sluit' : 'Menu' }), _jsxs("nav", { className: 'ml-auto hidden items-center gap-2 md:flex', children: [_jsx("div", { className: 'nav-group-primary', children: primaryNavItems.map((item) => _jsx("button", { className: 'nav-btn nav-btn--primary', onClick: () => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section), children: item.label }, item.path)) }), _jsxs("div", { className: 'nav-group-utility', children: [utilityNavItems.map((item) => _jsx("button", { className: 'nav-btn nav-btn--utility', onClick: () => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section), children: item.label }, item.label)), installReady && _jsx("button", { className: 'nav-btn nav-btn--utility', onClick: installEcosystemApp, children: "Install app" })] })] })] }), _jsx("div", { className: `mobile-menu-overlay ${menuOpen ? 'mobile-menu-overlay--open' : ''}`, onClick: () => setMenuOpen(false) }), _jsxs("div", { className: `mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`, children: [_jsx("p", { className: 'mobile-menu-title', children: "Primary" }), primaryNavItems.map((item) => _jsx("button", { className: 'mobile-nav-btn mobile-nav-btn--primary', onClick: () => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section), children: item.label }, item.path)), _jsx("p", { className: 'mobile-menu-title', children: "Tools" }), utilityNavItems.map((item) => _jsx("button", { className: 'mobile-nav-btn mobile-nav-btn--utility', onClick: () => item.intent ? requireIdentity(item.intent, () => navigate(item.path, item.section)) : navigate(item.path, item.section), children: item.label }, item.label)), installReady && _jsx("button", { className: 'mobile-nav-btn mobile-nav-btn--utility', onClick: installEcosystemApp, children: "Install app" })] })] }), _jsxs("section", { id: 'hero', className: 'glass-panel hero-panel rounded-3xl p-6 sm:p-10', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.25em] text-lv-champagne', children: "LV Transport Platform" }), _jsx("h1", { className: 'mt-3 text-4xl font-semibold sm:text-6xl', children: "Calm Luxury Mobility, Realtime Intelligence" }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "Een emotioneel premium, realtime en verified ecosysteem voor executive mobiliteit met concierge-grade coordinatie en operationele rust." }), _jsxs("div", { className: 'mt-6 flex flex-wrap gap-3', children: [_jsx("button", { className: 'nav-btn nav-btn--primary', onClick: () => requireIdentity('booking', () => navigate('/booking', 'booking')), children: "Reserveer nu" }), _jsx("button", { className: 'nav-btn nav-btn--secondary', onClick: () => requireIdentity('tracking', () => navigate('/tracking', 'tracking')), children: "Volg uw rit" })] })] }), _jsx("section", { className: 'glass-panel overflow-hidden rounded-3xl p-0', children: _jsx("img", { src: '/brand/lv-logo-presentation.svg', alt: 'Luxury mobility silhouette identity', className: 'h-auto w-full opacity-95' }) }), _jsxs("section", { className: 'glass-panel rounded-3xl p-4 sm:p-5', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Operational trust signals" }), _jsx("div", { className: 'mt-3 flex flex-wrap gap-2', children: trustSignals.map((signal) => _jsx("span", { className: 'trust-pill', children: signal }, signal)) })] }), _jsxs("section", { id: 'tracking-map', className: 'glass-panel overflow-hidden rounded-3xl', children: [_jsxs("div", { className: 'map-surface', children: [_jsx("div", { className: 'map-grid-overlay' }), _jsx("div", { className: 'map-route' }), _jsx("div", { className: 'map-pin map-pin--pickup', children: "Pickup" }), _jsx("div", { className: 'map-pin map-pin--drop', children: "Destination" }), _jsx("div", { className: 'map-driver', style: { left: `${driverProgress}%`, top: `${58 - driverProgress * 0.22}%` } }), _jsxs("div", { className: 'map-overlay-top', children: [_jsx("p", { children: "Realtime mobility intelligence" }), _jsx("span", { className: `map-state-pill ${mapPhase.tone}`, children: mapPhase.label })] }), _jsx("div", { className: 'map-overlay-bottom', children: _jsx("p", { children: "ETA 6 min \u00B7 Airport corridor synchronized \u00B7 Concierge lifecycle live" }) })] }), _jsx("div", { className: 'flex flex-wrap gap-2 p-3', children: customerMapStates.map((state) => _jsx("button", { className: 'nav-btn nav-btn--secondary text-xs', onClick: () => setCustomerMapPhase(state.key), children: state.label }, String(state.key))) })] }), _jsxs("section", { id: 'prijzen', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Prijs berekenen" }), _jsxs("div", { className: 'mt-4 grid gap-3 md:grid-cols-2', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Afstand (km)" }), _jsx("input", { type: 'number', min: 1, value: calc.km, onChange: (event) => setCalc({ ...calc, km: Number(event.target.value) || 0 }) })] }), _jsxs("div", { className: 'flex flex-col gap-2 rounded-2xl border border-lv-gold/25 bg-black/30 p-4 text-sm', children: [_jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.airport, onChange: (event) => setCalc({ ...calc, airport: event.target.checked }) }), " Airport toeslag"] }), _jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.business, onChange: (event) => setCalc({ ...calc, business: event.target.checked }) }), " Business service"] }), _jsxs("label", { children: [_jsx("input", { type: 'checkbox', checked: calc.isNight, onChange: (event) => setCalc({ ...calc, isNight: event.target.checked }) }), " Nachtregeling"] })] })] }), _jsxs("p", { className: 'mt-4 text-lg', children: ["Geschatte prijs: ", _jsxs("b", { className: 'text-lv-champagne', children: ["\u20AC", price] })] })] }), _jsx("section", { id: 'diensten', className: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: ['Airport transfers', 'Private rides', 'Business & VIP', '24/7 dispatch opvolging'].map((service) => _jsx("article", { className: 'glass-panel service-card rounded-2xl p-4', children: service }, service)) }), _jsx("section", { id: 'vip', className: 'glass-panel rounded-3xl p-6 text-lv-mist', children: "Prioriteitsservice, facturatie, vaste accountmanager en gecentraliseerde operationele opvolging voor bedrijven en frequente reizigers." }), _jsxs("section", { id: 'booking', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Concierge Booking Flow" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Alle betekenisvolle acties verlopen via verified identity." }), _jsxs("form", { className: 'mt-4 grid gap-3 sm:grid-cols-2', onSubmit: onSubmitBooking, children: [" ", ['name', 'phone', 'pickup', 'destination', 'date', 'time', 'serviceType', 'notes'].map((key) => _jsxs("label", { className: `field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: key }), _jsx("input", { required: key !== 'notes', value: form[key], onChange: (event) => setForm({ ...form, [key]: event.target.value }) })] }, key)), _jsx("div", { className: 'sm:col-span-2', children: _jsx(Button, { type: 'submit', disabled: bookingSubmitting, onClick: () => playUiSound('click'), children: bookingSubmitting ? 'Verwerken...' : 'Reserveer nu' }) })] }), confirm && _jsx("p", { className: 'mt-3 status-line status-line--active', children: confirm })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Operational Tracking Tower" }), _jsxs("div", { className: 'mt-3 flex flex-col gap-3 sm:flex-row', children: [_jsx("input", { className: 'estimate-input estimate-input--tracking', placeholder: 'LV12345', value: trackingInput, onChange: (event) => setTrackingInput(event.target.value) }), _jsx(Button, { className: 'tracking-cta', onClick: checkTracking, disabled: trackingLoading, children: trackingLoading ? 'Synchronisatie...' : 'Controleer status' })] }), _jsx("p", { className: 'mt-3 status-line', children: trackingResult })] }), _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "Verified Ride Reviews" }), _jsx("p", { className: 'text-sm text-lv-mist', children: "Alle reviews zijn gekoppeld aan completed rides en verified identities." }), _jsx("ul", { className: 'mt-3 space-y-2', children: verifiedReviews.length ? verifiedReviews.map((review) => _jsx("li", { className: 'status-line status-line--active', children: review }, review)) : _jsx("li", { className: 'status-line', children: "Nog geen eligible verified reviews." }) }), _jsx(Button, { variant: 'secondary', className: 'mt-3', onClick: () => requireIdentity('reviews', () => setTrackingResult('Verified review flow geactiveerd na completed ride lifecycle.')), children: "Open review flow" })] }), _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h3", { className: 'text-xl font-semibold', children: "LV Business Expansion" }), _jsx("p", { className: 'text-lv-mist text-sm', children: "U brengt operationele capaciteit. LVTP levert verified dispatch, realtime lifecycle controle en premium klanttoegang." }), _jsx(Button, { className: 'mt-3', onClick: () => requireIdentity('expansion', () => setTrackingResult('Expansion onboarding geopend voor verified operator intake.')), children: "Start Expansion Onboarding" })] }), _jsxs("section", { id: 'investigation', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h3", { className: 'text-2xl font-semibold', children: "Operational Investigation Workspace" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Read-only evidence workspace for entity, correlation, request, replay, incident, notification failure and source lineage inspection." }), _jsxs("div", { className: 'mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: [['entityType', 'entityId', 'correlationId', 'requestId', 'category', 'sourceFile'].map((key) => _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: key }), _jsx("input", { value: investigationFilters[key], onChange: (event) => setInvestigationFilters({ ...investigationFilters, [key]: event.target.value }) })] }, key)), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "timestamp from" }), _jsx("input", { type: 'datetime-local', value: investigationFilters.from, onChange: (event) => setInvestigationFilters({ ...investigationFilters, from: event.target.value }) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "timestamp to" }), _jsx("input", { type: 'datetime-local', value: investigationFilters.to, onChange: (event) => setInvestigationFilters({ ...investigationFilters, to: event.target.value }) })] })] }), !operationalArtifacts.length && _jsx("div", { className: 'mt-4 status-line', children: "Degraded state: no operational-memory artifacts detected. Timeline, lineage, replay and runbook references remain unavailable until evidence is provided." }), !!operationalArtifacts.length && _jsxs(_Fragment, { children: [_jsx("p", { className: 'mt-4 text-xs uppercase tracking-[0.16em] text-lv-champagne', children: "Evidence panels" }), _jsxs("div", { className: 'mt-2 grid gap-3 lg:grid-cols-2', children: [_jsxs("article", { className: 'investigation-panel', children: [_jsxs("h4", { children: ["Timeline (", filteredArtifacts.length, ")"] }), filteredArtifacts.slice(0, 20).map((item) => _jsxs("div", { className: 'status-line mt-2', children: [_jsxs("p", { children: [item.timestamp ?? 'Unknown timestamp', " \u00B7 ", item.category ?? 'uncategorized'] }), _jsxs("p", { className: 'text-xs text-lv-mist', children: ["source: ", item.sourceFile ?? 'n/a', " \u00B7 lineage: ", item.lineageReference ?? 'n/a', " \u00B7 correlation/request: ", item.correlationId ?? '-', " / ", item.requestId ?? '-'] }), _jsxs("p", { className: 'text-xs text-lv-mist', children: ["runbook: ", item.runbookReference ?? 'not matched', " \u00B7 replay/transition: ", item.replayReference ?? '-', " / ", item.transitionReference ?? '-'] })] }, item.id))] }), _jsxs("article", { className: 'investigation-panel', children: [_jsx("h4", { children: "Source lineage" }), _jsx("ul", { children: filteredArtifacts.map((item) => _jsxs("li", { className: 'status-line mt-2', children: [item.sourceCategory ?? 'unknown', " \u00B7 ", item.sourceFile ?? 'n/a', " \u00B7 ", item.lineageReference ?? 'n/a'] }, `${item.id}-lineage`)) })] }), _jsxs("article", { className: 'investigation-panel', children: [_jsx("h4", { children: "Replay history" }), _jsx("ul", { children: replayArtifacts.length ? replayArtifacts.map((item) => _jsxs("li", { className: 'status-line mt-2', children: [item.entityType ?? 'entity', " ", item.entityId ?? 'n/a', " \u00B7 ", item.replayReference] }, `${item.id}-replay`)) : _jsx("li", { className: 'status-line mt-2', children: "No replay references in filtered evidence." }) })] }), _jsxs("article", { className: 'investigation-panel', children: [_jsx("h4", { children: "Transition history" }), _jsx("ul", { children: transitionArtifacts.length ? transitionArtifacts.map((item) => _jsxs("li", { className: 'status-line mt-2', children: [item.transitionReference, " \u00B7 ", item.correlationId ?? 'no correlation id'] }, `${item.id}-transition`)) : _jsx("li", { className: 'status-line mt-2', children: "No transition references in filtered evidence." }) })] }), _jsxs("article", { className: 'investigation-panel', children: [_jsx("h4", { children: "Runbook references" }), _jsx("ul", { children: filteredArtifacts.map((item) => _jsx("li", { className: 'status-line mt-2', children: item.runbookReference ?? 'No deterministic runbook match' }, `${item.id}-runbook`)) })] }), _jsxs("article", { className: 'investigation-panel', children: [_jsx("h4", { children: "Missing data / degraded state" }), _jsxs("ul", { className: 'space-y-2 text-sm text-lv-mist', children: [_jsxs("li", { children: ["Incident records: ", filteredArtifacts.some((item) => item.incidentId) ? 'available' : 'not present in current artifacts'] }), _jsxs("li", { children: ["Notification failures: ", filteredArtifacts.some((item) => item.notificationFailureId) ? 'available' : 'not present in current artifacts'] }), _jsxs("li", { children: ["Correlation coverage: ", filteredArtifacts.filter((item) => item.correlationId).length, "/", filteredArtifacts.length] }), _jsxs("li", { children: ["Request coverage: ", filteredArtifacts.filter((item) => item.requestId).length, "/", filteredArtifacts.length] })] })] })] })] })] }), _jsx("footer", { id: 'contact', className: 'glass-panel rounded-3xl p-6 text-sm', children: "info@lvtransport.be \u2022 +32 466 48 79 36 \u2022 Antwerpen \u2022 Belgi\u00EB" }), _jsx(MoniAssistant, {}), authOpen && _jsx("div", { className: 'auth-overlay', children: _jsxs("div", { className: 'auth-card glass-panel', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Premium Operational Onboarding" }), _jsx("h3", { className: 'mt-2 text-2xl font-semibold', children: "Aanmelden / Registreren" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: interactionCopy[authIntent] }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx("button", { className: 'surface-btn', onClick: () => setAuthMode('signin'), children: "Aanmelden" }), _jsx("button", { className: 'surface-btn', onClick: () => setAuthMode('register'), children: "Registreren" }), _jsx("button", { className: 'surface-btn', disabled: authLoading, onClick: () => activateIdentity('google'), children: authLoading ? 'Verifiëren...' : 'Google Sign-In' })] }), _jsxs("div", { className: 'mt-3 grid gap-2', children: [['name', 'email', 'phone', 'password', 'company'].map((key) => _jsx("input", { className: 'estimate-input', type: key === 'password' ? 'password' : 'text', placeholder: key, value: authForm[key], onChange: (e) => setAuthForm({ ...authForm, [key]: e.target.value }) }, key)), _jsx("input", { className: 'estimate-input', placeholder: 'Operational role intent', value: authForm.roleIntent, onChange: (e) => setAuthForm({ ...authForm, roleIntent: e.target.value }) })] }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx(Button, { disabled: authLoading, onClick: () => activateIdentity('email'), children: authLoading ? 'Verifiëren...' : authMode === 'signin' ? 'Verifieer en ga verder' : 'Account creëren' }), _jsx("button", { className: 'surface-btn', onClick: () => setAuthOpen(false), children: "Sluiten" })] }), authStatus && _jsx("p", { className: 'status-line status-line--active mt-3', children: authStatus })] }) }), identity && _jsxs("div", { className: 'identity-chip glass-panel', children: ["Verified: ", identity.name, " \u2022 ", identity.roleIntent, " ", _jsx("button", { onClick: () => { localStorage.removeItem('lvtp_verified_identity'); setIdentity(null); }, children: "Afmelden" })] }), (route === 'driver' || route === 'admin') && _jsx("div", { className: 'fixed bottom-4 left-4 glass-panel rounded-2xl p-4 text-sm', children: route === 'driver' ? _jsx("a", { href: DRIVER_SURFACE_URL, children: "Open Driver omgeving" }) : _jsx("a", { href: ADMIN_SURFACE_URL, children: "Open Admin omgeving" }) })] })] });
}

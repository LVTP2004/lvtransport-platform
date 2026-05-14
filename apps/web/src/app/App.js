import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const TRACKING_BASE = import.meta.env.VITE_TRACKING_BASE_URL ?? '/tracking';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';
const MAPS_PROVIDER = import.meta.env.VITE_MAP_PROVIDER ?? 'fallback';
const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
const vehicles = [
    { name: 'Executive Sedan', eta: '3 min', seats: 3, serviceType: 'standard', description: 'Comfortabele stadsrit voor premium verplaatsingen.' },
    { name: 'Business SUV', eta: '5 min', seats: 6, serviceType: 'airport', description: 'Extra ruimte voor luchthavenritten en bagage.' },
    { name: 'VIP Sprinter', eta: '10 min', seats: 10, serviceType: 'vip', description: 'Discrete groepsservice voor business en VIP.' }
];
const statusLabel = (status) => ({ pending: 'Boeking ontvangen', assigned: 'Chauffeur toegewezen', en_route: 'Chauffeur onderweg', arrived: 'Chauffeur aangekomen', in_progress: 'Rit bezig', completed: 'Rit voltooid' }[status] ?? 'Boeking bevestigd');
const resolveRoute = (pathname) => {
    const p = pathname.toLowerCase();
    if (['/', '/home'].includes(p))
        return 'home';
    if (['/booking', '/booking.html'].includes(p))
        return 'booking';
    if (['/tracking', '/tracking.html'].includes(p))
        return 'tracking';
    if (p === '/prijzen')
        return 'prijzen';
    if (p === '/diensten')
        return 'diensten';
    if (p === '/contact')
        return 'contact';
    if (['/driver', '/driver.html'].includes(p))
        return 'driver';
    if (['/admin', '/admin.html', '/tower', '/dashboard'].includes(p))
        return 'admin';
    if (['/moni', '/moni-ride', '/moni.html'].includes(p))
        return 'moni';
    if (['/maps', '/map', '/app'].includes(p))
        return 'maps';
    return '404';
};
export function App() {
    const [route, setRoute] = useState(() => resolveRoute(window.location.pathname));
    const [step, setStep] = useState(1);
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [phone, setPhone] = useState('');
    const [passengers, setPassengers] = useState(1);
    const [vehicle, setVehicle] = useState(vehicles[0]);
    const [airportTransfer, setAirportTransfer] = useState(false);
    const [businessVip, setBusinessVip] = useState(false);
    const [confirmation, setConfirmation] = useState(null);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [apiHealth, setApiHealth] = useState('controle bezig');
    const inFlightKeyRef = useRef(null);
    const navigate = (path) => { history.pushState({}, '', path); setRoute(resolveRoute(path)); window.scrollTo({ top: 0 }); };
    useEffect(() => { const onPop = () => setRoute(resolveRoute(window.location.pathname)); window.addEventListener('popstate', onPop); return () => window.removeEventListener('popstate', onPop); }, []);
    useEffect(() => { fetch(`${API_BASE}/health`).then((r) => r.json()).then((d) => setApiHealth(d?.status ?? 'onbekend')).catch(() => setApiHealth('degraded')); }, []);
    useEffect(() => {
        const onOnline = () => { setIsOnline(true); setInfo('Uw ritstatus wordt bijgewerkt.'); setError(''); };
        const onOffline = () => { setIsOnline(false); setError('We herstellen de verbinding. Uw gegevens blijven veilig bewaard.'); };
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
    }, []);
    const serviceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
    const trackingUrl = confirmation ? `${TRACKING_BASE}/${confirmation.referenceCode}` : '/tracking';
    const intakeReady = pickup && destination && dateTime && phone;
    const estimatedFare = useMemo(() => Math.round(24 + passengers * 4 + (airportTransfer ? 16 : 0) + (businessVip ? 20 : 0)), [passengers, airportTransfer, businessVip]);
    const submitBooking = async () => {
        if (loading || !isOnline || !intakeReady)
            return;
        const dedupeKey = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}`;
        if (inFlightKeyRef.current === dedupeKey)
            return;
        inFlightKeyRef.current = dedupeKey;
        setError('');
        setInfo('Uw reservatie wordt bevestigd door LV Transport.');
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/bookings`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey }, body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType, customerPhone: phone }) });
            const payload = await response.json();
            if (!response.ok)
                throw new Error(payload?.message ?? 'Reservatie kon niet bevestigd worden.');
            setConfirmation({ id: payload.booking.id, referenceCode: payload.booking.referenceCode, status: payload.booking.status });
            setInfo('Boeking ontvangen. LV Transport volgt uw rit op en koppelt uw chauffeur.');
        }
        catch (e) {
            setError(e instanceof Error ? e.message : 'Reservatie kon niet bevestigd worden.');
        }
        finally {
            inFlightKeyRef.current = null;
            setLoading(false);
        }
    };
    const Header = _jsx("header", { className: 'glass-panel rounded-3xl p-5', children: _jsx("nav", { className: 'flex flex-wrap gap-2 text-sm', children: [['/', 'Book'], ['/prijzen', 'Prices'], ['/tracking', 'Track'], ['/moni', 'Moni Ride'], ['/app', 'Maps'], ['/diensten', 'Services'], ['/contact', 'Contact'], ['/driver', 'Driver'], ['/admin', 'Admin']].map(([p, l]) => _jsx("button", { onClick: () => navigate(p), className: 'rounded-lg border border-lv-gold/30 px-3 py-1.5', children: l }, p)) }) });
    if (route === '404')
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-3xl space-y-4', children: [Header, _jsxs("section", { className: 'glass-panel rounded-3xl p-8 text-center', children: [_jsx("img", { src: '/brand/lv-logo-header.svg', className: 'mx-auto h-12' }), _jsx("h1", { className: 'mt-4 text-3xl font-semibold', children: "Pagina niet gevonden" }), _jsx("p", { className: 'mt-2 text-lv-mist', children: "Deze pagina bestaat niet of is verplaatst." }), _jsxs("div", { className: 'mt-4 flex flex-wrap justify-center gap-2', children: [_jsx(Button, { onClick: () => navigate('/'), children: "Terug naar startpagina" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/booking'), children: "Boek uw rit" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/tracking'), children: "Volg uw taxi" })] })] })] }) });
    if (route === 'driver')
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-4xl space-y-4', children: [Header, _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h1", { className: 'text-2xl font-semibold', children: "Driver App" }), _jsx("p", { className: 'mt-2 text-lv-mist', children: "Login vereist om ritten en GPS-acties veilig te beheren. Founder-driver toegang verloopt via de bestaande driver omgeving." }), _jsxs("ul", { className: 'mt-3 list-disc space-y-1 pl-5 text-sm text-lv-mist', children: [_jsx("li", { children: "Ga online/offline" }), _jsx("li", { children: "Accepteer nieuwe rit" }), _jsx("li", { children: "Start GPS en update ritstatus" })] }), _jsx("a", { href: DRIVER_SURFACE_URL, className: 'mt-4 inline-flex rounded-lg border border-lv-gold/40 px-3 py-2', children: "Open Driver Surface" })] })] }) });
    if (route === 'moni')
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-5xl space-y-4', children: [Header, _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h1", { className: 'text-2xl font-semibold', children: "Moni Ride Concierge" }), _jsx("p", { className: 'text-lv-mist', children: "Moni Ride is beschikbaar voor booking assistentie, tracking vragen en escalatie naar operations." }), _jsxs("ul", { className: 'mt-3 list-disc pl-5 text-sm text-lv-mist', children: [_jsx("li", { children: "Customer-friendly fallback zonder backend afhankelijkheid" }), _jsx("li", { children: "Snelle intents: booking, tracking, airport, premium" }), _jsx("li", { children: "Escalatiepad naar operator bij onduidelijke situaties" })] })] }), _jsx(MoniAssistant, {})] }) });
    if (route === 'maps')
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-5xl space-y-4', children: [Header, _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h1", { className: 'text-2xl font-semibold', children: "Live Map & Tracking" }), _jsxs("p", { className: 'text-lv-mist', children: ["Map provider: ", _jsx("b", { children: MAPS_PROVIDER })] }), (!MAPBOX_KEY && !GOOGLE_MAPS_KEY) ? _jsx("div", { className: 'mt-3 rounded-xl border border-amber-300/40 bg-amber-100/10 p-4 text-sm text-amber-100', children: "Geen Maps API key gevonden (VITE_MAPBOX_TOKEN of VITE_GOOGLE_MAPS_API_KEY). Fallback kaart actief: tracking blijft beschikbaar via status updates en ETA." }) : _jsx("div", { className: 'mt-3 rounded-xl border border-lv-gold/30 p-4 text-sm text-lv-mist', children: "Maps key gevonden. Koppel hier de provider-component voor realtime kaartvisualisatie." }), _jsx("div", { className: 'mt-3 h-56 rounded-2xl border border-lv-gold/30 bg-black/40 p-4 text-sm text-lv-mist', children: "Fallback map canvas \u2014 geen blanco scherm. Indien externe map faalt blijft deze operationele fallback zichtbaar." })] })] }) });
    if (route === 'admin')
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-5xl space-y-4', children: [Header, _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h1", { className: 'text-2xl font-semibold', children: "Admin / Control Tower" }), _jsx("p", { className: 'text-lv-mist', children: "Active rides, upcoming rides, drivers, booking lifecycle status en operationele readiness." }), _jsxs("p", { className: 'mt-2 text-sm', children: ["API health: ", _jsx("b", { children: apiHealth })] }), _jsxs("ul", { className: 'mt-3 list-disc pl-5 text-sm text-lv-mist', children: [_jsx("li", { children: "Active rides" }), _jsx("li", { children: "Upcoming rides" }), _jsx("li", { children: "Drivers" }), _jsx("li", { children: "Booking lifecycle status" }), _jsx("li", { children: "Operational readiness" })] }), _jsx("a", { href: ADMIN_SURFACE_URL, className: 'mt-4 inline-flex rounded-lg border border-lv-gold/40 px-3 py-2', children: "Open Admin Surface" })] })] }) });
    return _jsx("div", { className: 'premium-shell min-h-screen px-4 py-4 text-white sm:px-6', children: _jsxs("div", { className: 'mx-auto w-full max-w-6xl space-y-5', children: [Header, _jsxs("section", { id: 'booking', className: 'grid gap-4 lg:grid-cols-[1.2fr_0.8fr]', children: [_jsxs("div", { className: 'glass-panel rounded-3xl p-5', children: [_jsx("h2", { className: 'text-xl font-semibold', children: "Boek rit" }), _jsx("p", { className: 'mt-1 text-sm text-lv-mist', children: "Flow: kies service \u2192 pickup/dropoff \u2192 prijs \u2192 boek \u2192 code \u2192 track." }), !confirmation && _jsxs(_Fragment, { children: [_jsxs("div", { className: 'mt-4 mb-2 text-sm text-lv-mist', children: ["Stap ", step, " van 3"] }), step === 1 && _jsxs("div", { className: 'space-y-2', children: [_jsx("input", { value: pickup, onChange: (e) => setPickup(e.target.value), placeholder: 'Pickup' }), _jsx("input", { value: destination, onChange: (e) => setDestination(e.target.value), placeholder: 'Dropoff' }), _jsx("input", { type: 'datetime-local', value: dateTime, onChange: (e) => setDateTime(e.target.value) }), _jsx("input", { value: phone, onChange: (e) => setPhone(e.target.value), placeholder: 'Telefoon' })] }), step === 2 && _jsx("div", { children: vehicles.map((item) => _jsx("button", { onClick: () => setVehicle(item), children: item.name }, item.name)) }), step === 3 && _jsxs("div", { children: [_jsx("button", { onClick: () => setAirportTransfer(v => !v), children: "Airport transfer" }), _jsx("button", { onClick: () => setBusinessVip(v => !v), children: "Business/VIP" })] }), _jsxs("div", { className: 'mt-3 flex gap-2', children: [_jsx(Button, { variant: 'secondary', onClick: () => setStep((v) => Math.max(1, v - 1)), children: "Terug" }), step < 3 ? _jsx(Button, { onClick: () => setStep((v) => Math.min(3, v + 1)), children: "Verder" }) : _jsx(Button, { onClick: submitBooking, disabled: !intakeReady || !isOnline || loading, children: "Reserveer nu" })] })] }), confirmation && _jsxs("div", { children: [_jsxs("p", { children: ["Referentie ", confirmation.referenceCode] }), _jsx("button", { onClick: () => navigate('/tracking'), children: "Volg taxi" })] }), info && _jsx("p", { children: info }), error && _jsx("p", { children: error })] }), _jsxs("aside", { className: 'space-y-4', children: [_jsxs("article", { className: 'glass-panel rounded-3xl p-4', children: [_jsx("p", { children: "View prices" }), _jsxs("p", { children: ["\u20AC", estimatedFare] })] }), _jsx("article", { className: 'glass-panel rounded-3xl p-4', children: _jsx("p", { children: "Airport transfer" }) }), _jsx("article", { className: 'glass-panel rounded-3xl p-4', children: _jsx("p", { children: "Business/VIP" }) }), _jsx("article", { className: 'glass-panel rounded-3xl p-4', children: _jsx("p", { children: "Contact" }) })] })] }), _jsx(MoniAssistant, {})] }) });
}

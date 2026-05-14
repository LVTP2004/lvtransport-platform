import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';
const MAPBOX_KEY = import.meta.env.VITE_MAPBOX_TOKEN ?? '';
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
    const [apiHealth, setApiHealth] = useState('controle bezig');
    const [trackingCode, setTrackingCode] = useState('');
    const [booking, setBooking] = useState({ date: '', time: '', name: '', phone: '', pickup: '', destination: '', persons: 1, notes: '' });
    const navigate = (path) => {
        history.pushState({}, '', path);
        setRoute(resolveRoute(path));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };
    useEffect(() => {
        const onPop = () => setRoute(resolveRoute(window.location.pathname));
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);
    useEffect(() => {
        fetch(`${API_BASE}/health`)
            .then((r) => r.json())
            .then((d) => setApiHealth(d?.status ?? 'onbekend'))
            .catch(() => setApiHealth('degraded'));
    }, []);
    useEffect(() => {
        const targets = {
            home: 'hero',
            booking: 'booking',
            tracking: 'tracking',
            prijzen: 'prijzen',
            diensten: 'diensten',
            contact: 'contact',
            maps: 'maps',
            moni: 'moni',
            driver: 'driver',
            admin: 'admin',
            '404': 'hero'
        };
        const target = document.getElementById(targets[route]);
        if (target && ['home', 'booking', 'tracking', 'prijzen', 'diensten', 'contact', 'maps', 'moni'].includes(route)) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [route]);
    const mapsMissing = !GOOGLE_MAPS_KEY && !MAPBOX_KEY;
    const apiOnline = apiHealth === 'ok' || apiHealth === 'healthy';
    const bookingReady = booking.date && booking.time && booking.name && booking.phone && booking.pickup && booking.destination;
    const fixedPrices = useMemo(() => [
        ['Antwerpen Centrum → Brussels Airport', '€95'],
        ['Antwerpen Centrum → Charleroi Airport', '€165'],
        ['Antwerpen Centrum → Zaventem', '€95'],
        ['Antwerpen Centrum → Gent Centrum', '€125']
    ], []);
    const Header = (_jsx("header", { className: 'glass-panel sticky top-3 z-30 rounded-3xl p-4', children: _jsxs("nav", { className: 'flex flex-wrap items-center gap-2 text-sm', children: [_jsx("img", { src: '/brand/lv-logo-header.svg', className: 'mr-2 h-8', alt: 'LV Transport' }), [
                    ['/', 'Home'], ['/booking', 'Boeking'], ['/prijzen', 'Prijzen'], ['/tracking', 'Tracking'], ['/moni-ride', 'Moni Ride'], ['/maps', 'Maps'], ['/diensten', 'Diensten'], ['/contact', 'Contact']
                ].map(([p, l]) => _jsx("button", { onClick: () => navigate(p), className: 'rounded-lg border border-lv-gold/30 px-3 py-1.5 hover:bg-lv-gold/15', children: l }, p)), _jsxs("div", { className: 'ml-auto flex gap-2', children: [_jsx("button", { onClick: () => navigate('/driver'), className: 'rounded-lg border border-white/20 px-3 py-1.5 text-xs text-lv-mist', children: "Driver" }), _jsx("button", { onClick: () => navigate('/admin'), className: 'rounded-lg border border-white/20 px-3 py-1.5 text-xs text-lv-mist', children: "Admin" })] })] }) }));
    if (route === '404')
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-4xl space-y-4', children: [Header, _jsxs("section", { className: 'glass-panel rounded-3xl p-8 text-center', children: [_jsx("h1", { className: 'text-3xl font-semibold', children: "Pagina niet gevonden" }), _jsx(Button, { onClick: () => navigate('/'), children: "Terug naar startpagina" })] })] }) });
    if (route === 'driver' || route === 'admin') {
        const isDriver = route === 'driver';
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("div", { className: 'mx-auto max-w-4xl space-y-4', children: [Header, _jsxs("section", { id: isDriver ? 'driver' : 'admin', className: 'glass-panel rounded-3xl p-7', children: [_jsx("h1", { className: 'text-3xl font-semibold', children: isDriver ? 'Driver toegang' : 'Admin control tower' }), _jsx("p", { className: 'mt-2 text-lv-mist', children: isDriver ? 'Chauffeurs beheren ritacceptatie, statusupdates en navigatie in de beveiligde driver omgeving.' : 'Operations volgt booking lifecycle, actieve ritten en dispatch in de beveiligde admin omgeving.' }), _jsxs("a", { className: 'mt-5 inline-flex rounded-xl border border-lv-gold/40 px-4 py-2', href: isDriver ? DRIVER_SURFACE_URL : ADMIN_SURFACE_URL, children: ["Open ", isDriver ? 'Driver' : 'Admin', " Surface"] })] })] }) });
    }
    return _jsx("div", { className: 'premium-shell min-h-screen px-4 py-4 text-white sm:px-6', children: _jsxs("div", { className: 'mx-auto w-full max-w-6xl space-y-5', children: [Header, _jsxs("section", { id: 'hero', className: 'glass-panel rounded-3xl p-6 sm:p-10', children: [_jsx("p", { className: 'text-sm uppercase tracking-[0.25em] text-lv-champagne', children: "Antwerpen 24/7 service" }), _jsx("h1", { className: 'mt-3 text-4xl font-semibold sm:text-5xl', children: "Premium taxi service voor elke rit in en rond Antwerpen." }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "LV Transport is operationeel met live booking, tracking en vaste prijzen. U boekt in minuten en volgt uw chauffeur stap voor stap." }), _jsxs("div", { className: 'mt-6 flex flex-wrap gap-3', children: [_jsx(Button, { onClick: () => navigate('/booking'), children: "Book uw rit" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/prijzen'), children: "Bekijk prijzen" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/tracking'), children: "Volg uw taxi" })] }), _jsxs("div", { className: 'mt-6 grid gap-3 sm:grid-cols-3', children: [_jsxs("div", { className: 'status-pill', children: ["API status: ", _jsx("b", { className: apiOnline ? 'text-emerald-300' : 'text-amber-200', children: apiHealth })] }), _jsx("div", { className: 'status-pill', children: "Booking lifecycle: ontvangen \u2192 toegewezen \u2192 onderweg \u2192 aangekomen" }), _jsx("div", { className: 'status-pill', children: "Tracking werkt met 6-cijferige reservatiecode" })] })] }), _jsx("section", { id: 'diensten', className: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: ['Taxi Antwerpen', 'Luchthaventransfer', 'Zakelijk vervoer', 'LV VIP'].map((service) => _jsxs("article", { className: 'glass-panel rounded-2xl p-5', children: [_jsx("h3", { className: 'text-lg font-semibold', children: service }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Stipt, veilig en premium comfort met professionele chauffeurs." })] }, service)) }), _jsxs("section", { id: 'prijzen', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Vaste prijzen" }), _jsx("div", { className: 'mt-4 grid gap-3 sm:grid-cols-2', children: fixedPrices.map(([routeLabel, price]) => _jsxs("div", { className: 'rounded-2xl border border-lv-gold/25 bg-black/20 p-4', children: [_jsx("p", { className: 'text-sm text-lv-mist', children: routeLabel }), _jsx("p", { className: 'text-2xl font-semibold text-lv-champagne', children: price })] }, routeLabel)) })] }), _jsxs("section", { id: 'booking', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Boek uw rit" }), _jsx("div", { className: 'mt-4 grid gap-3 sm:grid-cols-2', children: ['date', 'time', 'name', 'phone', 'pickup', 'destination', 'persons', 'notes'].map((field) => (_jsxs("label", { className: `field-wrap ${field === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: field }), field === 'notes' ? _jsx("input", { placeholder: 'Extra details voor chauffeur', value: booking.notes, onChange: (e) => setBooking({ ...booking, notes: e.target.value }) }) : field === 'persons' ? _jsx("input", { type: 'number', min: 1, max: 8, value: booking.persons, onChange: (e) => setBooking({ ...booking, persons: Number(e.target.value) }) }) : _jsx("input", { type: field === 'date' ? 'date' : field === 'time' ? 'time' : 'text', value: booking[field], onChange: (e) => setBooking({ ...booking, [field]: e.target.value }) })] }, field))) }), _jsxs("div", { className: 'mt-4 flex items-center gap-3', children: [_jsx(Button, { disabled: !bookingReady, children: "Reserveer rit" }), _jsx("p", { className: 'text-sm text-lv-mist', children: "Geen blanco scherm: formulier blijft bruikbaar bij trage API." })] })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Volg uw rit" }), _jsx("p", { className: 'mt-1 text-lv-mist', children: "Vul uw 6-cijferige reservatiecode in om status en ETA te bekijken." }), _jsxs("div", { className: 'mt-3 flex gap-3', children: [_jsx("input", { className: 'w-full rounded-xl border border-lv-gold/30 bg-black/20 px-4 py-3', maxLength: 6, placeholder: 'Bijv. 482931', value: trackingCode, onChange: (e) => setTrackingCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }), _jsx(Button, { variant: 'secondary', disabled: trackingCode.length !== 6, children: "Controleer" })] })] }), _jsxs("section", { id: 'moni', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Moni Ride assistent" }), _jsx("p", { className: 'mt-2 text-lv-mist', children: "Hallo! Ik ben Moni Ride. Ik help u met boeken, prijzen, tracking en directe hulp bij vragen over uw rit." })] }), _jsxs("section", { id: 'maps', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Route preview" }), mapsMissing ? _jsx("div", { className: 'mt-3 rounded-xl border border-amber-300/40 bg-amber-100/10 p-4 text-amber-100', children: "Maps API key ontbreekt. Fallback route panel actief zodat de klant altijd een operationele interface ziet." }) : _jsx("div", { className: 'mt-3 rounded-xl border border-emerald-300/40 bg-emerald-100/10 p-4 text-emerald-100', children: "Maps key gevonden. Route preview staat klaar." }), _jsx("div", { className: 'mt-3 h-48 rounded-2xl border border-lv-gold/20 bg-black/30 p-4 text-sm text-lv-mist', children: "Fallback kaartpaneel: pickup, bestemming en ETA blijven zichtbaar." })] }), _jsxs("section", { id: 'contact', className: 'glass-panel rounded-3xl p-6 text-sm', children: [_jsx("h2", { className: 'text-xl font-semibold', children: "Contact" }), _jsx("p", { className: 'mt-2', children: "+32 466 48 79 36" }), _jsx("p", { children: "info@lvtransport.be" }), _jsx("p", { children: "www.lvtransport.be" }), _jsx("p", { children: "BTW: BE 1036.807.066" })] }), _jsx(MoniAssistant, {})] }) });
}

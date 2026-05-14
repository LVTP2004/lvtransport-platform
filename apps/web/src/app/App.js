import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@lvtransport/ui';
import { MoniAssistant } from '../modules/moni/components/MoniAssistant';
const DRIVER_SURFACE_URL = import.meta.env.VITE_DRIVER_SURFACE_URL ?? 'https://driver.lvtransport.be';
const ADMIN_SURFACE_URL = import.meta.env.VITE_ADMIN_SURFACE_URL ?? 'https://admin.lvtransport.be';
const navItems = [
    { path: '/', label: 'Home', section: 'hero' },
    { path: '/boeken', label: 'Boeken', section: 'booking' },
    { path: '/prijzen', label: 'Prijzen', section: 'prijzen' },
    { path: '/tracking', label: 'Volg uw taxi', section: 'tracking' },
    { path: '/diensten', label: 'Diensten', section: 'diensten' },
    { path: '/vip', label: 'LV VIP', section: 'vip' },
    { path: '/contact', label: 'Contact', section: 'footer' }
];
const resolveRoute = (pathname) => {
    const p = pathname.toLowerCase();
    if (['/', '/home'].includes(p))
        return 'home';
    if (['/boeken', '/booking'].includes(p))
        return 'boeken';
    if (p === '/prijzen')
        return 'prijzen';
    if (['/tracking', '/volg-uw-taxi'].includes(p))
        return 'tracking';
    if (p === '/diensten')
        return 'diensten';
    if (p === '/vip')
        return 'vip';
    if (p === '/contact')
        return 'contact';
    if (['/driver', '/driver.html'].includes(p))
        return 'driver';
    if (['/admin', '/admin.html', '/tower'].includes(p))
        return 'admin';
    return '404';
};
export function App() {
    const [route, setRoute] = useState(() => resolveRoute(window.location.pathname));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [trackingCode, setTrackingCode] = useState('');
    const [booking, setBooking] = useState({ name: '', phone: '', pickup: '', destination: '', date: '', time: '', passengers: '1', notes: '' });
    const [estimate, setEstimate] = useState({ distance: '18 km', price: '€74 - €96', airport: 'Nee' });
    const priceRoutes = useMemo(() => [
        ['Antwerpen → Brussels Airport', '€95'], ['Antwerpen → Charleroi', '€165'], ['Antwerpen → Schiphol', '€310'], ['Antwerpen → Eindhoven', '€220'],
        ['Antwerpen → Gent', '€125'], ['Antwerpen → Brugge', '€160'], ['Antwerpen → Leuven', '€150'], ['Antwerpen → Hasselt', '€140'], ['Antwerpen → Rotterdam', '€210']
    ], []);
    const navigate = (path, section) => {
        history.pushState({}, '', path);
        setRoute(resolveRoute(path));
        setMobileOpen(false);
        if (section)
            setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    };
    useEffect(() => {
        const onPop = () => setRoute(resolveRoute(window.location.pathname));
        window.addEventListener('popstate', onPop);
        return () => window.removeEventListener('popstate', onPop);
    }, []);
    useEffect(() => {
        const targetMap = { home: 'hero', boeken: 'booking', prijzen: 'prijzen', tracking: 'tracking', diensten: 'diensten', vip: 'vip', contact: 'footer', driver: 'driver', admin: 'admin', '404': 'hero' };
        document.getElementById(targetMap[route])?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, [route]);
    useEffect(() => {
        const text = `${booking.pickup} ${booking.destination}`.toLowerCase();
        const airport = /(airport|zaventem|charleroi|schiphol|eindhoven|antwerp)/.test(text);
        const distance = airport ? '44 km' : booking.destination ? '22 km' : '18 km';
        const price = airport ? '€95 - €170' : booking.destination ? '€78 - €110' : '€74 - €96';
        setEstimate({ distance, price, airport: airport ? 'Ja' : 'Nee' });
    }, [booking.pickup, booking.destination]);
    if (route === 'driver' || route === 'admin') {
        const isDriver = route === 'driver';
        return _jsx("div", { className: 'premium-shell min-h-screen p-6 text-white', children: _jsxs("section", { id: isDriver ? 'driver' : 'admin', className: 'glass-panel mx-auto max-w-5xl rounded-3xl p-8', children: [_jsx("h1", { className: 'text-3xl font-semibold', children: isDriver ? 'Driver Operations App' : 'Admin Control Tower' }), _jsx("p", { className: 'mt-2 text-lv-mist', children: isDriver ? 'Toegewezen ritten, accepteren/weigeren, realtime status en routeprogressie voor chauffeurs.' : 'Beheer prijzen, homepage-teksten, routes, VIP-content, reviews, footertekst en operationele meldingen.' }), _jsx("div", { className: 'mt-5 grid gap-3 sm:grid-cols-2', children: ['Prijzen', 'Homepage tekst', 'Routes', 'VIP content', 'Reviews', 'Footer', 'Announcements', 'Ritmonitoring'].map((m) => _jsx("div", { className: 'rounded-xl border border-lv-gold/25 bg-black/35 p-3', children: m }, m)) }), _jsxs("a", { className: 'mt-6 inline-flex rounded-xl border border-lv-gold/50 px-4 py-2', href: isDriver ? DRIVER_SURFACE_URL : ADMIN_SURFACE_URL, children: ["Open beveiligde ", isDriver ? 'Driver' : 'Admin', " omgeving"] })] }) });
    }
    return _jsx("div", { className: 'premium-shell min-h-screen px-4 py-4 text-white sm:px-6', children: _jsxs("div", { className: 'mx-auto max-w-6xl space-y-5', children: [_jsxs("header", { className: 'glass-panel sticky top-3 z-30 rounded-3xl p-4', children: [_jsxs("nav", { className: 'hidden items-center gap-2 md:flex', children: [_jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-10', alt: 'LV Transport' }), _jsx("div", { className: 'mx-auto flex gap-2', children: navItems.map((n) => _jsx("button", { onClick: () => navigate(n.path, n.section), className: 'nav-btn', children: n.label }, n.path)) }), _jsxs("div", { className: 'flex gap-2', children: [_jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/driver'), children: "Driver" }), _jsx("button", { className: 'nav-btn-muted', onClick: () => navigate('/admin'), children: "Admin" })] })] }), _jsxs("div", { className: 'flex items-center justify-between md:hidden', children: [_jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-9', alt: 'LV Transport' }), _jsx("button", { className: 'nav-btn', onClick: () => setMobileOpen((v) => !v), children: "\u2630" })] }), mobileOpen && _jsxs("div", { className: 'mobile-menu mt-3 md:hidden', children: [navItems.map((n) => _jsx("button", { className: 'mobile-link', onClick: () => navigate(n.path, n.section), children: n.label }, n.path)), _jsxs("div", { className: 'mt-2 flex gap-2', children: [_jsx("button", { className: 'nav-btn-muted w-full', onClick: () => navigate('/driver'), children: "Driver" }), _jsx("button", { className: 'nav-btn-muted w-full', onClick: () => navigate('/admin'), children: "Admin" })] })] })] }), _jsxs("section", { id: 'hero', className: 'glass-panel hero-panel rounded-3xl p-6 sm:p-10', children: [_jsx("p", { className: 'text-sm uppercase tracking-[0.25em] text-lv-champagne', children: "Executive mobility \u2022 Antwerpen & Belgi\u00EB" }), _jsx("h1", { className: 'mt-3 text-4xl font-semibold sm:text-6xl', children: "Premium vervoer in Antwerpen en heel Belgi\u00EB" }), _jsx("p", { className: 'mt-4 max-w-3xl text-lv-mist', children: "Direct boeken, realtime opvolgen en vaste premium service voor luchthavens, zakelijke ritten en VIP-vervoer." }), _jsxs("div", { className: 'mt-6 flex flex-wrap gap-3', children: [_jsx(Button, { onClick: () => navigate('/boeken', 'booking'), children: "Boek uw rit" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/prijzen', 'prijzen'), children: "Bekijk prijzen" }), _jsx(Button, { variant: 'secondary', onClick: () => navigate('/tracking', 'tracking'), children: "Volg uw taxi" })] }), _jsxs("div", { className: 'mt-6 grid gap-3 md:grid-cols-3', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Van" }), _jsx("input", { value: booking.pickup, onChange: (e) => setBooking({ ...booking, pickup: e.target.value }), placeholder: 'Antwerpen, hotel, kantoor...' })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Naar" }), _jsx("input", { value: booking.destination, onChange: (e) => setBooking({ ...booking, destination: e.target.value }), placeholder: 'Luchthaven of bestemming...' })] }), _jsxs("div", { className: 'rounded-2xl border border-lv-gold/35 bg-black/45 p-4 text-sm', children: [_jsxs("p", { children: ["Airport detectie: ", _jsx("b", { children: estimate.airport })] }), _jsxs("p", { children: ["Afstand: ", _jsx("b", { children: estimate.distance })] }), _jsxs("p", { children: ["Schatting: ", _jsx("b", { className: 'text-lv-champagne', children: estimate.price })] })] })] })] }), _jsx("section", { id: 'diensten', className: 'grid gap-3 sm:grid-cols-2 lg:grid-cols-4', children: [['Taxi Antwerpen', '24/7 stedelijke ritten met premium comfort.'], ['Luchthavenvervoer', 'Brussels, Charleroi, Schiphol, Eindhoven, Antwerp Airport.'], ['Zakelijk vervoer', 'Facturen, maandelijkse billing en contractritten.'], ['LV VIP', 'Prioriteit, premium chauffeurs en abonnementsvoordelen.']].map(([t, d]) => _jsxs("article", { className: 'glass-panel service-card rounded-2xl p-5', children: [_jsx("h3", { className: 'text-lg font-semibold', children: t }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: d })] }, t)) }), _jsxs("section", { id: 'prijzen', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Premium routeprijzen" }), _jsx("div", { className: 'route-carousel mt-4', children: priceRoutes.concat(priceRoutes).map(([r, p], i) => _jsxs("div", { className: 'route-card', children: [_jsx("p", { className: 'text-sm text-lv-mist', children: r }), _jsx("p", { className: 'text-2xl font-semibold text-lv-champagne', children: p })] }, r + i)) })] }), _jsxs("section", { id: 'booking', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Boek uw rit" }), _jsx("div", { className: 'mt-4 grid gap-3 sm:grid-cols-2', children: [['name', 'Naam'], ['phone', 'Telefoon'], ['pickup', 'Pickup'], ['destination', 'Bestemming'], ['date', 'Datum'], ['time', 'Tijd'], ['passengers', 'Passagiers'], ['notes', 'Notities']].map(([key, label]) => _jsxs("label", { className: `field-wrap ${key === 'notes' ? 'sm:col-span-2' : ''}`, children: [_jsx("span", { children: label }), _jsx("input", { type: key === 'date' || key === 'time' ? 'text' : 'text', value: booking[key], onChange: (e) => setBooking({ ...booking, [key]: e.target.value }) })] }, key)) }), _jsx("div", { className: 'mt-4', children: _jsx(Button, { children: "Reserveer rit" }) })] }), _jsxs("section", { id: 'tracking', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Volg uw taxi" }), _jsxs("div", { className: 'mt-3 flex gap-3', children: [_jsx("input", { className: 'w-full rounded-xl border border-lv-gold/30 bg-black/20 px-4 py-3', maxLength: 6, placeholder: 'Boekingscode', value: trackingCode, onChange: (e) => setTrackingCode(e.target.value.replace(/\D/g, '').slice(0, 6)) }), _jsx(Button, { variant: 'secondary', children: "Track" })] }), _jsxs("div", { className: 'mt-4 rounded-2xl border border-lv-gold/30 bg-black/40 p-4', children: [_jsx("p", { children: "Status: Chauffeur onderweg" }), _jsx("p", { children: "ETA: 9 minuten" }), _jsx("div", { className: 'mt-2 h-44 rounded-xl bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,.2),transparent_40%),linear-gradient(140deg,#0b0b0c,#141418)] p-3 text-lv-champagne', children: "\u25CF Gouden route \u2022 taxi-indicator actief \u2022 bestemming gemarkeerd" })] })] }), _jsxs("section", { id: 'vip', className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "LV VIP" }), _jsx("p", { className: 'mt-2 text-lv-mist', children: "Priority booking, premium chauffeurs, loyalty benefits, executive treatment en dedicated ondersteuning voor frequente reizigers en bedrijven." })] }), _jsxs("section", { className: 'glass-panel rounded-3xl p-6', children: [_jsx("h2", { className: 'text-2xl font-semibold', children: "Klantreviews" }), _jsx("div", { className: 'route-carousel mt-4', children: ['“Altijd op tijd voor Zaventem.” ★★★★★', '“Onze directie gebruikt enkel LV VIP.” ★★★★★', '“Facturatie en service zijn top.” ★★★★★', '“Perfecte rit naar Schiphol.” ★★★★★'].concat(['“Altijd op tijd voor Zaventem.” ★★★★★', '“Onze directie gebruikt enkel LV VIP.” ★★★★★']).map((r, i) => _jsx("div", { className: 'route-card text-sm', children: r }, i)) })] }), _jsxs("footer", { id: 'footer', className: 'glass-panel grid rounded-3xl p-6 text-sm md:grid-cols-3', children: [_jsx("div", { children: _jsx("img", { src: '/brand/lv-logo-header.svg', className: 'h-10', alt: 'LV Transport' }) }), _jsxs("div", { children: [_jsx("p", { children: "\uD83D\uDCDE +32 466 48 79 36" }), _jsx("p", { children: "\u2709 info@lvtransport.be" }), _jsx("p", { children: "\uD83C\uDF10 www.lvtransport.be" }), _jsx("p", { children: "BTW BE 1036.807.066" })] }), _jsxs("div", { children: [_jsx("p", { children: "\u00A9 2026 LV Transport. Alle rechten voorbehouden." }), _jsx("p", { children: "Legal notice" }), _jsx("p", { children: "All rights reserved" })] })] }), _jsx(MoniAssistant, {})] }) });
}

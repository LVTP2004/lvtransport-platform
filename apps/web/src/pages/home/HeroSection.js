import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
const colors = {
    bg: '#111214',
    panel: '#17181c',
    panelSoft: '#1d1f24',
    border: 'rgba(212,175,55,.28)',
    text: '#f3f0e7',
    textMuted: '#b8bcc6',
    gold: '#d4af37',
};
const rideTypes = [
    { key: 'standaard', label: 'Standaard' },
    { key: 'zakelijk', label: 'Zakelijk' },
    { key: 'luchthaven', label: 'Luchthaven' },
];
const pricing = [
    { destination: 'Zaventem', from: '€85' },
    { destination: 'Brussel', from: '€95' },
    { destination: 'Mechelen', from: '€70' },
    { destination: 'Gent', from: '€140' },
    { destination: 'Schiphol', from: '€240' },
];
const services = ['Taxi Antwerpen', 'Luchthavenvervoer', 'Zakelijk vervoer', 'Haven transport', 'Lange afstand'];
const section = {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '28px 18px',
};
export default function HeroSection() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [booking, setBooking] = useState({ pickup: '', destination: '', date: '', time: '', rideType: rideTypes[0].key, phone: '' });
    const [calc, setCalc] = useState({ pickup: '', destination: '', rideType: rideTypes[0].key, datetime: '' });
    const [rideCode, setRideCode] = useState('');
    const estimate = useMemo(() => {
        const chars = calc.pickup.length + calc.destination.length;
        if (!calc.pickup || !calc.destination) {
            return { price: '—', route: 'Vul vertrek en bestemming in', duration: '—' };
        }
        const pseudoKm = Math.max(8, Math.min(120, Math.round(chars / 2.4)));
        const base = calc.rideType === 'zakelijk' ? 38 : calc.rideType === 'luchthaven' ? 44 : 28;
        const estimated = base + pseudoKm * 2.1;
        const mins = Math.max(18, Math.min(130, Math.round(pseudoKm * 2.4)));
        return {
            price: `€${estimated.toFixed(0)}`,
            route: `Geschatte route: ± ${pseudoKm} km`,
            duration: `Geschatte duur: ${mins} min`,
        };
    }, [calc]);
    return (_jsxs("main", { style: { background: colors.bg, color: colors.text, minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }, children: [_jsx("header", { style: { position: 'sticky', top: 0, zIndex: 50, padding: '14px 14px 0' }, children: _jsxs("div", { style: { maxWidth: 1180, margin: '0 auto', border: `1px solid ${colors.border}`, borderRadius: 16, background: 'rgba(23,24,28,.84)', backdropFilter: 'blur(14px)', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("img", { src: "/brand/lv-logo-header.svg", alt: "LV Transport", style: { height: 22 } }), _jsx("button", { onClick: () => setMenuOpen(true), "aria-label": "Open menu", style: iconButton, children: "\u2630" })] }) }), menuOpen && (_jsxs("div", { style: { position: 'fixed', inset: 0, zIndex: 80, background: 'rgba(17,18,20,.97)', backdropFilter: 'blur(8px)', padding: '28px' }, children: [_jsx("div", { style: { display: 'flex', justifyContent: 'flex-end' }, children: _jsx("button", { onClick: () => setMenuOpen(false), "aria-label": "Sluit menu", style: iconButton, children: "\u2715" }) }), _jsx("nav", { style: { display: 'grid', gap: 18, marginTop: 40 }, children: ['HOME', 'DIENSTEN', 'PRIJZEN', 'TRACKING', 'CONTACT'].map((item) => (_jsx("a", { href: `#${item.toLowerCase()}`, onClick: () => setMenuOpen(false), style: menuLink, children: item }, item))) }), _jsxs("div", { style: { marginTop: 42, display: 'grid', gap: 10 }, children: [_jsx("a", { href: "tel:+32000000000", style: secondaryLink, children: "Bel nu" }), _jsx("a", { href: "https://wa.me/32000000000", style: secondaryLink, children: "WhatsApp" })] })] })), _jsx("section", { id: "home", style: { ...section, paddingTop: 34 }, children: _jsx("div", { style: { borderRadius: 26, overflow: 'hidden', border: `1px solid ${colors.border}` }, children: _jsx("div", { style: { minHeight: 540, backgroundImage: 'linear-gradient(95deg, rgba(17,18,20,.92) 20%, rgba(23,24,28,.76) 55%, rgba(35,37,43,.56) 100%), url(/brand/lvtransport/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }, children: _jsxs("div", { style: { maxWidth: 700, padding: '52px 28px' }, children: [_jsxs("h1", { style: { margin: '0 0 16px', lineHeight: 1.04, fontSize: 'clamp(38px,6vw,74px)' }, children: ["Betrouwbaar.", _jsx("br", {}), "Comfortabel.", _jsx("br", {}), "Altijd op tijd."] }), _jsxs("p", { style: { fontSize: 19, color: colors.textMuted, maxWidth: 560, lineHeight: 1.6 }, children: ["Premium vervoer in Antwerpen en Belgi\u00EB.", _jsx("br", {}), "24/7 beschikbaar."] })] }) }) }) }), _jsx("section", { id: "booking", style: section, children: _jsxs("div", { style: card, children: [_jsx("h2", { style: h2, children: "Boeking" }), _jsx("p", { style: muted, children: "Boekingsaanvragen worden door ons team bevestigd via telefoon of bericht. Er wordt geen automatische ritbevestiging getoond zonder backend-validatie." }), _jsxs("div", { style: grid2, children: [_jsx("input", { placeholder: "Pickup", value: booking.pickup, onChange: (e) => setBooking((s) => ({ ...s, pickup: e.target.value })), style: input }), _jsx("input", { placeholder: "Bestemming", value: booking.destination, onChange: (e) => setBooking((s) => ({ ...s, destination: e.target.value })), style: input }), _jsx("input", { type: "date", value: booking.date, onChange: (e) => setBooking((s) => ({ ...s, date: e.target.value })), style: input }), _jsx("input", { type: "time", value: booking.time, onChange: (e) => setBooking((s) => ({ ...s, time: e.target.value })), style: input }), _jsx("select", { value: booking.rideType, onChange: (e) => setBooking((s) => ({ ...s, rideType: e.target.value })), style: input, children: rideTypes.map((r) => _jsx("option", { value: r.key, children: r.label }, r.key)) }), _jsx("input", { placeholder: "Telefoon", value: booking.phone, onChange: (e) => setBooking((s) => ({ ...s, phone: e.target.value })), style: input })] }), _jsx("button", { type: "button", style: cta, children: "Reserveer nu" })] }) }), _jsx("section", { id: "diensten", style: section, children: _jsxs("div", { style: card, children: [_jsx("h2", { style: h2, children: "Diensten" }), _jsx("div", { style: serviceGrid, children: services.map((name) => _jsxs("article", { style: serviceCard, children: [_jsx("div", { style: dot }), name] }, name)) })] }) }), _jsx("section", { id: "prijzen", style: section, children: _jsxs("div", { style: card, children: [_jsx("h2", { style: h2, children: "Prijzen" }), _jsx("div", { style: serviceGrid, children: pricing.map((p) => _jsxs("article", { style: serviceCard, children: [_jsx("strong", { children: p.destination }), _jsxs("span", { style: { color: colors.textMuted }, children: ["Vanaf ", p.from] })] }, p.destination)) })] }) }), _jsx("section", { style: section, children: _jsxs("div", { style: card, children: [_jsx("h2", { style: h2, children: "Smart calculator" }), _jsxs("div", { style: grid2, children: [_jsx("input", { placeholder: "Pickup", value: calc.pickup, onChange: (e) => setCalc((s) => ({ ...s, pickup: e.target.value })), style: input }), _jsx("input", { placeholder: "Bestemming", value: calc.destination, onChange: (e) => setCalc((s) => ({ ...s, destination: e.target.value })), style: input }), _jsx("select", { value: calc.rideType, onChange: (e) => setCalc((s) => ({ ...s, rideType: e.target.value })), style: input, children: rideTypes.map((r) => _jsx("option", { value: r.key, children: r.label }, r.key)) }), _jsx("input", { type: "datetime-local", value: calc.datetime, onChange: (e) => setCalc((s) => ({ ...s, datetime: e.target.value })), style: input })] }), _jsxs("p", { style: { marginBottom: 8, color: '#f2dfab' }, children: ["Geschatte prijs: ", estimate.price] }), _jsxs("p", { style: muted, children: [estimate.route, " \u00B7 ", estimate.duration] })] }) }), _jsx("section", { id: "tracking", style: section, children: _jsxs("div", { style: card, children: [_jsx("h2", { style: h2, children: "Tracking" }), _jsx("p", { style: muted, children: "Voer je ritcode in om tracking te openen. Tracking beschikbaar na bevestiging van rit." }), _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' }, children: [_jsx("input", { placeholder: "Ritcode (max 5 cijfers)", value: rideCode, maxLength: 5, onChange: (e) => setRideCode(e.target.value.replace(/\D/g, '')), style: { ...input, maxWidth: 240 } }), _jsx("button", { type: "button", style: ctaSecondary, children: "Tracking openen" })] }), _jsxs("p", { style: { ...muted, marginTop: 12 }, children: ["API contract: ", _jsxs("code", { children: ["POST /api/v1/tracking/access ", '{ rideCode: string(5) }'] }), "."] })] }) }), _jsx("section", { id: "contact", style: section, children: _jsxs("div", { style: card, children: [_jsx("h2", { style: h2, children: "Contact" }), _jsx("p", { style: muted, children: "Bel of WhatsApp voor directe ondersteuning, of gebruik het boekingsformulier voor geplande ritten." })] }) }), _jsx("aside", { "aria-label": "MoniRide", style: { position: 'fixed', right: 16, bottom: 16, width: 54, height: 54, borderRadius: '50%', background: 'rgba(23,24,28,.96)', border: `1px solid ${colors.border}`, display: 'grid', placeItems: 'center', boxShadow: '0 0 20px rgba(212,175,55,.16)', color: '#f2dfab', fontWeight: 700 }, children: "LV" })] }));
}
const iconButton = { background: 'transparent', border: '1px solid rgba(212,175,55,.32)', color: '#f3f0e7', width: 36, height: 36, borderRadius: 10, cursor: 'pointer' };
const menuLink = { color: '#f3f0e7', textDecoration: 'none', letterSpacing: '.05em', fontSize: 'clamp(28px,5vw,54px)' };
const secondaryLink = { color: '#d4af37', textDecoration: 'none', fontSize: 16 };
const h2 = { marginTop: 0, marginBottom: 10, fontSize: 30 };
const muted = { color: colors.textMuted, marginTop: 0, lineHeight: 1.6 };
const grid2 = { display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' };
const serviceGrid = { display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))' };
const card = { border: `1px solid ${colors.border}`, borderRadius: 22, padding: 22, background: `linear-gradient(145deg, ${colors.panel}, ${colors.panelSoft})` };
const serviceCard = { border: `1px solid ${colors.border}`, borderRadius: 14, padding: 14, background: 'rgba(17,18,20,.72)', display: 'grid', gap: 8 };
const dot = { width: 8, height: 8, borderRadius: '50%', background: colors.gold };
const input = { border: '1px solid rgba(212,175,55,.24)', borderRadius: 12, padding: '12px 13px', background: '#111214', color: colors.text, width: '100%', boxSizing: 'border-box' };
const cta = { marginTop: 14, background: colors.gold, color: '#111214', border: 0, borderRadius: 12, padding: '12px 18px', fontWeight: 700, cursor: 'pointer' };
const ctaSecondary = { ...cta, background: 'transparent', color: colors.text, border: '1px solid rgba(212,175,55,.32)' };
const charcoal = '#111214';
const gold = '#d4af37';
const serviceTypes = [
    { key: 'standard', label: 'Standard', base: 24, perKm: 1.8 },
    { key: 'business', label: 'Business', base: 35, perKm: 2.3 },
    { key: 'van', label: 'Mercedes Van', base: 42, perKm: 2.8 },
];
const sectionWrap = {
    maxWidth: 1180,
    margin: '0 auto',
    padding: '32px 18px',
};
export default function HeroSection() {
    const [calc, setCalc] = useState({ origin: '', destination: '', service: serviceTypes[0].key, night: false });
    const estimate = useMemo(() => {
        const service = serviceTypes.find((item) => item.key === calc.service) ?? serviceTypes[0];
        const pseudoKm = Math.max(12, Math.min(80, Math.round((calc.origin.length + calc.destination.length) / 2.5)));
        const total = service.base + pseudoKm * service.perKm + (calc.night ? 18 : 0);
        return { total, pseudoKm, label: service.label };
    }, [calc]);
    return (_jsxs("main", { style: { background: '#090a0b', color: 'white', minHeight: '100vh', fontFamily: 'Inter, Arial, sans-serif' }, children: [_jsx("header", { style: { position: 'sticky', top: 12, zIndex: 50, padding: '0 12px' }, children: _jsxs("div", { style: { maxWidth: 1180, margin: '0 auto', padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(212,175,55,.22)', borderRadius: 18, background: 'rgba(12,14,18,.76)', backdropFilter: 'blur(18px)' }, children: [_jsx("img", { src: "/brand/lv-logo-header.svg", alt: "LV Transport", style: { height: 22 } }), _jsx("nav", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: ['Home', 'Booking', 'Pricing', 'Tracking', 'VIP'].map((item) => (_jsx("a", { href: `#${item.toLowerCase()}`, style: { color: '#f5f5f5', textDecoration: 'none', padding: '9px 14px', borderRadius: 999, fontSize: 13, background: 'rgba(255,255,255,.04)' }, children: item }, item))) })] }) }), _jsx("section", { id: "home", style: { ...sectionWrap, paddingTop: 56 }, children: _jsx("div", { style: { borderRadius: 30, overflow: 'hidden', border: '1px solid rgba(212,175,55,.24)', background: 'linear-gradient(135deg, rgba(18,18,22,.96), rgba(28,30,38,.88))' }, children: _jsx("div", { style: { minHeight: 560, backgroundImage: 'linear-gradient(90deg, rgba(6,8,10,.88) 18%, rgba(10,12,15,.72) 48%, rgba(16,18,22,.54) 100%), url(/brand/lvtransport/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }, children: _jsxs("div", { style: { maxWidth: 720, padding: '54px 34px' }, children: [_jsxs("div", { style: { display: 'inline-flex', alignItems: 'center', gap: 10, padding: '8px 14px', borderRadius: 999, background: 'rgba(212,175,55,.1)', border: '1px solid rgba(212,175,55,.22)', marginBottom: 18 }, children: [_jsx("span", { style: { width: 8, height: 8, borderRadius: '50%', background: gold } }), _jsx("span", { style: { fontSize: 12, color: '#f6e8ba', letterSpacing: '.08em', textTransform: 'uppercase' }, children: "Premium Hybrid Mobility" })] }), _jsx("h1", { style: { margin: '0 0 16px', fontSize: 'clamp(42px,7vw,74px)', lineHeight: 1.02, fontWeight: 800 }, children: "Mercedes & BYD executive transport in Antwerpen" }), _jsx("p", { style: { maxWidth: 620, color: '#d7d9de', fontSize: 18, lineHeight: 1.7, marginBottom: 28 }, children: "Luxury airport transfers, real-time operational tracking and premium chauffeur mobility." }), _jsxs("div", { style: { display: 'flex', gap: 14, flexWrap: 'wrap' }, children: [_jsx("a", { href: "#booking", style: { background: gold, color: charcoal, padding: '14px 20px', borderRadius: 14, textDecoration: 'none', fontWeight: 800 }, children: "Reserve now" }), _jsx("a", { href: "#tracking", style: { border: '1px solid rgba(212,175,55,.34)', color: 'white', padding: '14px 20px', borderRadius: 14, textDecoration: 'none', background: 'rgba(255,255,255,.05)' }, children: "Track your ride" })] })] }) }) }) }), _jsx("section", { id: "pricing", style: sectionWrap, children: _jsxs("div", { style: { display: 'grid', gap: 18, gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))' }, children: [_jsxs("div", { style: { borderRadius: 24, padding: 24, background: 'rgba(18,20,24,.92)', border: '1px solid rgba(212,175,55,.16)' }, children: [_jsx("h2", { style: { marginTop: 0 }, children: "Smart fare calculator" }), _jsxs("div", { style: { display: 'grid', gap: 12 }, children: [_jsx("input", { placeholder: "Pickup", value: calc.origin, onChange: (e) => setCalc((p) => ({ ...p, origin: e.target.value })), style: inputStyle }), _jsx("input", { placeholder: "Destination", value: calc.destination, onChange: (e) => setCalc((p) => ({ ...p, destination: e.target.value })), style: inputStyle }), _jsx("select", { value: calc.service, onChange: (e) => setCalc((p) => ({ ...p, service: e.target.value })), style: inputStyle, children: serviceTypes.map((service) => _jsx("option", { value: service.key, children: service.label }, service.key)) })] })] }), _jsxs("div", { style: { borderRadius: 24, padding: 24, background: 'linear-gradient(145deg, rgba(212,175,55,.12), rgba(20,20,24,.92))', border: '1px solid rgba(212,175,55,.22)' }, children: [_jsx("p", { style: { margin: 0, color: '#f3d98b', textTransform: 'uppercase', letterSpacing: '.08em', fontSize: 12 }, children: "Estimated premium fare" }), _jsxs("h3", { style: { fontSize: 58, margin: '10px 0' }, children: ["\u20AC", estimate.total.toFixed(0)] }), _jsxs("p", { style: { color: '#d9d9d9' }, children: [estimate.label, " \u00B7 ~", estimate.pseudoKm, " km operational route"] })] })] }) }), _jsx("section", { id: "tracking", style: sectionWrap, children: _jsxs("div", { style: { borderRadius: 28, overflow: 'hidden', border: '1px solid rgba(212,175,55,.18)', background: 'rgba(12,13,16,.95)' }, children: [_jsxs("div", { style: { padding: 24 }, children: [_jsx("h2", { style: { margin: 0 }, children: "Operational tracking tower" }), _jsx("p", { style: { color: '#cfcfcf' }, children: "Driver ETA and premium ride lifecycle visibility." })] }), _jsx("iframe", { title: "Antwerpen map", src: "https://www.google.com/maps?q=Antwerpen&output=embed", width: "100%", height: "320", style: { border: 0, filter: 'grayscale(.92)' } })] }) }), _jsx("aside", { "aria-label": "MoniRide assistant", style: { position: 'fixed', bottom: 18, right: 18, width: 58, height: 58, borderRadius: '50%', border: '1px solid rgba(212,175,55,.48)', background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,.42), rgba(16,16,18,.98))', boxShadow: '0 0 30px rgba(212,175,55,.35)', display: 'grid', placeItems: 'center', fontSize: 24, color: '#fff4cf', zIndex: 60, cursor: 'pointer' }, children: "\uD83C\uDF1F" })] }));
}
const inputStyle = {
    border: '1px solid rgba(255,255,255,.14)',
    background: 'rgba(10,10,12,.92)',
    color: 'white',
    padding: '14px 14px',
    borderRadius: 14,
    width: '100%',
    boxSizing: 'border-box',
    fontSize: 14,
};

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

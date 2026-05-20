import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
const charcoal = '#111214';
const gold = '#d4af37';
const serviceTypes = [
    { key: 'standard', label: 'Standard', base: 24, perKm: 1.8 },
    { key: 'business', label: 'Business', base: 35, perKm: 2.3 },
    { key: 'van', label: 'Van', base: 42, perKm: 2.8 },
];
const statusSteps = [
    'Reserva confirmada',
    'Driver en camino',
    'Llegó',
    'Viaje completado',
];
const sectionWrap = {
    maxWidth: 1120,
    margin: '0 auto',
    padding: '28px 16px',
};
export default function HeroSection() {
    const [calc, setCalc] = useState({ origin: '', destination: '', service: serviceTypes[0].key });
    const [booking, setBooking] = useState({
        name: '',
        phone: '',
        origin: '',
        destination: '',
        datetime: '',
        note: '',
    });
    const [review, setReview] = useState({ stars: 5, comment: '' });
    const [reviewSent, setReviewSent] = useState(false);
    const estimate = useMemo(() => {
        const service = serviceTypes.find((item) => item.key === calc.service) ?? serviceTypes[0];
        const distanceSignal = Math.max(calc.origin.length + calc.destination.length, 10);
        const pseudoKm = Math.min(70, Math.round(distanceSignal / 2.7));
        const total = service.base + pseudoKm * service.perKm;
        return { total, pseudoKm, label: service.label };
    }, [calc]);
    const handleReserveEstimate = () => {
        setBooking((prev) => ({
            ...prev,
            origin: calc.origin || prev.origin,
            destination: calc.destination || prev.destination,
            note: prev.note || `Servicio ${estimate.label} · €${estimate.total.toFixed(2)} estimado`,
        }));
        document.getElementById('reservar')?.scrollIntoView({ behavior: 'smooth' });
    };
    return (_jsxs("main", { style: { background: '#090a0b', color: 'white', minHeight: '100vh', fontFamily: 'Arial, sans-serif' }, children: [_jsx("header", { style: { position: 'sticky', top: 10, zIndex: 40, padding: '0 10px' }, children: _jsxs("div", { style: { maxWidth: 1120, margin: '0 auto', padding: '8px 14px', display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center', border: '1px solid rgba(212,175,55,.22)', borderRadius: 16, background: 'rgba(18,20,24,.68)', backdropFilter: 'blur(12px)' }, children: [_jsx("img", { src: "/brand/lv-logo-header.svg", alt: "LV Transport", style: { height: 20, opacity: 0.95 } }), _jsx("nav", { style: { display: 'flex', gap: 4, flexWrap: 'wrap' }, children: ['Inicio', 'Reservar', 'Calcular', 'Contacto'].map((item) => (_jsx("a", { href: `#${item.toLowerCase()}`, style: { color: '#f5f5f5', textDecoration: 'none', padding: '7px 10px', borderRadius: 999, fontSize: 12, letterSpacing: '.2px' }, children: item }, item))) })] }) }), _jsx("section", { id: "inicio", style: { ...sectionWrap, paddingTop: 58 }, children: _jsx("div", { style: { borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(212,175,55,.22)', background: 'linear-gradient(120deg, rgba(17,18,20,.92), rgba(22,24,30,.82))' }, children: _jsx("div", { style: { minHeight: 440, backgroundImage: 'linear-gradient(100deg, rgba(11,12,14,.88) 20%, rgba(17,20,25,.74) 46%, rgba(20,22,26,.78) 100%), url(/hero-byd-night.png)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center' }, children: _jsxs("div", { style: { maxWidth: 640, padding: '44px 28px' }, children: [_jsx("p", { style: { margin: 0, color: 'rgba(212,175,55,.92)', letterSpacing: '1.5px', fontSize: 12, textTransform: 'uppercase' }, children: "LVTransport.be \u00B7 Premium Hybrid" }), _jsx("h1", { style: { margin: '12px 0', fontSize: 'clamp(30px,6vw,54px)', lineHeight: 1.06 }, children: "Premium hybrid mobility in Antwerpen" }), _jsx("p", { style: { color: '#d5d7dc', maxWidth: 560, margin: '0 0 20px' }, children: "Quiet rides. Real-time tracking. Always on time." }), _jsxs("div", { style: { display: 'flex', gap: 10, flexWrap: 'wrap' }, children: [_jsx("a", { href: "#reservar", style: { background: gold, color: charcoal, fontWeight: 700, textDecoration: 'none', borderRadius: 12, padding: '11px 16px' }, children: "Reservar" }), _jsx("a", { href: "#calcular", style: { border: '1px solid rgba(212,175,55,.42)', color: 'white', textDecoration: 'none', borderRadius: 12, padding: '11px 16px', background: 'rgba(20,21,24,.48)' }, children: "Calcular precio" })] })] }) }) }) }), _jsxs("section", { id: "calcular", style: sectionWrap, children: [_jsx("h2", { style: { marginTop: 0 }, children: "Smart calculator" }), _jsxs("div", { style: { display: 'grid', gap: 10, maxWidth: 650, border: '1px solid rgba(212,175,55,.2)', borderRadius: 18, padding: 16, background: 'rgba(17,19,23,.7)', backdropFilter: 'blur(8px)' }, children: [_jsx("input", { placeholder: "Origen", value: calc.origin, onChange: (e) => setCalc((p) => ({ ...p, origin: e.target.value })), style: inputStyle }), _jsx("input", { placeholder: "Destino", value: calc.destination, onChange: (e) => setCalc((p) => ({ ...p, destination: e.target.value })), style: inputStyle }), _jsx("select", { value: calc.service, onChange: (e) => setCalc((p) => ({ ...p, service: e.target.value })), style: inputStyle, children: serviceTypes.map((service) => _jsx("option", { value: service.key, children: service.label }, service.key)) }), _jsxs("p", { style: { margin: 0, color: gold }, children: ["Precio estimado: \u20AC", estimate.total.toFixed(2), " \u00B7 ~", estimate.pseudoKm, " km"] }), _jsx("button", { type: "button", onClick: handleReserveEstimate, style: goldButton, children: "Reservar este viaje" })] })] }), _jsxs("section", { id: "reservar", style: sectionWrap, children: [_jsx("h2", { children: "Reservar" }), _jsxs("form", { onSubmit: (e) => e.preventDefault(), style: { display: 'grid', gap: 10, maxWidth: 650 }, children: [_jsx("input", { placeholder: "Nombre", value: booking.name, onChange: (e) => setBooking((p) => ({ ...p, name: e.target.value })), style: inputStyle, required: true }), _jsx("input", { placeholder: "Tel\u00E9fono", value: booking.phone, onChange: (e) => setBooking((p) => ({ ...p, phone: e.target.value })), style: inputStyle, required: true }), _jsx("input", { placeholder: "Origen", value: booking.origin, onChange: (e) => setBooking((p) => ({ ...p, origin: e.target.value })), style: inputStyle, required: true }), _jsx("input", { placeholder: "Destino", value: booking.destination, onChange: (e) => setBooking((p) => ({ ...p, destination: e.target.value })), style: inputStyle, required: true }), _jsx("input", { type: "datetime-local", value: booking.datetime, onChange: (e) => setBooking((p) => ({ ...p, datetime: e.target.value })), style: inputStyle, required: true }), _jsx("textarea", { placeholder: "Nota opcional", value: booking.note, onChange: (e) => setBooking((p) => ({ ...p, note: e.target.value })), style: { ...inputStyle, minHeight: 80 } }), _jsx("button", { type: "submit", style: goldButton, children: "Enviar reserva" })] })] }), _jsxs("section", { id: "operaciones", style: sectionWrap, children: [_jsx("h2", { children: "Tracking operativo" }), _jsxs("div", { style: { border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: 14, maxWidth: 760, marginBottom: 12, background: 'rgba(13,14,17,.82)' }, children: [_jsx("p", { style: { margin: '0 0 8px', color: gold }, children: "C\u00F3digo 5 d\u00EDgitos: 38052 \u00B7 ETA: 12 min" }), _jsx("p", { style: { margin: '0 0 8px' }, children: "Driver: Amine \u00B7 Veh\u00EDculo: BYD Hybrid \u00B7 1-TRP-204" }), _jsx("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: statusSteps.map((item, index) => _jsx("span", { style: { border: '1px solid rgba(212,175,55,.3)', borderRadius: 999, padding: '6px 10px', background: index < 2 ? 'rgba(212,175,55,.14)' : 'transparent', fontSize: 12 }, children: item }, item)) })] }), _jsx("div", { style: { borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(212,175,55,.22)', maxWidth: 760 }, children: _jsx("iframe", { title: "Antwerpen map", src: "https://www.google.com/maps?q=Antwerpen&output=embed", width: "100%", height: "320", style: { border: 0, filter: 'grayscale(.92)' } }) })] }), _jsxs("section", { id: "contacto", style: { ...sectionWrap, paddingBottom: 80 }, children: [_jsx("h2", { children: "Rese\u00F1as y contacto" }), _jsxs("div", { style: { maxWidth: 620, display: 'grid', gap: 10, marginBottom: 18 }, children: [_jsx("select", { value: review.stars, onChange: (e) => setReview((p) => ({ ...p, stars: Number(e.target.value) })), style: inputStyle, children: [5, 4, 3, 2, 1].map((value) => _jsxs("option", { value: value, children: [value, " estrellas"] }, value)) }), _jsx("textarea", { placeholder: "Comentario corto", value: review.comment, onChange: (e) => setReview((p) => ({ ...p, comment: e.target.value })), style: { ...inputStyle, minHeight: 80 } }), _jsx("button", { type: "button", style: goldButton, onClick: () => setReviewSent(true), children: "Enviar" }), reviewSent && _jsx("small", { style: { color: gold }, children: "Gracias. Rese\u00F1a enviada localmente." })] }), _jsx("p", { style: { color: '#d1d5db' }, children: "Contacto operativo: +32 400 00 00 00 \u00B7 support@lvtransport.be" })] }), _jsx("aside", { style: { position: 'fixed', bottom: 16, right: 16, width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(212,175,55,.52)', background: 'radial-gradient(circle at 30% 30%, rgba(212,175,55,.35), rgba(17,18,20,.96))', boxShadow: '0 0 18px rgba(212,175,55,.32)', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, color: '#f6ebc7', zIndex: 35 }, children: "M" })] }));
}
const inputStyle = {
    border: '1px solid rgba(255,255,255,.16)',
    background: 'rgba(14,15,18,.92)',
    color: 'white',
    padding: '11px 12px',
    borderRadius: 10,
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
};
const goldButton = {
    background: gold,
    color: charcoal,
    border: 'none',
    borderRadius: 10,
    padding: '11px 14px',
    fontWeight: 700,
    cursor: 'pointer',
};

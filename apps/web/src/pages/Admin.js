import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '');
const API_V1_BASE = `${API_BASE}/api/v1`;
const GOLD = '#d4af37';
export default function Admin() {
    const [metrics, setMetrics] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
    const [visibleText, setVisibleText] = useState('Reserva clara. GPS claro. Operación estable.');
    const [basePrice, setBasePrice] = useState(24);
    const [services, setServices] = useState([
        { id: 'standard', name: 'Standard', basePrice: 24, active: true },
        { id: 'business', name: 'Business', basePrice: 35, active: true },
        { id: 'van', name: 'Van', basePrice: 42, active: false },
    ]);
    useEffect(() => {
        void (async () => {
            try {
                const [metricsRes, bookingsRes] = await Promise.all([
                    fetch(`${API_V1_BASE}/admin/bookings/metrics`),
                    fetch(`${API_V1_BASE}/admin/bookings`),
                ]);
                const metricsJson = await metricsRes.json();
                const bookingsJson = await bookingsRes.json();
                if (!metricsRes.ok || !bookingsRes.ok)
                    throw new Error(metricsJson?.message || bookingsJson?.message || 'Admin data ophalen mislukt.');
                setMetrics(metricsJson.metrics ?? null);
                setBookings(Array.isArray(bookingsJson.bookings) ? bookingsJson.bookings : []);
            }
            catch (err) {
                setError(err instanceof Error ? err.message : 'Admin data ophalen mislukt.');
            }
        })();
    }, []);
    const logs = [
        'MoniRide: GPS activo.',
        'Driver: estado actualizado.',
        'Founder: supervisión en curso.',
    ];
    return _jsx("main", { style: { background: '#111214', color: 'white', minHeight: '100vh', padding: '30px 16px', fontFamily: 'Arial, sans-serif' }, children: _jsxs("section", { style: { maxWidth: 980, margin: '0 auto', display: 'grid', gap: 14 }, children: [_jsx("h1", { style: { margin: 0, color: GOLD }, children: "Admin" }), _jsx("p", { style: { margin: 0 }, children: "Intervenci\u00F3n m\u00EDnima. Operaci\u00F3n primero." }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Textos visibles" }), _jsx("input", { value: visibleText, onChange: (e) => setVisibleText(e.target.value), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Precio base" }), _jsx("input", { type: 'number', value: basePrice, onChange: (e) => setBasePrice(Number(e.target.value)), style: inputStyle })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Tipos de servicio" }), _jsx("div", { style: { display: 'grid', gap: 8 }, children: services.map((service) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1.2fr .6fr .7fr', gap: 8 }, children: [_jsx("input", { value: service.name, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, name: e.target.value } : item)), style: inputStyle }), _jsx("input", { type: 'number', value: service.basePrice, onChange: (e) => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, basePrice: Number(e.target.value) } : item)), style: inputStyle }), _jsx("button", { type: 'button', onClick: () => setServices((prev) => prev.map((item) => item.id === service.id ? { ...item, active: !item.active } : item)), style: service.active ? enabledButton : disabledButton, children: service.active ? 'Activo' : 'Inactivo' })] }, service.id))) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Reservas y estados" }), error && _jsx("p", { style: { color: '#fca5a5' }, children: error }), metrics && _jsxs("p", { children: ["T: ", metrics.total, " \u00B7 A: ", metrics.active, " \u00B7 C: ", metrics.completed, " \u00B7 X: ", metrics.cancelled, " \u00B7 ", (metrics.completionRate * 100).toFixed(1), "%"] }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: bookings.slice(0, 15).map((booking) => _jsxs("li", { children: [booking.referenceCode, " \u00B7 ", booking.lifecycle.state, " \u00B7 ", booking.pickup, " \u2192 ", booking.destination] }, booking.id)) })] }), _jsxs("article", { style: cardStyle, children: [_jsx("h2", { style: h2Style, children: "Logs y alertas" }), _jsx("ul", { style: { margin: 0, paddingLeft: 18 }, children: logs.map((log) => _jsx("li", { children: log }, log)) }), _jsx("p", { style: { color: GOLD, marginBottom: 0 }, children: "Alerta simple: solo intervenir en emergencia." })] })] }) });
}
const cardStyle = {
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: 12,
    padding: 14,
    background: '#0f1011',
};
const h2Style = {
    margin: '0 0 8px',
    color: GOLD,
    fontSize: 18,
};
const inputStyle = {
    border: '1px solid rgba(255,255,255,.2)',
    borderRadius: 8,
    background: '#111214',
    color: 'white',
    padding: '9px 10px',
    width: '100%',
    boxSizing: 'border-box',
    fontFamily: 'Arial, sans-serif',
};
const enabledButton = {
    border: '1px solid rgba(212,175,55,.4)',
    background: 'rgba(212,175,55,.2)',
    color: 'white',
    borderRadius: 8,
};
const disabledButton = {
    border: '1px solid rgba(255,255,255,.2)',
    background: 'transparent',
    color: '#d1d5db',
    borderRadius: 8,
};

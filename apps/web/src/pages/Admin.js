import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
const API_BASE = (import.meta.env.VITE_API_BASE_URL ?? 'https://api.lvtransport.be').replace(/\/$/, '');
const API_V1_BASE = `${API_BASE}/api/v1`;
export default function Admin() {
    const [metrics, setMetrics] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [error, setError] = useState('');
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
    return _jsxs("div", { style: { background: '#0b0b0b', color: 'white', minHeight: '100vh', padding: '40px' }, children: [_jsx("h1", { children: "LV Admin Control Tower" }), _jsx("p", { children: "Operationele boekingen en lifecycle overzicht uit de productie-API." }), error && _jsx("p", { children: error }), metrics && _jsxs("p", { children: ["Totaal: ", metrics.total, " \u2022 Actief: ", metrics.active, " \u2022 Voltooid: ", metrics.completed, " \u2022 Geannuleerd: ", metrics.cancelled, " \u2022 Completion: ", (metrics.completionRate * 100).toFixed(1), "%"] }), _jsx("ul", { children: bookings.slice(0, 20).map((booking) => (_jsxs("li", { children: [booking.referenceCode, " \u2022 ", booking.lifecycle.state, " \u2022 ", booking.pickup, " \u2192 ", booking.destination, " \u2022 ", new Date(booking.scheduleAt).toLocaleString('nl-BE')] }, booking.id))) })] });
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@lvtransport/ui';
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1';
const TRACKING_BASE = import.meta.env.VITE_TRACKING_BASE_URL ?? '/track';
const vehicles = [
    { name: 'Executive Sedan', eta: '3 min', seats: 3, serviceType: 'standard', description: 'Comfortabele stadsrit voor premium verplaatsingen.' },
    { name: 'Business SUV', eta: '5 min', seats: 6, serviceType: 'airport', description: 'Extra ruimte voor luchthavenritten en bagage.' },
    { name: 'VIP Sprinter', eta: '10 min', seats: 10, serviceType: 'vip', description: 'Discrete groepsservice voor business en VIP.' }
];
const statusLabel = (status) => ({ pending: 'Boeking ontvangen', assigned: 'Chauffeur toegewezen', en_route: 'Chauffeur onderweg', arrived: 'Chauffeur aangekomen', in_progress: 'Rit bezig', completed: 'Rit voltooid' }[status] ?? 'Boeking bevestigd');
export function App() {
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
    const inFlightKeyRef = useRef(null);
    useEffect(() => {
        const onOnline = () => { setIsOnline(true); setInfo('Uw ritstatus wordt bijgewerkt.'); setError(''); };
        const onOffline = () => { setIsOnline(false); setError('We herstellen de verbinding. Uw gegevens blijven veilig bewaard.'); };
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline); };
    }, []);
    const serviceType = businessVip ? 'vip' : airportTransfer ? 'airport' : vehicle.serviceType;
    const trackingUrl = confirmation ? `${TRACKING_BASE}/${confirmation.referenceCode}` : '';
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
            const response = await fetch(`${API_BASE}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-Idempotency-Key': dedupeKey },
                body: JSON.stringify({ pickup, destination, scheduledAt: new Date(dateTime).toISOString(), serviceType, customerPhone: phone })
            });
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
    return _jsx("div", { className: 'premium-shell min-h-screen px-4 py-4 text-white sm:px-6', children: _jsxs("div", { className: 'mx-auto w-full max-w-6xl space-y-5', children: [_jsxs("header", { className: 'glass-panel rounded-3xl p-5', children: [_jsxs("div", { className: 'flex items-center justify-between gap-4', children: [_jsxs("div", { className: 'flex items-center gap-3', children: [_jsx("img", { src: '/brand/lv-logo-header.svg', alt: 'LV Transport', className: 'h-12 w-auto rounded-lg border border-lv-gold/30 bg-black/80 p-1.5' }), _jsxs("div", { children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.2em] text-lv-champagne', children: "Antwerpen \u00B7 Premium vervoer" }), _jsx("h1", { className: 'text-2xl font-semibold', children: "Luchthaven, business en VIP ritten" })] })] }), _jsx("a", { href: '#booking', className: 'hidden rounded-xl border border-lv-gold/30 px-4 py-2 text-sm text-lv-champagne md:block', children: "Reserveer nu" })] }), _jsx("p", { className: 'mt-3 text-sm text-lv-mist', children: "Premium taxi- en luchthavendienst in Antwerpen. Persoonlijk opgevolgd, met realtime ritzicht." }), _jsxs("div", { className: 'mt-4 flex flex-wrap gap-2 text-xs', children: [_jsx("span", { className: 'status-pill', children: "Zakelijk & VIP-ready" }), _jsx("span", { className: 'status-pill', children: "Founder-operated kwaliteit" }), _jsx("span", { className: 'status-pill', children: isOnline ? 'Uw ritstatus wordt bijgewerkt.' : 'We herstellen de verbinding.' })] })] }), _jsxs("section", { id: 'booking', className: 'grid gap-4 lg:grid-cols-[1.2fr_0.8fr]', children: [_jsxs("div", { className: 'glass-panel rounded-3xl p-5', children: [_jsx("h2", { className: 'text-xl font-semibold', children: "Reserveer uw rit" }), _jsx("p", { className: 'mt-1 text-sm text-lv-mist', children: "Vul onderstaande gegevens in. Na bevestiging ontvangt u een referentie en trackinglink." }), !confirmation && _jsxs(_Fragment, { children: [_jsxs("div", { className: 'mt-4 mb-2 text-sm text-lv-mist', children: ["Stap ", step, " van 3"] }), step === 1 && _jsxs("div", { className: 'space-y-3', children: [_jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Ophaallocatie" }), _jsx("input", { placeholder: 'Bijv. hotel, kantoor, thuisadres', value: pickup, onChange: (e) => setPickup(e.target.value) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Bestemming" }), _jsx("input", { placeholder: 'Bijv. luchthaven, station, meetinglocatie', value: destination, onChange: (e) => setDestination(e.target.value) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Datum & uur" }), _jsx("input", { type: 'datetime-local', value: dateTime, onChange: (e) => setDateTime(e.target.value) })] }), _jsxs("label", { className: 'field-wrap', children: [_jsx("span", { children: "Telefoonnummer voor opvolging" }), _jsx("input", { placeholder: '+32 ...', value: phone, onChange: (e) => setPhone(e.target.value) })] })] }), step === 2 && _jsxs("div", { className: 'space-y-3', children: [_jsxs("div", { className: 'field-wrap', children: [_jsx("span", { children: "Passagiers" }), _jsx("input", { type: 'number', min: 1, max: 12, value: passengers, onChange: (e) => setPassengers(Number(e.target.value) || 1) })] }), _jsx("div", { className: 'grid gap-2', children: vehicles.map((item) => _jsxs("button", { onClick: () => setVehicle(item), className: `vehicle-card ${vehicle.name === item.name ? 'vehicle-card--active' : ''}`, children: [_jsx("p", { className: 'font-medium', children: item.name }), _jsxs("p", { className: 'text-xs text-lv-mist', children: ["Tot ", item.seats, " passagiers \u00B7 ETA ", item.eta] }), _jsx("p", { className: 'text-xs text-lv-mist', children: item.description })] }, item.name)) })] }), step === 3 && _jsxs("div", { className: 'space-y-3', children: [_jsxs("button", { className: `toggle-card ${airportTransfer ? 'toggle-card--active' : ''}`, onClick: () => setAirportTransfer((v) => !v), children: [_jsx("span", { children: "Luchthavenservice" }), _jsx("span", { className: 'text-xs text-lv-mist', children: "Ideaal voor geplande vertrek- of aankomstritten." })] }), _jsxs("button", { className: `toggle-card ${businessVip ? 'toggle-card--active' : ''}`, onClick: () => setBusinessVip((v) => !v), children: [_jsx("span", { children: "Business / VIP service" }), _jsx("span", { className: 'text-xs text-lv-mist', children: "Discreet, punctueel en professioneel." })] })] }), _jsxs("div", { className: 'mt-5 flex gap-2', children: [_jsx(Button, { variant: 'secondary', className: 'flex-1', onClick: () => setStep((v) => Math.max(1, v - 1)), disabled: loading, children: "Terug" }), step < 3 ? _jsx(Button, { className: 'flex-1', onClick: () => setStep((v) => Math.min(3, v + 1)), disabled: loading, children: "Verder" }) : _jsx(Button, { className: 'flex-1 shadow-gold-md', onClick: submitBooking, disabled: loading || !intakeReady || !isOnline, children: loading ? 'Bevestigen...' : 'Reserveer nu' })] })] }), confirmation && _jsxs("div", { className: 'mt-4 space-y-3 rounded-2xl border border-lv-gold/25 bg-black/40 p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.18em] text-lv-champagne', children: "Boeking bevestigd" }), _jsxs("p", { className: 'text-lg font-semibold', children: ["Referentie ", confirmation.referenceCode] }), _jsxs("p", { className: 'text-sm text-lv-mist', children: ["Status: ", statusLabel(confirmation.status)] }), _jsx("p", { className: 'text-sm text-lv-mist', children: "LV Transport volgt uw rit op. Uw chauffeur blijft gekoppeld aan deze rit." }), _jsx("a", { className: 'inline-flex rounded-lg border border-lv-gold/40 px-3 py-2 text-sm text-lv-champagne', href: trackingUrl, children: "Volg uw rit" })] }), info && _jsx("p", { className: 'mt-3 text-sm text-lv-champagne', children: info }), error && _jsx("p", { className: 'mt-3 text-sm text-rose-300', children: error })] }), _jsxs("aside", { className: 'space-y-4', children: [_jsxs("article", { className: 'glass-panel rounded-3xl p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.18em] text-lv-champagne', children: "Waarom LV Transport" }), _jsxs("ul", { className: 'mt-2 space-y-2 text-sm text-lv-mist', children: [_jsx("li", { children: "Persoonlijke service door een founder-operated team." }), _jsx("li", { children: "Realtime ritopvolging met duidelijke statusupdates." }), _jsx("li", { children: "Geschikt voor luchthaven, business en VIP-vervoer." })] })] }), _jsxs("article", { className: 'glass-panel rounded-3xl p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.18em] text-lv-champagne', children: "Indicatieve ritprijs" }), _jsxs("p", { className: 'mt-2 text-3xl font-semibold', children: ["\u20AC", estimatedFare] }), _jsx("p", { className: 'text-xs text-lv-mist', children: "Definitieve prijs bij dispatchbevestiging." })] }), _jsxs("article", { className: 'glass-panel rounded-3xl p-4', children: [_jsx("p", { className: 'text-xs uppercase tracking-[0.18em] text-lv-champagne', children: "Contact" }), _jsx("p", { className: 'mt-2 text-sm text-lv-mist', children: "Vragen over uw reservatie? LV Transport neemt contact op via het opgegeven nummer." })] })] })] })] }) });
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
const GOLD = '#d4af37';
export default function Driver() {
    const [tripCode, setTripCode] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('Esperando viaje');
    const validCode = useMemo(() => /^\d{5}$/.test(tripCode), [tripCode]);
    const acceptRide = () => {
        if (!validCode) {
            setMessage('Código inválido. Debe tener 5 dígitos.');
            return;
        }
        setStatus('accepted');
        setMessage('Viaje aceptado. GPS automático activo.');
    };
    const cancelRide = () => {
        if (!validCode) {
            setMessage('Ingresa código válido para anular.');
            return;
        }
        setStatus('cancelled');
        setMessage('Viaje anulado por driver.');
    };
    return _jsx("main", { style: { background: '#111214', color: 'white', minHeight: '100vh', padding: '28px 16px', fontFamily: 'Arial, sans-serif' }, children: _jsxs("section", { style: { maxWidth: 560, margin: '0 auto', border: '1px solid rgba(212,175,55,.35)', borderRadius: 14, padding: 16 }, children: [_jsx("h1", { style: { marginTop: 0, color: GOLD }, children: "Driver" }), _jsxs("p", { children: ["Estado: ", _jsx("strong", { children: status })] }), _jsx("input", { value: tripCode, onChange: (e) => setTripCode(e.target.value), placeholder: 'C\u00F3digo de viaje (5 d\u00EDgitos)', style: inputStyle }), _jsxs("div", { style: { display: 'flex', gap: 8, marginTop: 10 }, children: [_jsx("button", { type: 'button', onClick: acceptRide, style: buttonStyle, children: "Aceptar viaje" }), _jsx("button", { type: 'button', onClick: cancelRide, style: { ...buttonStyle, background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,.25)' }, children: "Anular viaje" })] }), _jsx("p", { style: { marginBottom: 0, color: GOLD }, children: message })] }) });
}
const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    borderRadius: 10,
    border: '1px solid rgba(255,255,255,.2)',
    padding: '10px 12px',
    background: '#0b0b0b',
    color: 'white',
    fontFamily: 'Arial, sans-serif',
};
const buttonStyle = {
    background: GOLD,
    color: '#111214',
    border: 'none',
    borderRadius: 10,
    padding: '10px 12px',
    fontWeight: 700,
    cursor: 'pointer',
};

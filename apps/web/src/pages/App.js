import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export default function App() {
    return (_jsxs("main", { style: { minHeight: '100vh', background: '#050807', color: '#f5ead8', padding: 24, fontFamily: 'Inter,Arial,sans-serif' }, children: [_jsxs("header", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: 24 }, children: [_jsx("strong", { children: "LV TRANSPORT OS" }), _jsx("strong", { style: { color: '#4ade80' }, children: "\u25CF LIVE" })] }), _jsx("section", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 18 }, children: [
                    ['1. CLIENT — PREMIUM EXPERIENCE', 'Betrouwbaar. Comfortabel. Altijd op tijd.'],
                    ['2. DRIVER — OPERATIONAL COCKPIT', 'Realtime dispatch, ETA, airport intelligence.'],
                    ['3. ADMIN — CONTROL TOWER', 'Bookings, fleet status, operations, continuity.'],
                    ['4. FOUNDER — GOVERNANCE OS', 'Runtime intelligence, replay, audit, system health.']
                ].map(([k, t]) => (_jsxs("div", { style: { background: '#101817', border: '1px solid rgba(216,169,79,.35)', borderRadius: 20, padding: 24, minHeight: 220 }, children: [_jsx("div", { style: { color: '#d8a94f', fontWeight: 800, fontSize: 13 }, children: k }), _jsx("h1", { style: { fontSize: 30, lineHeight: 1.05, marginTop: 16 }, children: t })] }, k))) })] }));
}

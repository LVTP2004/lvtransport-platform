import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const gold = '#d4af37';
const metrics = [
    ['Realtime reliability', '96%'],
    ['Driver availability', '4 online'],
    ['Operational trust', 'Stable'],
    ['Airport coordination', 'Ready']
];
export default function Founder() {
    return (_jsx("main", { style: { background: '#050505', color: 'white', minHeight: '100vh', padding: '48px 22px', fontFamily: 'Inter, system-ui, sans-serif' }, children: _jsxs("div", { style: { maxWidth: 1180, margin: '0 auto' }, children: [_jsx("a", { href: "/", style: { color: gold, textDecoration: 'none', fontWeight: 800 }, children: "\u2190 LV Transport" }), _jsx("p", { style: { color: gold, letterSpacing: 4, fontWeight: 900, marginTop: 24 }, children: "FOUNDER CONTROL TOWER" }), _jsx("h1", { style: { fontSize: 'clamp(42px, 8vw, 74px)', margin: '10px 0 18px', lineHeight: .95 }, children: "Operational visibility without chaos." }), _jsx("p", { style: { maxWidth: 760, color: '#d1d5db', lineHeight: 1.8, fontSize: 18 }, children: "Founder cockpit voor realtime toezicht, lifecycle monitoring, airport operations, reconnect discipline en business/VIP controle." }), _jsx("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, marginTop: 36 }, children: metrics.map(([title, value]) => (_jsxs("article", { style: { border: '1px solid rgba(212,175,55,.22)', borderRadius: 24, padding: 22, background: 'linear-gradient(145deg, rgba(17,17,17,.96), rgba(31,25,9,.72))' }, children: [_jsx("p", { style: { color: '#a1a1aa', marginTop: 0 }, children: title }), _jsx("strong", { style: { color: gold, fontSize: 34 }, children: value })] }, title))) }), _jsxs("section", { style: { marginTop: 34, border: '1px solid rgba(255,255,255,.08)', borderRadius: 28, padding: 24, background: '#101010' }, children: [_jsx("h2", { style: { marginTop: 0 }, children: "Founder attention queue" }), [
                            '1 airport pickup approaching ETA threshold',
                            'All booking channels operational',
                            'No payment retry loops detected',
                            'Realtime websocket layer stable'
                        ].map((item) => (_jsx("div", { style: { padding: 16, borderRadius: 16, border: '1px solid rgba(255,255,255,.08)', marginTop: 12, background: 'rgba(255,255,255,.03)' }, children: item }, item)))] })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
const modules = [
    { title: 'Pricing Manager', items: ['Prijsregels', 'Vanaf-prijzen', 'Tarieflabels'] },
    { title: 'Routes Manager', items: ['Bestemmingen', 'Luchthavenroutes', 'Lokale routes'] },
    { title: 'Homepage Content', items: ['Hero titel', 'Hero subtitel', 'CTA labels'] },
    { title: 'VIP Settings', items: ['VIP voordelen', 'Ritbundels', 'Priority niveau'] },
    { title: 'Reviews Manager', items: ['Review entries', 'Sterren', 'Volgorde'] },
    { title: 'Operational Announcements', items: ['Homepage melding', 'Operationeel bericht'] },
    { title: 'Contact/Footer Settings', items: ['Telefoon', 'E-mail', 'BTW', 'Services'] }
];
export function App() {
    const [message, setMessage] = useState('');
    return _jsx("main", { className: "min-h-screen premium-bg p-4 text-white", children: _jsxs("div", { className: "mx-auto grid max-w-7xl gap-5 lg:grid-cols-[260px_1fr]", children: [_jsxs("aside", { className: "glass-panel rounded-3xl p-5", children: [_jsx("p", { className: "text-xs uppercase tracking-[.2em] text-lv-mist", children: "admin.lvtransport.be" }), _jsx("h1", { className: "mt-2 text-2xl font-semibold text-lv-champagne", children: "Control Tower" }), _jsx("p", { className: "mt-2 text-sm text-lv-mist", children: "Control Tower Editor" })] }), _jsxs("section", { className: "space-y-4", children: [_jsxs("div", { className: "glass-panel rounded-3xl p-5", children: [_jsx("h2", { className: "text-xl font-semibold", children: "Operationele editor" }), _jsx("p", { className: "mt-2 text-sm text-lv-mist", children: "Wijzig teksten en prijzen zonder code. Opslag werkt lokaal als backend niet beschikbaar is." }), message && _jsx("p", { className: "mt-2 text-sm text-lv-champagne", children: message })] }), _jsx("div", { className: "grid gap-4 md:grid-cols-2", children: modules.map((module) => _jsxs("article", { className: "glass-panel rounded-3xl p-5", children: [_jsx("h3", { className: "font-semibold text-lv-champagne", children: module.title }), _jsx("div", { className: "mt-3 space-y-2", children: module.items.map((item) => _jsxs("label", { className: "field-wrap", children: [_jsx("span", { children: item }), _jsx("input", { defaultValue: item })] }, item)) }), _jsx("button", { className: "mt-3 rounded-xl border border-lv-gold/40 px-4 py-2", onClick: () => setMessage(`${module.title} opgeslagen.`), children: "Opslaan" })] }, module.title)) })] })] }) });
}

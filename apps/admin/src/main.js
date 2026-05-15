import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { initPwa, registerServiceWorker } from './pwa';
import './styles/index.css';
const COCKPIT_ROUTES = new Set(['/', '/founder', '/control', '/cockpit', '/admin/founder']);
function FounderCockpitRoute() {
    const path = window.location.pathname.replace(/\/+$/, '') || '/';
    if (!COCKPIT_ROUTES.has(path)) {
        return _jsx("main", { className: "min-h-screen bg-lvtp-obsidian p-6 text-zinc-100", children: _jsxs("div", { className: "mx-auto max-w-3xl rounded-2xl border border-amber-400/20 bg-black/40 p-5", children: [_jsx("p", { className: "text-xs uppercase tracking-[0.2em] text-zinc-400", children: "Founder Operational Cockpit" }), _jsx("h1", { className: "mt-2 text-xl font-semibold text-amber-200", children: "Route not mapped" }), _jsxs("p", { className: "mt-3 text-sm text-zinc-300", children: ["Open one of the cockpit previews: ", _jsx("code", { children: "/founder" }), ", ", _jsx("code", { children: "/control" }), ", ", _jsx("code", { children: "/cockpit" }), ", or ", _jsx("code", { children: "/admin/founder" }), "."] })] }) });
    }
    return _jsx(App, {});
}
const pwa = initPwa();
window.__lvPwa = pwa;
registerServiceWorker().catch(() => undefined);
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(FounderCockpitRoute, {}) }));

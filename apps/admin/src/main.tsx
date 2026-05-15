import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { initPwa, registerServiceWorker } from './pwa';
import './styles/index.css';

const COCKPIT_ROUTES = new Set(['/','/founder','/founder/cockpit','/control','/control-tower','/cockpit','/operations','/admin/founder']);

function FounderCockpitRoute() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';

  if (!COCKPIT_ROUTES.has(path)) {
    return <main className="min-h-screen bg-lvtp-obsidian p-6 text-zinc-100">
      <div className="mx-auto max-w-3xl rounded-2xl border border-amber-400/20 bg-black/40 p-5">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-400">Founder Operational Cockpit</p>
        <h1 className="mt-2 text-xl font-semibold text-amber-200">Route not mapped</h1>
        <p className="mt-3 text-sm text-zinc-300">Open one of the cockpit routes: <code>/founder</code>, <code>/founder/cockpit</code>, <code>/control-tower</code>, <code>/operations</code>, <code>/control</code>, <code>/cockpit</code>, or <code>/admin/founder</code>.</p>
      </div>
    </main>;
  }

  return <App />;
}

const pwa = initPwa();
(window as any).__lvPwa = pwa;
registerServiceWorker().catch(() => undefined);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FounderCockpitRoute />
  </React.StrictMode>
);

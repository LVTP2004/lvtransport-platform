import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { initPwa, registerServiceWorker } from './pwa';
import './styles/index.css';

const pwa = initPwa();
(window as any).__lvPwa = pwa;
registerServiceWorker().catch(() => undefined);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

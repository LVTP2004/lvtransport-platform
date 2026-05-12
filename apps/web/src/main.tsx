import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { createInstallPromptState, registerServiceWorker } from './pwa';
import './styles/index.css';

createInstallPromptState();
registerServiceWorker().catch(() => undefined);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

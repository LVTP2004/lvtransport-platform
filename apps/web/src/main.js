import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import { createInstallPromptState, registerServiceWorker } from './pwa';
import './styles/index.css';
createInstallPromptState();
registerServiceWorker().catch(() => undefined);
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));

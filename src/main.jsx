import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

// Registra o service worker — atualiza automaticamente em background
registerSW({
  onNeedRefresh() {
    // Nova versão disponível — atualiza silenciosamente
  },
  onOfflineReady() {
    console.log('GestAnest está pronto para uso offline.');
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

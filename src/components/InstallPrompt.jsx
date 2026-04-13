import { useState, useEffect } from 'react';

/**
 * Shows an install banner:
 *  - On iOS/Safari: instructions to "Add to Home Screen"
 *  - On Chrome/Android: uses the native beforeinstallprompt event
 */
export default function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const ios =
      /iphone|ipad|ipod/i.test(navigator.userAgent) &&
      !window.matchMedia('(display-mode: standalone)').matches;

    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (standalone) return; // already installed

    const dismissed = sessionStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    if (ios) {
      setIsIOS(true);
      setShow(true);
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    sessionStorage.setItem('pwa_dismissed', '1');
    setShow(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferredPrompt(null);
  };

  if (!show) return null;

  return (
    <div className="install-banner">
      <div className="install-banner-icon">
        <svg width="28" height="28" viewBox="0 0 512 512" fill="none">
          <rect width="512" height="512" rx="112" fill="#2563eb" />
          <polyline
            points="64,256 160,256 192,160 224,352 272,192 304,296 336,256 448,256"
            fill="none"
            stroke="white"
            strokeWidth="56"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="install-banner-text">
        {isIOS ? (
          <>
            <strong>Instalar GestAnest</strong>
            <span>
              Toque em{' '}
              <svg
                style={{ display: 'inline', verticalAlign: 'middle' }}
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                <polyline points="16 6 12 2 8 6" />
                <line x1="12" y1="2" x2="12" y2="15" />
              </svg>{' '}
              e depois <b>"Adicionar à Tela de Início"</b>
            </span>
          </>
        ) : (
          <>
            <strong>Instalar GestAnest</strong>
            <span>Adicione à tela inicial para acesso rápido e offline</span>
          </>
        )}
      </div>
      {!isIOS && (
        <button className="install-btn" onClick={install}>
          Instalar
        </button>
      )}
      <button className="install-close" onClick={dismiss} title="Fechar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

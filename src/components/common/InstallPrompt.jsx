import { useState, useEffect } from 'react';
import styles from './InstallPrompt.module.css';

const DISMISSED_KEY = 'halfsec-install-dismissed';

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already dismissed or installed
    if (localStorage.getItem(DISMISSED_KEY)) return;
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowPrompt(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
    }
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShowPrompt(false);
  };

  if (!showPrompt || installed) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.icon}>
        <img src="/pwa-64x64.png" alt="Halfsec" width={36} height={36} />
      </div>
      <div className={styles.content}>
        <div className={styles.title}>Install Halfsec</div>
        <div className={styles.sub}>Add to your home screen for a faster experience</div>
      </div>
      <div className={styles.actions}>
        <button className="btn btn-primary btn-sm" onClick={handleInstall}>
          Install
        </button>
        <button className={styles.dismissBtn} onClick={handleDismiss}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default InstallPrompt;
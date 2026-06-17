import { useState, useEffect } from 'react';
import usePushNotifications from '../../hooks/usePushNotifications';
import useAuth from '../../hooks/useAuth';
import styles from './PushPermissionPrompt.module.css';

const DISMISSED_KEY = 'halfsec-push-dismissed';

const PushPermissionPrompt = () => {
  const { isAuthenticated } = useAuth();
  const { isSupported, isSubscribed, permission, loading, subscribe } = usePushNotifications();
  const [dismissed, setDismissed] = useState(true);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem(DISMISSED_KEY);
    setDismissed(!!wasDismissed);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setDismissed(true);
  };

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      setSubscribeSuccess(true);
      setTimeout(() => setDismissed(true), 2500);
    }
  };

  if (
    !isSupported ||
    !isAuthenticated ||
    isSubscribed ||
    dismissed ||
    permission === 'denied'
  ) {
    return null;
  }

  return (
    <div className={styles.prompt}>
      <div className={styles.icon}>🔔</div>
      <div className={styles.content}>
        {subscribeSuccess ? (
          <p className={styles.success}>Push notifications enabled! ✓</p>
        ) : (
          <>
            <p className={styles.title}>Stay in the loop</p>
            <p className={styles.sub}>
              Get notified about your orders, payouts and disputes — even when the app is closed.
            </p>
          </>
        )}
      </div>
      {!subscribeSuccess && (
        <div className={styles.actions}>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading ? <><span className="spinner" style={{ width: 12, height: 12 }} />Enabling...</> : 'Enable'}
          </button>
          <button
            className={styles.dismissBtn}
            onClick={handleDismiss}
          >
            Not now
          </button>
        </div>
      )}
    </div>
  );
};

export default PushPermissionPrompt;
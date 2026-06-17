import { useState, useEffect, useCallback } from 'react';
import { saveSubscription, removeSubscription } from '../api/push';
import useAuth from './useAuth';

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

const usePushNotifications = () => {
  const { isAuthenticated } = useAuth();
  const [permission, setPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window;
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    if (!isSupported || !isAuthenticated) return;

    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch {}
    };

    checkSubscription();
  }, [isSupported, isAuthenticated]);

  const subscribe = useCallback(async () => {
    if (!isSupported || !isAuthenticated) return false;

    const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      console.error('[push] VITE_VAPID_PUBLIC_KEY is not set.');
      return false;
    }

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;

      const applicationServerKey = urlBase64ToUint8Array(publicKey);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      await saveSubscription(subscription, navigator.userAgent);
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error('[push] Subscribe error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [isSupported, isAuthenticated]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription(subscription.endpoint);
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
    } catch (error) {
      console.error('[push] Unsubscribe error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  return { isSupported, isSubscribed, permission, loading, subscribe, unsubscribe };
};

export default usePushNotifications;
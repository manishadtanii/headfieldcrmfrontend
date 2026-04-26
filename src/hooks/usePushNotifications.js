import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import api from '../api/axios';

// ─────────────────────────────────────────────────────────────────────────────
// usePushNotifications — Reminder Module Hook
// Handles: Service worker registration, push subscription, token save/delete
// ─────────────────────────────────────────────────────────────────────────────

// Convert base64 VAPID key to Uint8Array for browser subscription
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

export const usePushNotifications = (slug) => {
  const [permission,    setPermission]    = useState(Notification.permission);
  const [subscribed,    setSubscribed]    = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [swReady,       setSwReady]       = useState(false);

  // Check if push is supported
  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  // Register service worker on mount
  useEffect(() => {
    if (!isSupported) return;
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Registered:', reg.scope);
        setSwReady(true);
        // Check if already subscribed
        return reg.pushManager.getSubscription();
      })
      .then((sub) => {
        if (sub) setSubscribed(true);
      })
      .catch((err) => console.warn('[SW] Registration failed:', err));
  }, [isSupported]);

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported || !swReady) {
      toast.error('Push notifications not supported on this browser.');
      return;
    }

    setLoading(true);
    try {
      // Request permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== 'granted') {
        toast.error('Please allow notifications to receive reminders.');
        return;
      }

      // Get VAPID public key from backend
      const { data } = await api.get(`/b/${slug}/reminders/vapid-key`);
      const vapidKey = data?.data?.vapidPublicKey;
      if (!vapidKey) throw new Error('VAPID key not available');

      // Subscribe
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      // Save token to backend
      const subJson = sub.toJSON();
      await api.post(`/b/${slug}/reminders/push-token`, {
        endpoint:  subJson.endpoint,
        keys:      subJson.keys,
        userAgent: navigator.userAgent,
      });

      setSubscribed(true);
      toast.success('🔔 Notifications enabled! You\'ll get reminders on this device.');
    } catch (err) {
      console.error('[Push] Subscribe error:', err);
      toast.error('Failed to enable notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isSupported, swReady, slug]);

  // Unsubscribe
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await api.delete(`/b/${slug}/reminders/push-token`, {
          data: { endpoint: sub.endpoint },
        });
        await sub.unsubscribe();
      }
      setSubscribed(false);
      toast.success('Notifications disabled.');
    } catch (err) {
      toast.error('Failed to disable notifications.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  return { permission, subscribed, loading, isSupported, subscribe, unsubscribe };
};

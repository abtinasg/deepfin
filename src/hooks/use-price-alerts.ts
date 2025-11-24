'use client';

import { useState, useEffect, useCallback } from 'react';
import { PriceAlert } from '@/types/market-data';
import { useMarketStore, selectStock } from '@/stores/market-store';

interface UsePriceAlertsOptions {
  onAlert?: (alert: PriceAlert) => void;
  playSound?: boolean;
}

/**
 * Hook for managing price alerts
 */
export function usePriceAlerts(options: UsePriceAlertsOptions = {}) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [triggeredAlerts, setTriggeredAlerts] = useState<PriceAlert[]>([]);

  /**
   * Add a new price alert
   */
  const addAlert = useCallback((
    symbol: string,
    targetPrice: number,
    condition: 'above' | 'below'
  ) => {
    const newAlert: PriceAlert = {
      id: `${symbol}-${targetPrice}-${condition}-${Date.now()}`,
      symbol: symbol.toUpperCase(),
      targetPrice,
      condition,
      triggered: false,
      createdAt: Date.now(),
    };

    setAlerts((prev) => [...prev, newAlert]);
    
    // Save to localStorage
    saveAlertsToStorage([...alerts, newAlert]);

    return newAlert.id;
  }, [alerts]);

  /**
   * Remove a price alert
   */
  const removeAlert = useCallback((alertId: string) => {
    setAlerts((prev) => {
      const updated = prev.filter((alert) => alert.id !== alertId);
      saveAlertsToStorage(updated);
      return updated;
    });
  }, []);

  /**
   * Clear all alerts
   */
  const clearAlerts = useCallback(() => {
    setAlerts([]);
    saveAlertsToStorage([]);
  }, []);

  /**
   * Clear triggered alerts
   */
  const clearTriggeredAlerts = useCallback(() => {
    setTriggeredAlerts([]);
  }, []);

  /**
   * Check if price alert should trigger
   */
  const checkAlert = useCallback((alert: PriceAlert, currentPrice: number): boolean => {
    if (alert.triggered) return false;

    if (alert.condition === 'above' && currentPrice >= alert.targetPrice) {
      return true;
    }

    if (alert.condition === 'below' && currentPrice <= alert.targetPrice) {
      return true;
    }

    return false;
  }, []);

  /**
   * Monitor prices and trigger alerts
   */
  useEffect(() => {
    if (alerts.length === 0) return;

    const interval = setInterval(() => {
      const store = useMarketStore.getState();

      alerts.forEach((alert) => {
        if (alert.triggered) return;

        const stock = store.stocks[alert.symbol];
        if (!stock) return;

        if (checkAlert(alert, stock.price)) {
          // Mark alert as triggered
          const triggeredAlert = { ...alert, triggered: true };

          setAlerts((prev) =>
            prev.map((a) => (a.id === alert.id ? triggeredAlert : a))
          );

          setTriggeredAlerts((prev) => [...prev, triggeredAlert]);

          // Call callback
          if (options.onAlert) {
            options.onAlert(triggeredAlert);
          }

          // Play sound
          if (options.playSound) {
            playAlertSound();
          }

          // Show notification
          showNotification(triggeredAlert);

          // Update storage
          saveAlertsToStorage(
            alerts.map((a) => (a.id === alert.id ? triggeredAlert : a))
          );
        }
      });
    }, 1000); // Check every second

    return () => clearInterval(interval);
  }, [alerts, checkAlert, options]);

  /**
   * Load alerts from localStorage on mount
   */
  useEffect(() => {
    const saved = loadAlertsFromStorage();
    if (saved.length > 0) {
      setAlerts(saved);
    }
  }, []);

  return {
    alerts,
    triggeredAlerts,
    addAlert,
    removeAlert,
    clearAlerts,
    clearTriggeredAlerts,
  };
}

/**
 * Save alerts to localStorage
 */
function saveAlertsToStorage(alerts: PriceAlert[]): void {
  try {
    localStorage.setItem('priceAlerts', JSON.stringify(alerts));
  } catch (error) {
    console.error('Failed to save alerts:', error);
  }
}

/**
 * Load alerts from localStorage
 */
function loadAlertsFromStorage(): PriceAlert[] {
  try {
    const saved = localStorage.getItem('priceAlerts');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load alerts:', error);
    return [];
  }
}

/**
 * Show browser notification
 */
function showNotification(alert: PriceAlert): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Price Alert Triggered', {
      body: `${alert.symbol} is ${alert.condition} $${alert.targetPrice.toFixed(2)}`,
      icon: '/icon.png',
      tag: alert.id,
    });
  }
}

/**
 * Play alert sound
 */
function playAlertSound(): void {
  try {
    const audio = new Audio('/sounds/alert.mp3');
    audio.play().catch((error) => {
      console.error('Failed to play alert sound:', error);
    });
  } catch (error) {
    console.error('Failed to create audio:', error);
  }
}

/**
 * Request notification permission
 */
export function requestNotificationPermission(): Promise<NotificationPermission> {
  if ('Notification' in window) {
    return Notification.requestPermission();
  }
  return Promise.resolve('denied' as NotificationPermission);
}

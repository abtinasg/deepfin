'use client';

import { useState, useEffect, useCallback } from 'react';
import { NewsNotification } from '@/types/market-data';
import { useMarketStore } from '@/stores/market-store';

interface UseMarketNotificationsOptions {
  symbols?: string[];
  onNotification?: (notification: NewsNotification) => void;
  maxNotifications?: number;
}

/**
 * Hook for managing market news notifications
 */
export function useMarketNotifications(options: UseMarketNotificationsOptions = {}) {
  const [notifications, setNotifications] = useState<NewsNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const maxNotifications = options.maxNotifications || 50;

  /**
   * Add a new notification
   */
  const addNotification = useCallback(
    (notification: Omit<NewsNotification, 'id'>) => {
      const newNotification: NewsNotification = {
        ...notification,
        id: `${notification.timestamp}-${Math.random()}`,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev].slice(0, maxNotifications);
        saveNotificationsToStorage(updated);
        return updated;
      });

      setUnreadCount((prev) => prev + 1);

      // Call callback
      if (options.onNotification) {
        options.onNotification(newNotification);
      }

      // Show browser notification
      showBrowserNotification(newNotification);

      return newNotification.id;
    },
    [options, maxNotifications]
  );

  /**
   * Mark notification as read
   */
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  /**
   * Mark all as read
   */
  const markAllAsRead = useCallback(() => {
    setUnreadCount(0);
  }, []);

  /**
   * Remove a notification
   */
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== notificationId);
      saveNotificationsToStorage(updated);
      return updated;
    });
  }, []);

  /**
   * Clear all notifications
   */
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    saveNotificationsToStorage([]);
  }, []);

  /**
   * Filter notifications by symbol
   */
  const getNotificationsBySymbol = useCallback(
    (symbol: string) => {
      return notifications.filter((n) => n.symbols.includes(symbol.toUpperCase()));
    },
    [notifications]
  );

  /**
   * Load notifications from localStorage on mount
   */
  useEffect(() => {
    const saved = loadNotificationsFromStorage();
    if (saved.length > 0) {
      setNotifications(saved);
    }
  }, []);

  /**
   * Poll for news updates (if symbols provided)
   */
  useEffect(() => {
    if (!options.symbols || options.symbols.length === 0) return;

    const fetchNews = async () => {
      try {
        // Fetch news from API
        const symbols = options.symbols!.join(',');
        const response = await fetch(`/api/market/news?symbols=${symbols}`);
        
        if (!response.ok) return;

        const news = await response.json();

        // Check for new news items
        news.forEach((item: any) => {
          const exists = notifications.some(
            (n) => n.headline === item.headline && n.timestamp === item.datetime
          );

          if (!exists) {
            addNotification({
              headline: item.headline,
              summary: item.summary || item.headline,
              source: item.source,
              url: item.url,
              symbols: item.related ? item.related.split(',') : options.symbols!,
              timestamp: item.datetime * 1000,
              sentiment: item.sentiment || 'neutral',
            });
          }
        });
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    // Initial fetch
    fetchNews();

    // Poll every 5 minutes
    const interval = setInterval(fetchNews, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [options.symbols?.join(','), addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsBySymbol,
  };
}

/**
 * Hook for tracking volume changes
 */
export function useVolumeTracking(symbol: string, threshold: number = 1.5) {
  const [volumeSpike, setVolumeSpike] = useState(false);
  const [averageVolume, setAverageVolume] = useState<number>(0);

  const stock = useMarketStore((state) => state.stocks[symbol.toUpperCase()]);

  useEffect(() => {
    if (!stock || !stock.volume || !stock.avgVolume) return;

    const ratio = stock.volume / stock.avgVolume;

    if (ratio >= threshold && !volumeSpike) {
      setVolumeSpike(true);
      
      // Notify about volume spike
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Volume Spike Alert', {
          body: `${symbol} volume is ${ratio.toFixed(1)}x average`,
          icon: '/icon.png',
        });
      }
    } else if (ratio < threshold && volumeSpike) {
      setVolumeSpike(false);
    }

    setAverageVolume(stock.avgVolume);
  }, [stock, symbol, threshold, volumeSpike]);

  return {
    volumeSpike,
    currentVolume: stock?.volume || 0,
    averageVolume,
    volumeRatio: stock && stock.avgVolume ? stock.volume / stock.avgVolume : 0,
  };
}

/**
 * Save notifications to localStorage
 */
function saveNotificationsToStorage(notifications: NewsNotification[]): void {
  try {
    localStorage.setItem('marketNotifications', JSON.stringify(notifications));
  } catch (error) {
    console.error('Failed to save notifications:', error);
  }
}

/**
 * Load notifications from localStorage
 */
function loadNotificationsFromStorage(): NewsNotification[] {
  try {
    const saved = localStorage.getItem('marketNotifications');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load notifications:', error);
    return [];
  }
}

/**
 * Show browser notification
 */
function showBrowserNotification(notification: NewsNotification): void {
  if ('Notification' in window && Notification.permission === 'granted') {
    const sentimentEmoji = {
      positive: '📈',
      negative: '📉',
      neutral: '📰',
    };

    new Notification(
      `${sentimentEmoji[notification.sentiment || 'neutral']} ${notification.headline}`,
      {
        body: notification.summary,
        icon: '/icon.png',
        tag: notification.id,
        data: { url: notification.url },
      }
    );
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

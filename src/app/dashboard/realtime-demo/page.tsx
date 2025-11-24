'use client';

import React, { useState, useEffect } from 'react';
import { useMarketData } from '@/hooks/use-market-data';
import { usePriceAlerts, requestNotificationPermission } from '@/hooks/use-price-alerts';
import { useMarketNotifications, useVolumeTracking } from '@/hooks/use-market-notifications';
import { ConnectionStatusIndicator } from '@/components/shared/connection-status';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, TrendingUp, Volume2, AlertCircle, CheckCircle2 } from 'lucide-react';

const WATCHLIST_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'TSLA', 'META'];

export default function MarketDashboardExample() {
  const [alertSymbol, setAlertSymbol] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');

  // Real-time market data
  const { data: stocks, isLoading, connectionStatus } = useMarketData(WATCHLIST_SYMBOLS);

  // Price alerts
  const {
    alerts,
    triggeredAlerts,
    addAlert,
    removeAlert,
    clearTriggeredAlerts,
  } = usePriceAlerts({
    onAlert: (alert) => {
      console.log('Alert triggered:', alert);
    },
    playSound: true,
  });

  // Market notifications
  const {
    notifications,
    unreadCount,
    markAllAsRead,
    clearAll: clearNotifications,
  } = useMarketNotifications({
    symbols: WATCHLIST_SYMBOLS,
    maxNotifications: 20,
  });

  // Volume tracking for first symbol
  const { volumeSpike, volumeRatio } = useVolumeTracking(
    WATCHLIST_SYMBOLS[0],
    1.5
  );

  // Request notification permission on mount
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const handleAddAlert = () => {
    if (alertSymbol && alertPrice) {
      addAlert(alertSymbol.toUpperCase(), parseFloat(alertPrice), alertCondition);
      setAlertSymbol('');
      setAlertPrice('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Real-Time Market Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Live market data with WebSocket updates
            </p>
          </div>
          <ConnectionStatusIndicator status={connectionStatus} />
        </div>

        {/* Notifications Bar */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-900">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={markAllAsRead}>
                Mark All Read
              </Button>
              <Button variant="outline" size="sm" onClick={clearNotifications}>
                Clear All
              </Button>
            </div>
          </div>
          {notifications.length > 0 && (
            <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
              {notifications.slice(0, 5).map((notification) => (
                <div
                  key={notification.id}
                  className="p-2 bg-gray-50 rounded text-sm"
                >
                  <div className="font-medium">{notification.headline}</div>
                  <div className="text-gray-600 text-xs mt-1">
                    {notification.symbols.join(', ')} •{' '}
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Price Alerts */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <span className="font-medium text-gray-900">Price Alerts</span>
            <span className="text-sm text-gray-500">
              ({alerts.length} active)
            </span>
          </div>

          {/* Add Alert Form */}
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Symbol (e.g., AAPL)"
              value={alertSymbol}
              onChange={(e) => setAlertSymbol(e.target.value)}
              className="flex-1"
            />
            <Input
              type="number"
              placeholder="Price"
              value={alertPrice}
              onChange={(e) => setAlertPrice(e.target.value)}
              className="w-32"
            />
            <select
              value={alertCondition}
              onChange={(e) => setAlertCondition(e.target.value as 'above' | 'below')}
              className="px-3 py-2 border rounded"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <Button onClick={handleAddAlert}>Add Alert</Button>
          </div>

          {/* Active Alerts */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-center justify-between p-2 rounded ${
                    alert.triggered ? 'bg-green-50' : 'bg-gray-50'
                  }`}
                >
                  <span className="text-sm">
                    <span className="font-medium">{alert.symbol}</span> {alert.condition}{' '}
                    ${alert.targetPrice.toFixed(2)}
                    {alert.triggered && (
                      <span className="ml-2 inline-flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                        Triggered
                      </span>
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeAlert(alert.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}

          {triggeredAlerts.length > 0 && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearTriggeredAlerts}>
                Clear Triggered Alerts
              </Button>
            </div>
          )}
        </Card>

        {/* Volume Spike Indicator */}
        {volumeSpike && (
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-2">
              <Volume2 className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">
                Volume Spike Detected for {WATCHLIST_SYMBOLS[0]}
              </span>
              <span className="text-sm text-yellow-700">
                ({volumeRatio.toFixed(1)}x average)
              </span>
            </div>
          </Card>
        )}

        {/* Stock Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(6)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="h-24 bg-gray-200 rounded"></div>
                </Card>
              ))
          ) : (
            stocks.map((stock) => {
              const isPositive = stock.change >= 0;
              return (
                <Card key={stock.symbol} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="font-bold text-lg">{stock.symbol}</div>
                      <div className="text-sm text-gray-500">{stock.name}</div>
                    </div>
                    <TrendingUp
                      className={`h-6 w-6 ${
                        isPositive ? 'text-green-500' : 'text-red-500 rotate-180'
                      }`}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-3xl font-bold font-mono">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div
                      className={`text-lg font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%)
                    </div>
                    {stock.volume > 0 && (
                      <div className="text-sm text-gray-500">
                        Volume: {(stock.volume / 1000000).toFixed(2)}M
                      </div>
                    )}
                    <div className="text-xs text-gray-400">
                      Last update: {new Date(stock.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

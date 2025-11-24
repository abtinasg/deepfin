# Real-Time Market Data System

A comprehensive WebSocket-based real-time market data system with fallback mechanisms, caching, and performance optimizations.

## 🚀 Features

### 1. WebSocket Connection Manager
- **Auto-reconnect** with exponential backoff
- **Heartbeat ping/pong** to maintain connection health
- **Message queue** for offline mode (stores up to 100 messages)
- **Connection status indicator** component

### 2. Data Providers
- **Primary**: Finnhub WebSocket (real-time trades)
- **Fallback**: Alpha Vantage REST API (polling)
- **Automatic failover** when primary provider disconnects
- **Unified interface** for easy provider switching

### 3. State Management (Zustand)
- **Optimistic updates** with rollback capability
- **Batch operations** for efficient bulk updates
- **Historical data caching** (last 100 data points per symbol)
- **Selective re-renders** with optimized selectors

### 4. Caching Layer
- **Memory cache** for instant access
- **Redis/Upstash** for distributed caching
- **TTL management** (60s default)
- **Cache invalidation** strategies

### 5. Real-Time Features
- **Live price updates** (throttled to 1/sec)
- **Volume spike tracking** with configurable thresholds
- **Price alerts** with browser notifications
- **News notifications** with sentiment analysis
- **Connection status** monitoring

### 6. Performance Optimizations
- **React.memo** for component memoization
- **Throttled updates** using RAF (Request Animation Frame)
- **Batch WebSocket messages** for efficiency
- **Virtual scrolling ready** architecture
- **Message deduplication**

## 📁 File Structure

```
src/
├── lib/market-data/
│   ├── websocket-manager.ts          # Core WebSocket manager
│   ├── cache-service.ts              # Redis + memory caching
│   ├── performance-utils.ts          # Throttle, debounce, batch utils
│   └── providers/
│       ├── base-provider.ts          # Abstract provider interface
│       ├── finnhub-provider.ts       # Finnhub WebSocket
│       ├── alphavantage-provider.ts  # Alpha Vantage REST
│       └── index.ts                  # Provider manager with failover
│
├── stores/
│   └── market-store.ts               # Zustand store for market data
│
├── hooks/
│   ├── use-market-data.ts            # Real-time market data hook
│   ├── use-price-alerts.ts           # Price alerts management
│   └── use-market-notifications.ts   # News & notifications
│
├── components/
│   ├── markets/
│   │   ├── index-card.tsx            # Market index card (memoized)
│   │   ├── market-movers-table.tsx   # Top movers table (memoized)
│   │   └── real-time-components.tsx  # Real-time wrapper components
│   └── shared/
│       └── connection-status.tsx     # Connection indicator
│
└── types/
    └── market-data.ts                # TypeScript definitions
```

## 🔧 Setup

### 1. Install Dependencies

```bash
npm install zustand @upstash/redis lucide-react
```

### 2. Environment Variables

Add to `.env`:

```env
# Finnhub (Primary - WebSocket)
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key

# Alpha Vantage (Fallback - REST)
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alphavantage_key

# Upstash Redis (Optional but recommended)
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

### 3. Get API Keys

- **Finnhub**: https://finnhub.io/register (Free tier: 60 calls/min)
- **Alpha Vantage**: https://www.alphavantage.co/support/#api-key (Free tier: 5 calls/min)

## 💻 Usage

### Basic Real-Time Data Hook

```typescript
import { useMarketData } from '@/hooks/use-market-data';

function StockWidget() {
  const { data, isLoading, connectionStatus } = useMarketData(['AAPL', 'MSFT']);
  
  return (
    <div>
      {data.map(stock => (
        <div key={stock.symbol}>
          {stock.symbol}: ${stock.price}
        </div>
      ))}
    </div>
  );
}
```

### Price Alerts

```typescript
import { usePriceAlerts } from '@/hooks/use-price-alerts';

function AlertsManager() {
  const { alerts, addAlert, removeAlert } = usePriceAlerts({
    onAlert: (alert) => console.log('Alert triggered!', alert),
    playSound: true
  });
  
  const handleAddAlert = () => {
    addAlert('AAPL', 150.00, 'above');
  };
  
  return (
    <div>
      <button onClick={handleAddAlert}>Add Alert</button>
      {alerts.map(alert => (
        <div key={alert.id}>
          {alert.symbol} {alert.condition} ${alert.targetPrice}
        </div>
      ))}
    </div>
  );
}
```

### Volume Tracking

```typescript
import { useVolumeTracking } from '@/hooks/use-market-notifications';

function VolumeIndicator({ symbol }: { symbol: string }) {
  const { volumeSpike, volumeRatio, currentVolume } = useVolumeTracking(
    symbol,
    1.5 // 1.5x threshold
  );
  
  return volumeSpike ? (
    <div className="alert">
      Volume spike detected! ({volumeRatio.toFixed(1)}x average)
    </div>
  ) : null;
}
```

### Direct Store Access

```typescript
import { useMarketStore, selectStock } from '@/stores/market-store';

function StockPrice({ symbol }: { symbol: string }) {
  const stock = useMarketStore(selectStock(symbol));
  const updateStock = useMarketStore(state => state.updateStock);
  
  // Optimistic update
  const handleUpdate = () => {
    updateStock(symbol, { price: 150.00 });
  };
  
  return <div>${stock?.price}</div>;
}
```

## 🎯 Performance Best Practices

### 1. Throttled Updates

```typescript
// Updates are automatically throttled to 1/sec in useMarketData
const { data } = useMarketData(['AAPL']); // Max 1 update/sec per symbol
```

### 2. Batch Operations

```typescript
const batchUpdate = useMarketStore(state => state.batchUpdateStocks);

// Update multiple stocks at once
batchUpdate({
  'AAPL': { price: 150.00 },
  'MSFT': { price: 280.00 },
  'GOOGL': { price: 130.00 }
});
```

### 3. Memoized Components

```typescript
import { memo } from 'react';

export const StockCard = memo(function StockCard({ stock }) {
  return <div>{stock.symbol}: ${stock.price}</div>;
});
```

### 4. Selective Subscriptions

```typescript
// Only subscribe to symbols you need
const { data } = useMarketData(['AAPL']); // Not entire market

// Unsubscribe automatically on unmount
useEffect(() => {
  return () => {
    // Cleanup handled automatically
  };
}, []);
```

## 🔄 Connection Lifecycle

```
1. Connect() → WebSocket to Finnhub
2. On Open → Resubscribe to all symbols
3. Start Heartbeat → Ping every 30s
4. On Message → Process & update store
5. On Close → Schedule reconnect with backoff
6. Max Attempts? → Switch to Alpha Vantage fallback
```

## 📊 Message Queue

When offline, messages are queued:

```typescript
{
  id: 'unique-id',
  type: 'subscribe',
  payload: { symbol: 'AAPL' },
  timestamp: 1234567890,
  retries: 0
}
```

Queue size: 100 messages (FIFO)

## 🧪 Testing

```typescript
// Mock provider for tests
import { getProviderManager, resetProviderManager } from '@/lib/market-data/providers';

afterEach(() => {
  resetProviderManager(); // Clean up
});

test('connects to provider', async () => {
  const manager = getProviderManager();
  await manager.connect();
  expect(manager.isConnected()).toBe(true);
});
```

## 🚨 Error Handling

### Automatic Retry Logic

```typescript
// Exponential backoff: 5s, 10s, 20s, 40s, 60s (max)
reconnectDelay = Math.min(5000 * Math.pow(2, attempts - 1), 60000);
```

### Fallback Activation

```typescript
// Primary fails → Switch to fallback
if (reconnectAttempts >= maxAttempts) {
  await failover(); // Switch to Alpha Vantage
}
```

## 📱 Browser Notifications

Request permission:

```typescript
import { requestNotificationPermission } from '@/hooks/use-price-alerts';

await requestNotificationPermission();
```

## 🎨 Example Implementation

See `/app/dashboard/realtime-demo/page.tsx` for a complete working example with:
- Real-time price updates
- Price alerts
- Volume tracking
- News notifications
- Connection status

## 🔒 Security Notes

- API keys are exposed client-side via `NEXT_PUBLIC_*` variables
- Consider rate limiting on your API routes
- Use server-side proxies for production
- Implement authentication for WebSocket connections

## 📈 Scalability

Current limits:
- **Finnhub Free**: 60 WebSocket messages/min
- **Alpha Vantage Free**: 5 API calls/min
- **Memory Cache**: No limit (per session)
- **Redis Cache**: Based on Upstash plan

For production:
- Upgrade to paid API tiers
- Implement server-side WebSocket proxy
- Use Redis for cross-instance state
- Add CDN for static data

## 🐛 Troubleshooting

### WebSocket not connecting?
- Check API key in `.env`
- Verify `NEXT_PUBLIC_` prefix
- Check browser console for errors

### Updates not showing?
- Ensure component is memoized
- Check throttle settings
- Verify symbol is subscribed

### Cache not working?
- Verify Redis credentials
- Check TTL settings
- Memory cache works without Redis

## 📚 API Reference

See inline documentation in:
- `lib/market-data/websocket-manager.ts`
- `stores/market-store.ts`
- `hooks/use-market-data.ts`

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add JSDoc comments
3. Write tests for new features
4. Update this README

## 📄 License

MIT

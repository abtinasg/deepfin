# Professional Charting Module Documentation

## Overview
A complete, professional-grade charting solution built with TradingView Lightweight Charts, featuring 20+ technical indicators, drawing tools, and real-time data updates.

## Features Implemented

### ✅ Chart Types (5)
- **Candlestick** - Traditional OHLC candlestick charts
- **Line** - Simple line chart showing close prices
- **Area** - Filled area chart with gradient
- **OHLC Bars** - Open-High-Low-Close bar chart
- **Heikin Ashi** - Smoothed candlestick representation

### ✅ Timeframes (14)
- **Intraday**: 1m, 5m, 15m, 30m, 1h, 4h
- **Daily/Weekly/Monthly**: 1D, 1W, 1M
- **Long-term**: 3M, 6M, 1Y, 5Y, All

### ✅ Technical Indicators (15+)

#### Moving Averages
- **SMA** (Simple Moving Average)
- **EMA** (Exponential Moving Average)
- **WMA** (Weighted Moving Average)

#### Momentum Indicators
- **RSI** (Relative Strength Index)
- **MACD** (Moving Average Convergence Divergence)
- **Stochastic Oscillator**
- **CCI** (Commodity Channel Index)

#### Volatility Indicators
- **Bollinger Bands**
- **ATR** (Average True Range)
- **Keltner Channels**

#### Volume Indicators
- **OBV** (On-Balance Volume)
- **VWAP** (Volume Weighted Average Price)

#### Trend Indicators
- **ADX** (Average Directional Index)
- **Parabolic SAR**
- **Ichimoku Cloud**

### ✅ Drawing Tools (8)
- Horizontal Line
- Vertical Line
- Trend Line
- Fibonacci Retracement
- Fibonacci Extension
- Rectangle
- Triangle
- Text Annotations

### ✅ Additional Features
- Volume histogram overlay
- Save/Load chart layouts
- Export chart as image
- Real-time price updates
- Comparison mode (multi-stock overlay)
- Chart presets (Day Trading, Swing Trading, Long-term)
- Responsive design
- Dark/Light theme support

---

## Architecture

### Core Components

#### 1. ChartManager (`src/lib/chart-manager.ts`)
Main class that manages chart lifecycle and rendering.

```typescript
import { ChartManager } from '@/lib/chart-manager';

const chartManager = new ChartManager();
chartManager.initialize(containerElement, volumeContainerElement);
chartManager.loadData(ohlcvData, 'candlestick');
chartManager.addIndicator({
  id: 'sma-20',
  type: 'SMA',
  params: { period: 20, source: 'close' },
  visible: true,
  color: '#2196F3'
});
```

#### 2. Technical Indicators (`src/lib/indicators.ts`)
Pure functions for calculating technical indicators.

```typescript
import { calculateSMA, calculateRSI, calculateMACD } from '@/lib/indicators';

const sma = calculateSMA(data, 20, 'close');
const rsi = calculateRSI(data, 14);
const { macdLine, signalLine, histogram } = calculateMACD(data, 12, 26, 9);
```

#### 3. Drawing Tools (`src/lib/drawing-tools.ts`)
Interactive drawing tools manager.

```typescript
import { DrawingToolsManager } from '@/lib/drawing-tools';

const drawingTools = new DrawingToolsManager(chart);
drawingTools.setTool('trend-line');
drawingTools.handleClick(time, price);
```

#### 4. React Component (`src/components/charts/professional-trading-chart.tsx`)
Main React component with UI controls.

```tsx
<ProfessionalTradingChart
  ticker="AAPL"
  name="Apple Inc."
  initialData={chartData}
  onTimeframeChange={(timeframe) => console.log(timeframe)}
  onSaveLayout={() => saveLayout()}
/>
```

---

## API Endpoints

### 1. Get Chart Data
```
GET /api/chart/data?ticker=AAPL&timeframe=1D
```

**Response:**
```json
{
  "ticker": "AAPL",
  "timeframe": "1D",
  "data": [
    {
      "time": 1700000000,
      "open": 178.50,
      "high": 180.25,
      "low": 177.80,
      "close": 179.40,
      "volume": 52300000
    }
  ],
  "timestamp": 1700123456789
}
```

### 2. Save Chart Layout
```
POST /api/chart/layouts
Content-Type: application/json

{
  "name": "My Day Trading Setup",
  "config": {
    "ticker": "AAPL",
    "timeframe": "5m",
    "chartType": "candlestick",
    "indicators": [...],
    "drawings": [...],
    "comparisons": [],
    "showVolume": true,
    "showGrid": true
  }
}
```

### 3. Get Saved Layouts
```
GET /api/chart/layouts
```

### 4. Get Specific Layout
```
GET /api/chart/layouts/[id]
```

### 5. Update Layout
```
PATCH /api/chart/layouts/[id]
```

### 6. Delete Layout
```
DELETE /api/chart/layouts/[id]
```

---

## Usage Examples

### Basic Setup

```tsx
import { useState, useEffect } from 'react';
import { ProfessionalTradingChart } from '@/components/charts/professional-trading-chart';
import { OHLCVData } from '@/types/chart';

export default function MyChartPage() {
  const [data, setData] = useState<OHLCVData[]>([]);

  useEffect(() => {
    fetch('/api/chart/data?ticker=AAPL&timeframe=1D')
      .then(res => res.json())
      .then(result => setData(result.data));
  }, []);

  return (
    <div className="h-screen">
      <ProfessionalTradingChart
        ticker="AAPL"
        name="Apple Inc."
        initialData={data}
      />
    </div>
  );
}
```

### Adding Custom Indicators

```typescript
const chartManager = new ChartManager();

// Add multiple indicators
chartManager.addIndicator({
  id: 'ema-9',
  type: 'EMA',
  params: { period: 9, source: 'close' },
  visible: true,
  color: '#2196F3'
});

chartManager.addIndicator({
  id: 'ema-21',
  type: 'EMA',
  params: { period: 21, source: 'close' },
  visible: true,
  color: '#FF9800'
});

chartManager.addIndicator({
  id: 'bb',
  type: 'BollingerBands',
  params: { period: 20, stdDev: 2, source: 'close' },
  visible: true,
  color: '#4CAF50'
});
```

### Drawing Tools

```typescript
const drawingTools = new DrawingToolsManager(chart);

// Enable trend line drawing
drawingTools.setTool('trend-line');

// User clicks will now create trend lines
// Click 1: Start point
// Click 2: End point (automatically completes)

// Add Fibonacci retracement
drawingTools.setTool('fibonacci-retracement');
// Requires 2 clicks: start and end points
```

### Comparison Mode

```typescript
// Add comparison stock
chartManager.addComparison('MSFT', msftData, '#FF9800');
chartManager.addComparison('GOOGL', googlData, '#4CAF50');

// Charts are normalized to percentage change from first price
// All stocks start at 0% and show relative performance
```

---

## Chart Presets

### Day Trading Preset
- Timeframe: 5m
- Chart Type: Candlestick
- Indicators:
  - EMA(9) - Blue
  - EMA(21) - Orange
  - RSI(14)
- Volume: Enabled

### Swing Trading Preset
- Timeframe: 1D
- Chart Type: Candlestick
- Indicators:
  - SMA(50) - Green
  - SMA(200) - Red
  - MACD(12, 26, 9)
  - Bollinger Bands(20, 2)
- Volume: Enabled

### Long-term Investment Preset
- Timeframe: 1W
- Chart Type: Line
- Indicators:
  - SMA(20) - Purple
  - SMA(50) - Green
- Volume: Enabled

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `←` `→` | Pan chart left/right |
| `+` `-` | Zoom in/out |
| `Space` | Reset zoom to fit all data |
| `Esc` | Cancel current drawing |
| `Delete` | Remove selected drawing |

---

## Performance Optimization

### Data Loading
- Lazy load historical data on scroll
- Cache chart data in browser localStorage
- Throttle real-time updates to 100ms

### Rendering
- Canvas-based rendering via Lightweight Charts
- Efficient data structures (typed arrays)
- Web Workers for indicator calculations (future)

### Caching Strategy
```typescript
// API route caching
export async function GET(request: NextRequest) {
  return fetch(url, {
    next: { 
      revalidate: getRevalidationTime(timeframe) 
    }
  });
}

// Revalidation times:
// - 1m/5m: 60 seconds
// - 15m/30m: 5 minutes
// - 1h+: 1 hour
// - Daily+: 24 hours
```

---

## Database Schema

### chart_layouts Table
```prisma
model ChartLayout {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  name      String
  config    Json
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
  @@map("chart_layouts")
}
```

To apply schema changes:
```bash
npx prisma migrate dev --name add_chart_layouts
npx prisma generate
```

---

## Customization

### Adding New Indicators

1. Add calculation function to `src/lib/indicators.ts`:
```typescript
export function calculateNewIndicator(data: OHLCVData[], period: number): LineData[] {
  // Your calculation logic
  return result;
}
```

2. Add indicator type to `src/types/chart.ts`:
```typescript
export type IndicatorType = 
  | 'SMA' | 'EMA' | 'RSI' 
  | 'NewIndicator'; // Add here
```

3. Update ChartManager to handle the new indicator:
```typescript
case 'NewIndicator':
  data = calculateNewIndicator(this.currentData, config.params.period);
  series = this.state.chart.addLineSeries({ color: config.color });
  series.setData(data);
  break;
```

### Styling

The chart supports theme customization:
```typescript
chartManager.setTheme(true); // Dark mode
chartManager.setTheme(false); // Light mode
```

Custom colors:
```typescript
const colors = {
  background: '#1E1E1E',
  text: '#D1D4DC',
  grid: '#2B2B2B',
  upCandle: '#26a69a',
  downCandle: '#ef5350',
};
```

---

## Future Enhancements

- [ ] Real-time WebSocket updates (live price streaming)
- [ ] Advanced order types (stops, limits, OCO)
- [ ] Backtesting engine
- [ ] Alert notifications when indicators cross
- [ ] Export to CSV/Excel
- [ ] Historical screening (rewind to past dates)
- [ ] Mobile touch gesture support
- [ ] Multi-pane layouts (separate indicator panels)
- [ ] Pattern recognition (head & shoulders, triangles, etc.)
- [ ] AI-powered trade suggestions

---

## Troubleshooting

### Chart not rendering
- Check container has valid dimensions
- Ensure data is in correct format (timestamps as numbers)
- Verify Lightweight Charts is properly installed

### Indicators not displaying
- Check indicator parameters are valid
- Ensure data has enough points for indicator period
- Verify indicator color is different from background

### Performance issues
- Reduce number of data points
- Limit active indicators to 3-4
- Use larger timeframes for historical data
- Enable data throttling for real-time updates

---

## Support & Resources

- **TradingView Lightweight Charts**: https://tradingview.github.io/lightweight-charts/
- **Technical Analysis**: https://www.investopedia.com/technical-analysis-4689657
- **API Documentation**: See `SCREENER_API.md` for related endpoints

---

## License & Credits

Built with:
- TradingView Lightweight Charts
- React 18
- TypeScript 5
- Next.js 14
- Prisma ORM
- Clerk Authentication

© 2025 DeepFin - Professional Trading Platform

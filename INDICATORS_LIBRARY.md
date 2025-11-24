# 📊 Technical Indicators Library

Comprehensive technical indicators library with 18+ indicators, caching, typed arrays for performance, and extensible architecture.

## 🎯 Features

- ✅ **18+ Technical Indicators** across 5 categories
- ✅ **Type-safe** with full TypeScript support
- ✅ **Performance optimized** with Float64Array and caching
- ✅ **Extensible** base class architecture
- ✅ **Validation** built-in parameter validation
- ✅ **Signal detection** crossovers, divergences, overbought/oversold
- ✅ **Presets** for different trading styles
- ✅ **Factory pattern** for dynamic indicator creation

## 📦 Indicators Included

### Moving Averages (Overlay)
- **SMA** - Simple Moving Average
- **EMA** - Exponential Moving Average (more weight to recent)
- **WMA** - Weighted Moving Average
- **DEMA** - Double Exponential Moving Average (reduced lag)

### Momentum (Oscillator)
- **RSI** - Relative Strength Index (0-100, overbought/oversold)
- **Stochastic** - %K and %D lines (0-100)
- **CCI** - Commodity Channel Index
- **Williams %R** - Momentum indicator (-100 to 0)

### Trend
- **MACD** - Moving Average Convergence Divergence (line, signal, histogram)
- **ADX** - Average Directional Index (trend strength)
- **Parabolic SAR** - Stop and Reverse points
- **Ichimoku Cloud** - Comprehensive trend system (5 lines)

### Volatility (Overlay & Oscillator)
- **Bollinger Bands** - Volatility bands (upper, middle, lower)
- **ATR** - Average True Range
- **Keltner Channels** - EMA + ATR based channels
- **Standard Deviation** - Statistical volatility measure

### Volume
- **OBV** - On-Balance Volume (cumulative buying/selling pressure)
- **VWAP** - Volume Weighted Average Price
- **Volume Profile** - Price level volume distribution
- **MFI** - Money Flow Index (volume-weighted RSI)
- **A/D** - Accumulation/Distribution Line

## 🚀 Quick Start

### Basic Usage

```typescript
import { SMA, RSI, MACD } from '@/lib/indicators';
import type { OHLCVData } from '@/types/chart';

// Your OHLCV data
const data: OHLCVData[] = [
  { time: 1234567890, open: 100, high: 105, low: 99, close: 103, volume: 10000 },
  // ... more data
];

// Create indicator instance
const sma = new SMA();

// Calculate with default parameters
const result = sma.calculate(data);
console.log(result.values[0]); // Array of SMA values

// Calculate with custom parameters
const customResult = sma.calculate(data, { period: 50, source: 'close' });

// Use caching for better performance
const cachedResult = sma.calculateWithCache(data, { period: 20 });
```

### Using the Registry (Factory Pattern)

```typescript
import { IndicatorRegistry, createIndicator } from '@/lib/indicators';

// Create indicator by name
const rsi = createIndicator('RSI');
const rsiResult = rsi.calculate(data, { period: 14 });

// Get all available indicators
const allIndicators = IndicatorRegistry.getAll();
console.log(allIndicators); // [{ type: 'SMA', config: {...} }, ...]

// Get indicators by category
const oscillators = IndicatorRegistry.getByCategory('oscillator');
console.log(oscillators); // ['RSI', 'Stochastic', 'CCI', 'Williams%R', ...]
```

### Calculate Multiple Indicators

```typescript
import { calculateIndicators } from '@/lib/indicators';

const results = calculateIndicators(data, [
  { type: 'SMA', params: { period: 20 } },
  { type: 'EMA', params: { period: 50 } },
  { type: 'RSI', params: { period: 14 } },
  { type: 'MACD', params: {} }, // Use defaults
]);

// Access results
const smaValues = results.get('SMA')?.values[0];
const rsiValues = results.get('RSI')?.values[0];
const macdLines = results.get('MACD')?.values; // [macd, signal, histogram]
```

### Using Presets

```typescript
import { IndicatorPresets, calculateIndicators } from '@/lib/indicators';

// Day trading preset
const dayTradingResults = calculateIndicators(
  data,
  IndicatorPresets.dayTrading.indicators
);

// Available presets:
// - dayTrading (EMA 9/21, RSI, MACD, ATR)
// - swingTrading (SMA 50/200, BB, RSI, MACD)
// - scalping (EMA 5/13, Stochastic, ATR)
// - trending (ADX, PSAR, EMA, ATR)
// - volumeAnalysis (OBV, VWAP, MFI, VP)
// - ichimokuFull (Ichimoku + ATR)
```

## 🔧 Advanced Usage

### Signal Detection

```typescript
import { SignalDetector } from '@/lib/indicators';

// Detect MACD crossovers
const macd = createIndicator('MACD');
const macdResult = macd.calculate(data);
const [macdLine, signalLine] = macdResult.values;

const bullishSignals = SignalDetector.detectCrossovers(
  macdLine,
  signalLine,
  'bullish'
);
console.log('Bullish crossover indices:', bullishSignals);

// Detect RSI overbought/oversold
const rsi = createIndicator('RSI');
const rsiResult = rsi.calculate(data, { period: 14 });
const rsiSignals = SignalDetector.detectOverboughtOversold(
  rsiResult.values[0],
  70, // overbought
  30  // oversold
);

// Detect price/indicator divergences
const divergences = SignalDetector.detectDivergence(
  data.map(d => d.close),
  rsiResult.values[0],
  5 // lookback period
);
```

### Parameter Validation

```typescript
import { validateIndicatorParams } from '@/lib/indicators';

const validation = validateIndicatorParams('RSI', {
  period: 14,
  overbought: 70,
  oversold: 30,
});

if (!validation.valid) {
  console.error('Invalid parameters:', validation.errors);
}
```

### Custom Indicator

```typescript
import { Indicator } from '@/lib/indicators/base';
import type { OHLCVData } from '@/types/chart';
import type { IndicatorResult, IndicatorParams } from '@/types/indicators';

class MyCustomIndicator extends Indicator {
  constructor() {
    super({
      name: 'My Custom Indicator',
      shortName: 'MCI',
      type: 'oscillator',
      description: 'Custom calculation',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 14,
          min: 1,
          max: 100,
          step: 1,
        },
      ],
      outputs: [
        {
          name: 'MCI',
          color: '#FF0000',
          lineWidth: 2,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, 'close');
    const result = new Float64Array(data.length);

    // Your custom calculation here
    for (let i = period - 1; i < data.length; i++) {
      // ... calculation logic
      result[i] = 0; // placeholder
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

// Register custom indicator
import { IndicatorRegistry } from '@/lib/indicators';
IndicatorRegistry.register('MyCustom', MyCustomIndicator);
```

## 📊 Integration with Charts

### With TradingView Lightweight Charts

```typescript
import { createChart } from 'lightweight-charts';
import { createIndicator } from '@/lib/indicators';

const chart = createChart(container, {
  width: 800,
  height: 400,
});

const candlestickSeries = chart.addCandlestickSeries();
candlestickSeries.setData(chartData);

// Add SMA overlay
const sma = createIndicator('SMA');
const smaResult = sma.calculate(data, { period: 20 });
const smaSeries = chart.addLineSeries({ color: '#2962FF' });
smaSeries.setData(
  smaResult.values[0].map((value, i) => ({
    time: data[i].time,
    value: value,
  }))
);

// Add RSI in separate panel
const rsi = createIndicator('RSI');
const rsiResult = rsi.calculate(data, { period: 14 });
const rsiChart = createChart(rsiContainer, { height: 150 });
const rsiSeries = rsiChart.addLineSeries({ color: '#7E57C2' });
rsiSeries.setData(
  rsiResult.values[0].map((value, i) => ({
    time: data[i].time,
    value: value,
  }))
);
```

## ⚡ Performance Tips

1. **Use caching**: Call `calculateWithCache()` instead of `calculate()` for repeated calculations
2. **Typed arrays**: All calculations use `Float64Array` for better performance
3. **Batch calculations**: Use `calculateIndicators()` to process multiple indicators efficiently
4. **Incremental updates**: For real-time data, consider implementing incremental updates
5. **Web Workers**: For heavy calculations, move indicator computation to Web Workers

## 🧪 Testing

```typescript
import { SMA } from '@/lib/indicators';

describe('SMA', () => {
  const testData: OHLCVData[] = [
    { time: 1, open: 10, high: 11, low: 9, close: 10.5, volume: 1000 },
    { time: 2, open: 10.5, high: 11.5, low: 10, close: 11, volume: 1100 },
    // ... more test data
  ];

  it('should calculate SMA correctly', () => {
    const sma = new SMA();
    const result = sma.calculate(testData, { period: 3 });
    
    expect(result.values[0].length).toBe(testData.length);
    expect(result.values[0][2]).toBeCloseTo(10.5, 1); // Third value should be average of first 3
  });

  it('should validate parameters', () => {
    const sma = new SMA();
    const validation = sma.validateInputs({ period: -1 });
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
});
```

## 📚 API Reference

### Indicator Base Class

All indicators extend the `Indicator` base class:

**Methods:**
- `calculate(data, params?)` - Calculate indicator values
- `calculateWithCache(data, params?)` - Calculate with caching
- `getConfig()` - Get indicator configuration
- `getDefaultParams()` - Get default parameters
- `validateInputs(params)` - Validate parameter values
- `clearCache()` - Clear calculation cache

**Protected Helpers:**
- `extractPrices(data, source)` - Extract price array
- `extractVolumes(data)` - Extract volume array
- `extractTimestamps(data)` - Extract timestamp array
- `calculateStdDev(values, mean)` - Calculate standard deviation
- `fillNaN(length)` - Create NaN array for warm-up period

### IndicatorResult

```typescript
interface IndicatorResult {
  values: number[][];      // Array of value arrays (one per output line)
  timestamps: number[];     // Unix timestamps
  metadata?: {
    overbought?: number;
    oversold?: number;
    signals?: Array<{
      timestamp: number;
      type: 'buy' | 'sell';
      price: number;
    }>;
    [key: string]: any;     // Additional metadata
  };
}
```

## 🤝 Contributing

To add a new indicator:

1. Create a new class extending `Indicator`
2. Define configuration in constructor
3. Implement `calculate()` method
4. Add to `IndicatorRegistry` in `registry.ts`
5. Export from `index.ts`
6. Add tests

## 📝 License

MIT

---

**Built with ❤️ for professional trading applications**

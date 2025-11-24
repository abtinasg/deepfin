import { IChartApi, ISeriesApi, Time } from 'lightweight-charts';

// Chart Data Types
export interface OHLCVData {
  time: Time;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface LineData {
  time: Time;
  value: number;
}

// Chart Configuration
export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'heikin-ashi';

export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y' | 'All';

export interface ChartConfig {
  ticker: string;
  timeframe: Timeframe;
  chartType: ChartType;
  indicators: IndicatorConfig[];
  drawings: Drawing[];
  comparisons: string[];
  showVolume: boolean;
  showGrid: boolean;
}

// Indicator Types
export type IndicatorType = 
  | 'SMA' | 'EMA' | 'WMA'
  | 'RSI' | 'MACD' | 'Stochastic' | 'CCI'
  | 'BollingerBands' | 'ATR' | 'KeltnerChannels'
  | 'OBV' | 'VWAP'
  | 'ADX' | 'ParabolicSAR' | 'IchimokuCloud';

export interface IndicatorConfig {
  id: string;
  type: IndicatorType;
  params: Record<string, any>;
  visible: boolean;
  color?: string;
}

export interface IndicatorResult {
  id: string;
  type: IndicatorType;
  data: LineData[];
  series?: ISeriesApi<'Line'>;
}

// Drawing Types
export type DrawingType = 
  | 'horizontal-line'
  | 'vertical-line'
  | 'trend-line'
  | 'fibonacci-retracement'
  | 'fibonacci-extension'
  | 'rectangle'
  | 'triangle'
  | 'text';

export interface Point {
  time: Time;
  price: number;
}

export interface Drawing {
  id: string;
  type: DrawingType;
  points: Point[];
  color?: string;
  lineWidth?: number;
  text?: string;
}

// Chart Layout
export interface ChartLayout {
  id: string;
  name: string;
  config: ChartConfig;
  createdAt: string;
  updatedAt: string;
}

// Price Data Response
export interface PriceDataResponse {
  ticker: string;
  timeframe: Timeframe;
  data: OHLCVData[];
  timestamp: number;
}

// Comparison Data
export interface ComparisonStock {
  ticker: string;
  color: string;
  data: LineData[];
  currentPrice: number;
  change: number;
  changePercent: number;
}

// Chart State
export interface ChartState {
  chart: IChartApi | null;
  candlestickSeries: ISeriesApi<'Candlestick'> | null;
  volumeSeries: ISeriesApi<'Histogram'> | null;
  lineSeries: ISeriesApi<'Line'> | null;
  areaSeries: ISeriesApi<'Area'> | null;
  indicators: Map<string, IndicatorResult>;
  drawings: Drawing[];
  comparisons: Map<string, ComparisonStock>;
}

// Indicator Parameters
export interface SMAParams {
  period: number;
  source: 'close' | 'open' | 'high' | 'low';
}

export interface EMAParams {
  period: number;
  source: 'close' | 'open' | 'high' | 'low';
}

export interface RSIParams {
  period: number;
  overbought: number;
  oversold: number;
}

export interface MACDParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

export interface BollingerBandsParams {
  period: number;
  stdDev: number;
  source: 'close' | 'open' | 'high' | 'low';
}

export interface StochasticParams {
  kPeriod: number;
  dPeriod: number;
  smooth: number;
}

// Chart Preset
export interface ChartPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  config: Partial<ChartConfig>;
}

export const CHART_PRESETS: ChartPreset[] = [
  {
    id: 'day-trading',
    name: 'Day Trading',
    description: 'Quick scalping with volume and momentum',
    icon: '⚡',
    config: {
      timeframe: '5m',
      chartType: 'candlestick',
      showVolume: true,
      indicators: [
        { id: 'ema-9', type: 'EMA', params: { period: 9, source: 'close' }, visible: true, color: '#2196F3' },
        { id: 'ema-21', type: 'EMA', params: { period: 21, source: 'close' }, visible: true, color: '#FF9800' },
        { id: 'rsi', type: 'RSI', params: { period: 14, overbought: 70, oversold: 30 }, visible: true },
      ],
    },
  },
  {
    id: 'swing-trading',
    name: 'Swing Trading',
    description: 'Multi-day holds with trend indicators',
    icon: '📈',
    config: {
      timeframe: '1D',
      chartType: 'candlestick',
      showVolume: true,
      indicators: [
        { id: 'sma-50', type: 'SMA', params: { period: 50, source: 'close' }, visible: true, color: '#4CAF50' },
        { id: 'sma-200', type: 'SMA', params: { period: 200, source: 'close' }, visible: true, color: '#F44336' },
        { id: 'macd', type: 'MACD', params: { fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 }, visible: true },
        { id: 'bb', type: 'BollingerBands', params: { period: 20, stdDev: 2, source: 'close' }, visible: true },
      ],
    },
  },
  {
    id: 'long-term',
    name: 'Long-term Investment',
    description: 'Weekly analysis with fundamental trends',
    icon: '📊',
    config: {
      timeframe: '1W',
      chartType: 'line',
      showVolume: true,
      indicators: [
        { id: 'sma-20', type: 'SMA', params: { period: 20, source: 'close' }, visible: true, color: '#9C27B0' },
        { id: 'sma-50', type: 'SMA', params: { period: 50, source: 'close' }, visible: true, color: '#4CAF50' },
      ],
    },
  },
];

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  pe: number | null;
  volume: number;
  sector: string;
  dividend: number | null;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  rsi: number | null;
  macdSignal: 'bullish' | 'bearish' | 'neutral';
  aboveFiftyDayMA: boolean;
  aboveTwoHundredDayMA: boolean;
}

export interface ScreenerFilters {
  marketCap: string[];
  peRatio: { min?: number; max?: number };
  priceRange: { min?: number; max?: number };
  sectors: string[];
  technical: string[];
  dividendYield: { min?: number; max?: number };
  volume: { min?: number; max?: number };
}

export interface ScreenerState {
  filters: ScreenerFilters;
  results: Stock[];
  selectedRows: string[];
  sortBy: { field: keyof Stock; order: 'asc' | 'desc' };
  page: number;
  perPage: number;
  loading: boolean;
  searchTerm: string;
}

export interface FilterTemplate {
  name: string;
  icon: string;
  description: string;
  filters: Partial<ScreenerFilters>;
}

export const MARKET_CAP_OPTIONS = [
  { value: 'all', label: 'All', min: 0, max: Infinity },
  { value: 'mega', label: 'Mega (>$200B)', min: 200_000_000_000, max: Infinity },
  { value: 'large', label: 'Large ($10-200B)', min: 10_000_000_000, max: 200_000_000_000 },
  { value: 'mid', label: 'Mid ($2-10B)', min: 2_000_000_000, max: 10_000_000_000 },
  { value: 'small', label: 'Small (<$2B)', min: 0, max: 2_000_000_000 },
];

export const SECTORS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Energy',
  'Consumer Discretionary',
  'Consumer Staples',
  'Industrials',
  'Materials',
  'Real Estate',
  'Utilities',
  'Communication Services',
];

export const TECHNICAL_INDICATORS = [
  { value: 'rsi_overbought', label: 'RSI > 70 (Overbought)' },
  { value: 'rsi_oversold', label: 'RSI < 30 (Oversold)' },
  { value: 'above_50ma', label: 'Above 50-day MA' },
  { value: 'above_200ma', label: 'Above 200-day MA' },
  { value: 'macd_bullish', label: 'MACD Bullish Cross' },
  { value: 'volume_high', label: 'Volume > Average' },
];

export const FILTER_TEMPLATES: FilterTemplate[] = [
  {
    name: 'Value Stocks',
    icon: '💎',
    description: 'Low P/E, High Dividend',
    filters: {
      peRatio: { min: 0, max: 15 },
      dividendYield: { min: 3 },
    },
  },
  {
    name: 'Growth Stocks',
    icon: '🚀',
    description: 'High Revenue Growth',
    filters: {
      marketCap: ['mega', 'large'],
      peRatio: { min: 20 },
    },
  },
  {
    name: 'Dividend Kings',
    icon: '👑',
    description: '25+ Years Dividends',
    filters: {
      dividendYield: { min: 2 },
    },
  },
  {
    name: 'Momentum',
    icon: '⚡',
    description: 'Strong Price Action',
    filters: {
      technical: ['above_50ma', 'above_200ma', 'macd_bullish'],
    },
  },
  {
    name: 'Oversold',
    icon: '📉',
    description: 'RSI < 30',
    filters: {
      technical: ['rsi_oversold'],
    },
  },
  {
    name: 'Breakouts',
    icon: '📈',
    description: 'Near 52W High',
    filters: {
      technical: ['volume_high', 'above_200ma'],
    },
  },
];

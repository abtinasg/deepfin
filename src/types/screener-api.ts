// Screener Filter Types
export interface ScreenerFilters {
  market_cap?: { min?: number; max?: number };
  pe_ratio?: { min?: number; max?: number };
  price?: { min?: number; max?: number };
  dividend_yield?: { min?: number; max?: number };
  volume?: { min?: number; max?: number };
  rsi?: { min?: number; max?: number };
  sector?: string[];
  above_50ma?: boolean;
  above_200ma?: boolean;
  macd_signal?: 'bullish' | 'bearish' | 'neutral';
}

export interface ScreenerSort {
  field: 'ticker' | 'price' | 'market_cap' | 'pe_ratio' | 'volume' | 'change_percent' | 'dividend_yield';
  order: 'asc' | 'desc';
}

export interface ScreenerQuery {
  filters: ScreenerFilters;
  sort?: ScreenerSort;
  limit?: number;
  offset?: number;
}

// Screener Response Types
export interface ScreenerStockResult {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  market_cap: number;
  pe_ratio: number | null;
  dividend_yield: number | null;
  rsi: number | null;
  volume: number;
  sector: string;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  above_50ma: boolean;
  above_200ma: boolean;
  macd_signal: 'bullish' | 'bearish' | 'neutral';
}

export interface ScreenerResponse {
  total: number;
  results: ScreenerStockResult[];
  execution_time_ms: number;
  cached: boolean;
}

// Saved Screen Types
export interface SavedScreenCreate {
  name: string;
  description?: string;
  filters: ScreenerFilters;
}

export interface SavedScreenData {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  filters: ScreenerFilters;
  createdAt: string;
  updatedAt: string;
}

// Template Types
export interface ScreenerTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'value' | 'growth' | 'dividend' | 'technical' | 'momentum';
  filters: ScreenerFilters;
  popular: boolean;
}

// Cache Types
export interface ScreenerCacheData {
  ticker: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  market_cap: number;
  pe_ratio: number | null;
  dividend_yield: number | null;
  rsi: number | null;
  volume: number;
  sector: string;
  fifty_two_week_high: number;
  fifty_two_week_low: number;
  above_50ma: boolean;
  above_200ma: boolean;
  macd_signal: 'bullish' | 'bearish' | 'neutral';
}

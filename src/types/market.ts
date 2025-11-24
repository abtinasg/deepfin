export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  isLive: boolean;
  sparklineData?: number[];
  icon?: string;
}

export interface GlobalMarket {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  country: string;
  flag?: string;
}

export interface Sector {
  name: string;
  icon: string;
  change: number;
  changePercent: number;
  color?: string;
}

export interface Stock {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  icon?: string;
}

export interface MarketMover extends Stock {
  type: 'gainer' | 'loser' | 'active';
}

export interface FutureAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  icon: string;
}

export interface EconomicEvent {
  time: string;
  event: string;
  country: string;
  importance: 'low' | 'medium' | 'high';
  actual?: string;
  forecast?: string;
  previous?: string;
}

export interface MarketSummary {
  headline: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  generatedAt: Date;
}

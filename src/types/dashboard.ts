export type SentimentDatum = {
  ticker: string;
  name?: string;
  sentiment: number; // -100 to 100
  change?: number;
  volume?: number;
};

export type SectorRotationPoint = {
  sector: string;
  momentum: number; // -100 to 100
  strength: number; // -100 to 100
  color?: string;
};

export type RiskMeterDatum = {
  label: string;
  score: number; // 0 - 100
  change?: number;
  driver?: string;
};

export type MacroMetric = {
  group: 'Rates' | 'Bonds' | 'Commodities' | 'FX';
  label: string;
  value: string;
  delta?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
};

export type RegimeProbability = {
  label: 'Bull' | 'Bear' | 'Neutral';
  probability: number; // 0-1
};

export type ScreenerQuickCard = {
  title: string;
  tone: 'positive' | 'negative' | 'neutral';
  metrics: {
    label: string;
    value: string;
  }[];
};

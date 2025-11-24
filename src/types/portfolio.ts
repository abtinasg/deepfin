export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  description?: string;
  holdings: Holding[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Holding {
  id: string;
  portfolioId: string;
  ticker: string;
  name: string;
  shares: number;
  costBasis: number;
  currentPrice: number;
  currentValue: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  allocation: number; // % of portfolio
  purchaseDate: Date;
  notes?: string;
}

export interface Transaction {
  id: string;
  portfolioId: string;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  fees: number;
  transactionDate: Date;
  notes?: string;
  createdAt: Date;
}

export interface PortfolioSnapshot {
  id: string;
  portfolioId: string;
  totalValue: number;
  totalGainLoss: number;
  snapshotDate: Date;
  holdings: HoldingSnapshot[];
  createdAt: Date;
}

export interface HoldingSnapshot {
  ticker: string;
  shares: number;
  price: number;
  value: number;
}

export interface PerformanceMetrics {
  totalReturn: number;
  totalReturnPercent: number;
  annualizedReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  winRate: number;
  bestDay: number;
  worstDay: number;
  volatility: number;
  beta?: number;
  alpha?: number;
}

export interface AllocationData {
  bySector: AllocationItem[];
  byAssetClass: AllocationItem[];
  byMarketCap: AllocationItem[];
  byCountry: AllocationItem[];
  topHoldings: AllocationItem[];
  concentration: {
    top5: number;
    top10: number;
    herfindahlIndex: number;
  };
}

export interface AllocationItem {
  name: string;
  value: number;
  percentage: number;
  color?: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  benchmark?: number;
}

export interface PortfolioPerformance {
  chartData: ChartDataPoint[];
  metrics: PerformanceMetrics;
  allocation: AllocationData;
  recentTransactions: Transaction[];
}

export interface AddTransactionRequest {
  portfolioId: string;
  ticker: string;
  type: 'buy' | 'sell';
  shares: number;
  price: number;
  fees?: number;
  transactionDate: string;
  notes?: string;
}

export interface CreatePortfolioRequest {
  name: string;
  description?: string;
}

export interface UpdatePortfolioRequest {
  name?: string;
  description?: string;
}

export interface AddHoldingRequest {
  ticker: string;
  shares: number;
  costBasis: number;
  purchaseDate: string;
  notes?: string;
}

export interface BenchmarkComparison {
  portfolioReturn: number;
  benchmarkReturn: number;
  outperformance: number;
  correlation: number;
  trackingError: number;
}

export interface RiskMetrics {
  standardDeviation: number;
  downsideDeviation: number;
  var95: number; // Value at Risk (95%)
  cvar95: number; // Conditional VaR
  beta: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
}

export interface DiversificationMetrics {
  numberOfHoldings: number;
  effectiveNumberOfHoldings: number;
  sectorConcentration: number;
  topHoldingConcentration: number;
  diversificationRatio: number;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  numberOfHoldings: number;
  lastUpdated: Date;
}

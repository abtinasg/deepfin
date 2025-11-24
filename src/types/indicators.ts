import { OHLCVData } from './chart';

// Input configuration for indicator parameters
export interface IndicatorInput {
  name: string;
  type: 'number' | 'select' | 'boolean';
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: Array<{ label: string; value: any }>;
  description?: string;
}

// Output configuration for indicator series
export interface IndicatorOutput {
  name: string;
  color: string;
  lineWidth?: number;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
}

// Indicator configuration metadata
export interface IndicatorConfig {
  name: string;
  shortName: string;
  type: 'overlay' | 'oscillator' | 'volume';
  description: string;
  inputs: IndicatorInput[];
  outputs: IndicatorOutput[];
  // Optional separate panel configuration
  panelOptions?: {
    height?: number;
    horizontalLines?: Array<{ value: number; color: string; style?: string }>;
    minValue?: number;
    maxValue?: number;
  };
}

// Result from indicator calculation
export interface IndicatorResult {
  values: number[][]; // Array of arrays for multi-line indicators (e.g., MACD has 3 lines)
  timestamps: number[];
  metadata?: {
    overbought?: number;
    oversold?: number;
    signals?: Array<{
      timestamp: number;
      type: 'buy' | 'sell';
      price: number;
    }>;
    [key: string]: any; // Allow additional metadata fields
  };
}

// Parameters for indicator calculation
export type IndicatorParams = Record<string, any>;

// Validation result
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

// Cache entry for memoization
export interface CacheEntry {
  params: IndicatorParams;
  dataHash: string;
  result: IndicatorResult;
  timestamp: number;
}

// Interface for incremental updates
export interface IncrementalUpdate {
  newData: OHLCVData[];
  previousResult?: IndicatorResult;
}

// Web Worker message types
export type WorkerMessage =
  | { type: 'calculate'; indicator: string; data: OHLCVData[]; params: IndicatorParams }
  | { type: 'result'; result: IndicatorResult }
  | { type: 'error'; error: string };

// Available indicator types (for registry)
export type IndicatorType =
  | 'SMA'
  | 'EMA'
  | 'WMA'
  | 'RSI'
  | 'MACD'
  | 'Stochastic'
  | 'BollingerBands'
  | 'ATR'
  | 'KeltnerChannels'
  | 'OBV'
  | 'VWAP'
  | 'VolumeProfile'
  | 'ADX'
  | 'ParabolicSAR'
  | 'Ichimoku'
  | 'CCI'
  | 'MFI'
  | 'Williams%R';

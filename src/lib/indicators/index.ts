// Base classes and types
export { Indicator } from './base';
export { IndicatorRegistry, createIndicator, IndicatorGroups } from './registry';

// Moving Averages
export { SMA, EMA, WMA, DEMA } from './moving-averages';

// Momentum Indicators
export { RSI, Stochastic, CCI, WilliamsR } from './momentum';

// Trend Indicators
export { MACD, MACDHistogram } from './macd';
export { ADX, ParabolicSAR, Ichimoku } from './trend';

// Volatility Indicators
export { BollingerBands, ATR, KeltnerChannels, StandardDeviation } from './volatility';

// Volume Indicators
export { OBV, VWAP, VolumeProfile, MFI, AD } from './volume';

// Re-export types
export type {
  IndicatorConfig,
  IndicatorResult,
  IndicatorParams,
  IndicatorInput,
  IndicatorOutput,
  IndicatorType,
  ValidationResult,
} from '@/types/indicators';

/**
 * Quick Access Helper Functions
 */

import { OHLCVData } from '@/types/chart';
import { IndicatorType, IndicatorParams, IndicatorResult } from '@/types/indicators';
import { IndicatorRegistry } from './registry';

/**
 * Calculate multiple indicators at once
 * @example
 * const results = calculateIndicators(data, [
 *   { type: 'SMA', params: { period: 20 } },
 *   { type: 'RSI', params: { period: 14 } },
 * ]);
 */
export function calculateIndicators(
  data: OHLCVData[],
  indicators: Array<{ type: IndicatorType; params?: IndicatorParams }>
): Map<string, IndicatorResult> {
  const results = new Map<string, IndicatorResult>();

  for (const { type, params } of indicators) {
    const indicator = IndicatorRegistry.create(type);
    const result = indicator.calculateWithCache(data, params);
    results.set(type, result);
  }

  return results;
}

/**
 * Get indicator configuration by type
 */
export function getIndicatorConfig(type: IndicatorType) {
  const indicator = IndicatorRegistry.create(type);
  return indicator.getConfig();
}

/**
 * Validate indicator parameters
 */
export function validateIndicatorParams(type: IndicatorType, params: IndicatorParams) {
  const indicator = IndicatorRegistry.create(type);
  return indicator.validateInputs(params);
}

/**
 * Utility: Detect indicator signals (crossovers, divergences, etc.)
 */
export class SignalDetector {
  /**
   * Detect line crossovers (e.g., MACD crossover)
   */
  static detectCrossovers(
    line1: number[],
    line2: number[],
    type: 'bullish' | 'bearish' | 'all' = 'all'
  ): number[] {
    const signals: number[] = [];

    for (let i = 1; i < line1.length; i++) {
      if (isNaN(line1[i]) || isNaN(line2[i]) || isNaN(line1[i - 1]) || isNaN(line2[i - 1])) {
        continue;
      }

      // Bullish crossover: line1 crosses above line2
      if (line1[i - 1] <= line2[i - 1] && line1[i] > line2[i]) {
        if (type === 'bullish' || type === 'all') {
          signals.push(i);
        }
      }
      // Bearish crossover: line1 crosses below line2
      else if (line1[i - 1] >= line2[i - 1] && line1[i] < line2[i]) {
        if (type === 'bearish' || type === 'all') {
          signals.push(i);
        }
      }
    }

    return signals;
  }

  /**
   * Detect overbought/oversold conditions
   */
  static detectOverboughtOversold(
    values: number[],
    overbought: number,
    oversold: number
  ): Array<{ index: number; type: 'overbought' | 'oversold' }> {
    const signals: Array<{ index: number; type: 'overbought' | 'oversold' }> = [];

    for (let i = 0; i < values.length; i++) {
      if (isNaN(values[i])) continue;

      if (values[i] >= overbought) {
        signals.push({ index: i, type: 'overbought' });
      } else if (values[i] <= oversold) {
        signals.push({ index: i, type: 'oversold' });
      }
    }

    return signals;
  }

  /**
   * Detect divergences between price and indicator
   */
  static detectDivergence(
    prices: number[],
    indicator: number[],
    lookback: number = 5
  ): Array<{ index: number; type: 'bullish' | 'bearish' }> {
    const signals: Array<{ index: number; type: 'bullish' | 'bearish' }> = [];

    for (let i = lookback; i < prices.length; i++) {
      // Find local highs/lows
      const priceHigh = Math.max(...prices.slice(i - lookback, i + 1));
      const priceLow = Math.min(...prices.slice(i - lookback, i + 1));
      const indHigh = Math.max(...indicator.slice(i - lookback, i + 1));
      const indLow = Math.min(...indicator.slice(i - lookback, i + 1));

      // Bullish divergence: price makes lower low, indicator makes higher low
      if (prices[i] === priceLow && indicator[i] > indLow) {
        signals.push({ index: i, type: 'bullish' });
      }
      // Bearish divergence: price makes higher high, indicator makes lower high
      else if (prices[i] === priceHigh && indicator[i] < indHigh) {
        signals.push({ index: i, type: 'bearish' });
      }
    }

    return signals;
  }
}

/**
 * Preset indicator combinations for different trading styles
 */
export const IndicatorPresets = {
  dayTrading: {
    name: 'Day Trading',
    indicators: [
      { type: 'EMA' as IndicatorType, params: { period: 9 } },
      { type: 'EMA' as IndicatorType, params: { period: 21 } },
      { type: 'RSI' as IndicatorType, params: { period: 14 } },
      { type: 'MACD' as IndicatorType, params: {} },
      { type: 'ATR' as IndicatorType, params: { period: 14 } },
    ],
  },
  swingTrading: {
    name: 'Swing Trading',
    indicators: [
      { type: 'SMA' as IndicatorType, params: { period: 50 } },
      { type: 'SMA' as IndicatorType, params: { period: 200 } },
      { type: 'BollingerBands' as IndicatorType, params: { period: 20, stdDev: 2 } },
      { type: 'RSI' as IndicatorType, params: { period: 14 } },
      { type: 'MACD' as IndicatorType, params: {} },
    ],
  },
  scalping: {
    name: 'Scalping',
    indicators: [
      { type: 'EMA' as IndicatorType, params: { period: 5 } },
      { type: 'EMA' as IndicatorType, params: { period: 13 } },
      { type: 'Stochastic' as IndicatorType, params: { kPeriod: 5, dPeriod: 3 } },
      { type: 'ATR' as IndicatorType, params: { period: 14 } },
    ],
  },
  trending: {
    name: 'Trend Following',
    indicators: [
      { type: 'ADX' as IndicatorType, params: { period: 14 } },
      { type: 'ParabolicSAR' as IndicatorType, params: {} },
      { type: 'EMA' as IndicatorType, params: { period: 50 } },
      { type: 'ATR' as IndicatorType, params: { period: 14 } },
    ],
  },
  volumeAnalysis: {
    name: 'Volume Analysis',
    indicators: [
      { type: 'OBV' as IndicatorType, params: {} },
      { type: 'VWAP' as IndicatorType, params: {} },
      { type: 'MFI' as IndicatorType, params: { period: 14 } },
      { type: 'VolumeProfile' as IndicatorType, params: { bins: 24 } },
    ],
  },
  ichimokuFull: {
    name: 'Ichimoku Complete',
    indicators: [
      { type: 'Ichimoku' as IndicatorType, params: {} },
      { type: 'ATR' as IndicatorType, params: { period: 14 } },
    ],
  },
};

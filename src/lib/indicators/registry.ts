import { Indicator } from './base';
import { SMA, EMA, WMA, DEMA } from './moving-averages';
import { RSI, Stochastic, CCI, WilliamsR } from './momentum';
import { MACD, MACDHistogram } from './macd';
import { BollingerBands, ATR, KeltnerChannels, StandardDeviation } from './volatility';
import { OBV, VWAP, VolumeProfile, MFI, AD } from './volume';
import { ADX, ParabolicSAR, Ichimoku } from './trend';
import { IndicatorType } from '@/types/indicators';

/**
 * Indicator Registry
 * Factory for creating indicator instances by name
 */
export class IndicatorRegistry {
  private static indicators: Map<IndicatorType, new () => Indicator> = new Map([
    // Moving Averages
    ['SMA', SMA],
    ['EMA', EMA],
    ['WMA', WMA],
    
    // Momentum
    ['RSI', RSI],
    ['Stochastic', Stochastic],
    ['CCI', CCI],
    ['Williams%R', WilliamsR],
    
    // MACD
    ['MACD', MACD],
    
    // Volatility
    ['BollingerBands', BollingerBands],
    ['ATR', ATR],
    ['KeltnerChannels', KeltnerChannels],
    
    // Volume
    ['OBV', OBV],
    ['VWAP', VWAP],
    ['VolumeProfile', VolumeProfile],
    ['MFI', MFI],
    
    // Trend
    ['ADX', ADX],
    ['ParabolicSAR', ParabolicSAR],
    ['Ichimoku', Ichimoku],
  ]);

  /**
   * Create an indicator instance by type
   */
  static create(type: IndicatorType): Indicator {
    const IndicatorClass = this.indicators.get(type);
    if (!IndicatorClass) {
      throw new Error(`Indicator type "${type}" not found in registry`);
    }
    return new IndicatorClass();
  }

  /**
   * Check if an indicator type is registered
   */
  static has(type: string): boolean {
    return this.indicators.has(type as IndicatorType);
  }

  /**
   * Get all registered indicator types
   */
  static getTypes(): IndicatorType[] {
    return Array.from(this.indicators.keys());
  }

  /**
   * Get all registered indicators with their configurations
   */
  static getAll(): Array<{ type: IndicatorType; config: any }> {
    return Array.from(this.indicators.entries()).map(([type, IndicatorClass]) => {
      const instance = new IndicatorClass();
      return {
        type,
        config: instance.getConfig(),
      };
    });
  }

  /**
   * Get indicators by category
   */
  static getByCategory(category: 'overlay' | 'oscillator' | 'volume'): IndicatorType[] {
    return this.getAll()
      .filter((item) => item.config.type === category)
      .map((item) => item.type);
  }

  /**
   * Register a custom indicator
   */
  static register(type: string, IndicatorClass: new () => Indicator): void {
    this.indicators.set(type as IndicatorType, IndicatorClass);
  }

  /**
   * Unregister an indicator
   */
  static unregister(type: IndicatorType): boolean {
    return this.indicators.delete(type);
  }
}

/**
 * Helper function to create indicator by name
 */
export function createIndicator(type: IndicatorType): Indicator {
  return IndicatorRegistry.create(type);
}

/**
 * Predefined indicator groups for quick access
 */
export const IndicatorGroups = {
  movingAverages: ['SMA', 'EMA', 'WMA'] as IndicatorType[],
  momentum: ['RSI', 'Stochastic', 'CCI', 'Williams%R'] as IndicatorType[],
  trend: ['MACD', 'ADX', 'ParabolicSAR', 'Ichimoku'] as IndicatorType[],
  volatility: ['BollingerBands', 'ATR', 'KeltnerChannels'] as IndicatorType[],
  volume: ['OBV', 'VWAP', 'VolumeProfile', 'MFI'] as IndicatorType[],
  
  // Popular combinations
  dayTrading: ['EMA', 'RSI', 'MACD', 'ATR'] as IndicatorType[],
  swingTrading: ['SMA', 'BollingerBands', 'RSI', 'MACD'] as IndicatorType[],
  scalping: ['EMA', 'Stochastic', 'ATR'] as IndicatorType[],
  trending: ['ADX', 'ParabolicSAR', 'EMA'] as IndicatorType[],
};

import { OHLCVData } from '@/types/chart';
import {
  IndicatorConfig,
  IndicatorResult,
  IndicatorParams,
  ValidationResult,
  CacheEntry,
} from '@/types/indicators';

/**
 * Abstract base class for all technical indicators
 * Provides common functionality for validation, caching, and parameter management
 */
export abstract class Indicator {
  protected config: IndicatorConfig;
  private cache: Map<string, CacheEntry> = new Map();
  private cacheMaxSize = 50;
  private cacheMaxAge = 5 * 60 * 1000; // 5 minutes

  constructor(config: IndicatorConfig) {
    this.config = config;
  }

  /**
   * Abstract method that each indicator must implement
   * Performs the actual calculation logic
   */
  abstract calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult;

  /**
   * Get indicator configuration
   */
  getConfig(): IndicatorConfig {
    return this.config;
  }

  /**
   * Get default parameters from config
   */
  getDefaultParams(): IndicatorParams {
    const params: IndicatorParams = {};
    this.config.inputs.forEach((input) => {
      params[input.name] = input.default;
    });
    return params;
  }

  /**
   * Validate input parameters
   */
  validateInputs(params: IndicatorParams): ValidationResult {
    const errors: string[] = [];

    this.config.inputs.forEach((input) => {
      const value = params[input.name];

      // Check if required parameter is missing
      if (value === undefined || value === null) {
        errors.push(`Missing required parameter: ${input.name}`);
        return;
      }

      // Type validation
      if (input.type === 'number') {
        if (typeof value !== 'number' || isNaN(value)) {
          errors.push(`Parameter ${input.name} must be a valid number`);
        }

        // Range validation
        if (input.min !== undefined && value < input.min) {
          errors.push(`Parameter ${input.name} must be >= ${input.min}`);
        }
        if (input.max !== undefined && value > input.max) {
          errors.push(`Parameter ${input.name} must be <= ${input.max}`);
        }
      }

      if (input.type === 'select') {
        if (input.options) {
          const validValues = input.options.map((opt) => opt.value);
          if (!validValues.includes(value)) {
            errors.push(
              `Parameter ${input.name} must be one of: ${validValues.join(', ')}`
            );
          }
        }
      }

      if (input.type === 'boolean') {
        if (typeof value !== 'boolean') {
          errors.push(`Parameter ${input.name} must be a boolean`);
        }
      }
    });

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Calculate with caching support
   */
  calculateWithCache(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const finalParams = { ...this.getDefaultParams(), ...params };
    const cacheKey = this.generateCacheKey(data, finalParams);

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheMaxAge) {
      return cached.result;
    }

    // Calculate
    const result = this.calculate(data, finalParams);

    // Store in cache
    this.setCacheEntry(cacheKey, data, finalParams, result);

    return result;
  }

  /**
   * Generate cache key from data and parameters
   */
  protected generateCacheKey(data: OHLCVData[], params: IndicatorParams): string {
    const dataHash = this.hashData(data);
    const paramsHash = JSON.stringify(params);
    return `${this.config.shortName}-${dataHash}-${paramsHash}`;
  }

  /**
   * Simple hash function for data
   */
  protected hashData(data: OHLCVData[]): string {
    if (data.length === 0) return '0';
    const first = data[0];
    const last = data[data.length - 1];
    return `${data.length}-${first.time}-${last.time}-${last.close}`;
  }

  /**
   * Store entry in cache with size limit
   */
  protected setCacheEntry(
    key: string,
    data: OHLCVData[],
    params: IndicatorParams,
    result: IndicatorResult
  ): void {
    // Enforce cache size limit
    if (this.cache.size >= this.cacheMaxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      params,
      dataHash: this.hashData(data),
      result,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Helper: Extract price array from OHLCV data
   */
  protected extractPrices(
    data: OHLCVData[],
    source: 'open' | 'high' | 'low' | 'close' | 'hlc3' | 'ohlc4' = 'close'
  ): Float64Array {
    const prices = new Float64Array(data.length);

    for (let i = 0; i < data.length; i++) {
      switch (source) {
        case 'open':
          prices[i] = data[i].open;
          break;
        case 'high':
          prices[i] = data[i].high;
          break;
        case 'low':
          prices[i] = data[i].low;
          break;
        case 'close':
          prices[i] = data[i].close;
          break;
        case 'hlc3':
          prices[i] = (data[i].high + data[i].low + data[i].close) / 3;
          break;
        case 'ohlc4':
          prices[i] = (data[i].open + data[i].high + data[i].low + data[i].close) / 4;
          break;
      }
    }

    return prices;
  }

  /**
   * Helper: Extract volumes
   */
  protected extractVolumes(data: OHLCVData[]): Float64Array {
    const volumes = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      volumes[i] = data[i].volume;
    }
    return volumes;
  }

  /**
   * Helper: Extract timestamps
   */
  protected extractTimestamps(data: OHLCVData[]): number[] {
    return data.map((d) => {
      if (typeof d.time === 'number') return d.time;
      if (typeof d.time === 'string') return new Date(d.time).getTime() / 1000;
      // BusinessDay format: { year, month, day }
      const bd = d.time as any;
      return new Date(bd.year, bd.month - 1, bd.day).getTime() / 1000;
    });
  }

  /**
   * Helper: Calculate standard deviation
   */
  protected calculateStdDev(values: Float64Array, mean: number): number {
    let sum = 0;
    for (let i = 0; i < values.length; i++) {
      const diff = values[i] - mean;
      sum += diff * diff;
    }
    return Math.sqrt(sum / values.length);
  }

  /**
   * Helper: Fill array with NaN for warm-up period
   */
  protected fillNaN(length: number): number[] {
    return new Array(length).fill(NaN);
  }
}

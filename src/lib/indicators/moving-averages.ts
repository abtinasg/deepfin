import { OHLCVData } from '@/types/chart';
import { IndicatorResult, IndicatorParams } from '@/types/indicators';
import { Indicator } from './base';

/**
 * Simple Moving Average (SMA)
 * Calculates the average of prices over a specified period
 */
export class SMA extends Indicator {
  constructor() {
    super({
      name: 'Simple Moving Average',
      shortName: 'SMA',
      type: 'overlay',
      description: 'Average price over a specified number of periods',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 1,
          max: 500,
          step: 1,
          description: 'Number of periods to average',
        },
        {
          name: 'source',
          type: 'select',
          default: 'close',
          options: [
            { label: 'Close', value: 'close' },
            { label: 'Open', value: 'open' },
            { label: 'High', value: 'high' },
            { label: 'Low', value: 'low' },
            { label: 'HLC3', value: 'hlc3' },
            { label: 'OHLC4', value: 'ohlc4' },
          ],
          description: 'Price source for calculation',
        },
      ],
      outputs: [
        {
          name: 'SMA',
          color: '#2962FF',
          lineWidth: 2,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, source } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, source);
    const result = new Float64Array(data.length);

    // Calculate SMA
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result[i] = NaN;
        continue;
      }

      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += prices[i - j];
      }
      result[i] = sum / period;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Exponential Moving Average (EMA)
 * Gives more weight to recent prices
 */
export class EMA extends Indicator {
  constructor() {
    super({
      name: 'Exponential Moving Average',
      shortName: 'EMA',
      type: 'overlay',
      description: 'Moving average that gives more weight to recent prices',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 1,
          max: 500,
          step: 1,
          description: 'Number of periods',
        },
        {
          name: 'source',
          type: 'select',
          default: 'close',
          options: [
            { label: 'Close', value: 'close' },
            { label: 'Open', value: 'open' },
            { label: 'High', value: 'high' },
            { label: 'Low', value: 'low' },
            { label: 'HLC3', value: 'hlc3' },
            { label: 'OHLC4', value: 'ohlc4' },
          ],
        },
      ],
      outputs: [
        {
          name: 'EMA',
          color: '#FF6D00',
          lineWidth: 2,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, source } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, source);
    const result = new Float64Array(data.length);
    const multiplier = 2 / (period + 1);

    // Initialize with SMA
    let sum = 0;
    for (let i = 0; i < period; i++) {
      if (i < data.length) {
        sum += prices[i];
      }
    }
    const initialSMA = sum / period;
    result[period - 1] = initialSMA;

    // Calculate EMA
    for (let i = period; i < data.length; i++) {
      result[i] = (prices[i] - result[i - 1]) * multiplier + result[i - 1];
    }

    // Fill initial values with NaN
    for (let i = 0; i < period - 1; i++) {
      result[i] = NaN;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Weighted Moving Average (WMA)
 * Assigns linear weights to prices, with most recent having highest weight
 */
export class WMA extends Indicator {
  constructor() {
    super({
      name: 'Weighted Moving Average',
      shortName: 'WMA',
      type: 'overlay',
      description: 'Moving average with linear weights favoring recent data',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 1,
          max: 500,
          step: 1,
        },
        {
          name: 'source',
          type: 'select',
          default: 'close',
          options: [
            { label: 'Close', value: 'close' },
            { label: 'Open', value: 'open' },
            { label: 'High', value: 'high' },
            { label: 'Low', value: 'low' },
            { label: 'HLC3', value: 'hlc3' },
            { label: 'OHLC4', value: 'ohlc4' },
          ],
        },
      ],
      outputs: [
        {
          name: 'WMA',
          color: '#00BCD4',
          lineWidth: 2,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, source } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, source);
    const result = new Float64Array(data.length);
    const weightSum = (period * (period + 1)) / 2;

    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) {
        result[i] = NaN;
        continue;
      }

      let sum = 0;
      for (let j = 0; j < period; j++) {
        const weight = period - j;
        sum += prices[i - j] * weight;
      }
      result[i] = sum / weightSum;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Double Exponential Moving Average (DEMA)
 * Reduces lag of traditional EMA
 */
export class DEMA extends Indicator {
  private ema: EMA;

  constructor() {
    super({
      name: 'Double Exponential Moving Average',
      shortName: 'DEMA',
      type: 'overlay',
      description: 'Faster EMA with reduced lag',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 1,
          max: 500,
          step: 1,
        },
        {
          name: 'source',
          type: 'select',
          default: 'close',
          options: [
            { label: 'Close', value: 'close' },
            { label: 'Open', value: 'open' },
            { label: 'High', value: 'high' },
            { label: 'Low', value: 'low' },
            { label: 'HLC3', value: 'hlc3' },
            { label: 'OHLC4', value: 'ohlc4' },
          ],
        },
      ],
      outputs: [
        {
          name: 'DEMA',
          color: '#9C27B0',
          lineWidth: 2,
        },
      ],
    });
    this.ema = new EMA();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, source } = { ...this.getDefaultParams(), ...params };

    // Calculate first EMA
    const ema1Result = this.ema.calculate(data, { period, source });
    const ema1Values = ema1Result.values[0];

    // Convert back to OHLCV format for second EMA
    const ema1Data: OHLCVData[] = data.map((d, i) => ({
      ...d,
      close: ema1Values[i] || 0,
      open: ema1Values[i] || 0,
      high: ema1Values[i] || 0,
      low: ema1Values[i] || 0,
    }));

    // Calculate second EMA
    const ema2Result = this.ema.calculate(ema1Data, { period, source: 'close' });
    const ema2Values = ema2Result.values[0];

    // DEMA = 2 * EMA1 - EMA2
    const result = ema1Values.map((ema1, i) => {
      if (isNaN(ema1) || isNaN(ema2Values[i])) return NaN;
      return 2 * ema1 - ema2Values[i];
    });

    return {
      values: [result],
      timestamps: this.extractTimestamps(data),
    };
  }
}

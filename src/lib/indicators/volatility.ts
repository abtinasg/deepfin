import { OHLCVData } from '@/types/chart';
import { IndicatorResult, IndicatorParams } from '@/types/indicators';
import { Indicator } from './base';
import { SMA, EMA } from './moving-averages';

/**
 * Bollinger Bands
 * Volatility bands placed above and below a moving average
 */
export class BollingerBands extends Indicator {
  private sma: SMA;

  constructor() {
    super({
      name: 'Bollinger Bands',
      shortName: 'BB',
      type: 'overlay',
      description: 'Volatility bands showing standard deviation from moving average',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 2,
          max: 200,
          step: 1,
          description: 'Moving average period',
        },
        {
          name: 'stdDev',
          type: 'number',
          default: 2,
          min: 0.5,
          max: 5,
          step: 0.1,
          description: 'Number of standard deviations',
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
          name: 'Upper',
          color: '#2196F3',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
        {
          name: 'Middle',
          color: '#FF9800',
          lineWidth: 2,
        },
        {
          name: 'Lower',
          color: '#2196F3',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
      ],
    });
    this.sma = new SMA();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, stdDev, source } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, source);

    // Calculate middle band (SMA)
    const middleResult = this.sma.calculate(data, { period, source });
    const middle = new Float64Array(middleResult.values[0]);

    // Calculate upper and lower bands
    const upper = new Float64Array(data.length);
    const lower = new Float64Array(data.length);

    for (let i = period - 1; i < data.length; i++) {
      // Get prices for period
      const periodPrices = new Float64Array(period);
      for (let j = 0; j < period; j++) {
        periodPrices[j] = prices[i - j];
      }

      // Calculate standard deviation
      const deviation = this.calculateStdDev(periodPrices, middle[i]);

      upper[i] = middle[i] + stdDev * deviation;
      lower[i] = middle[i] - stdDev * deviation;
    }

    // Fill initial values with NaN
    for (let i = 0; i < period - 1; i++) {
      upper[i] = NaN;
      lower[i] = NaN;
    }

    return {
      values: [Array.from(upper), Array.from(middle), Array.from(lower)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Average True Range (ATR)
 * Measures market volatility
 */
export class ATR extends Indicator {
  constructor() {
    super({
      name: 'Average True Range',
      shortName: 'ATR',
      type: 'oscillator',
      description: 'Volatility indicator measuring average true range',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 14,
          min: 1,
          max: 200,
          step: 1,
          description: 'Smoothing period',
        },
      ],
      outputs: [
        {
          name: 'ATR',
          color: '#FF5722',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 100,
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period } = { ...this.getDefaultParams(), ...params };
    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');
    const closes = this.extractPrices(data, 'close');

    // Calculate True Range
    const tr = new Float64Array(data.length);
    for (let i = 1; i < data.length; i++) {
      const range1 = highs[i] - lows[i];
      const range2 = Math.abs(highs[i] - closes[i - 1]);
      const range3 = Math.abs(lows[i] - closes[i - 1]);
      tr[i] = Math.max(range1, range2, range3);
    }
    tr[0] = highs[0] - lows[0];

    // Calculate ATR using Wilder's smoothing
    const atr = new Float64Array(data.length);

    // Initial ATR is SMA of TR
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += tr[i];
    }
    atr[period - 1] = sum / period;

    // Smoothed ATR
    for (let i = period; i < data.length; i++) {
      atr[i] = (atr[i - 1] * (period - 1) + tr[i]) / period;
    }

    // Fill initial values with NaN
    for (let i = 0; i < period - 1; i++) {
      atr[i] = NaN;
    }

    return {
      values: [Array.from(atr)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Keltner Channels
 * Volatility-based envelope similar to Bollinger Bands but using ATR
 */
export class KeltnerChannels extends Indicator {
  private ema: EMA;
  private atr: ATR;

  constructor() {
    super({
      name: 'Keltner Channels',
      shortName: 'KC',
      type: 'overlay',
      description: 'Volatility channels using EMA and ATR',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 2,
          max: 200,
          step: 1,
          description: 'EMA period',
        },
        {
          name: 'atrPeriod',
          type: 'number',
          default: 10,
          min: 1,
          max: 200,
          step: 1,
          description: 'ATR period',
        },
        {
          name: 'multiplier',
          type: 'number',
          default: 2,
          min: 0.5,
          max: 5,
          step: 0.1,
          description: 'ATR multiplier',
        },
      ],
      outputs: [
        {
          name: 'Upper',
          color: '#4CAF50',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
        {
          name: 'Middle',
          color: '#FF9800',
          lineWidth: 2,
        },
        {
          name: 'Lower',
          color: '#4CAF50',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
      ],
    });
    this.ema = new EMA();
    this.atr = new ATR();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, atrPeriod, multiplier } = { ...this.getDefaultParams(), ...params };

    // Calculate middle line (EMA)
    const emaResult = this.ema.calculate(data, { period, source: 'close' });
    const middle = emaResult.values[0];

    // Calculate ATR
    const atrResult = this.atr.calculate(data, { period: atrPeriod });
    const atrValues = atrResult.values[0];

    // Calculate channels
    const upper = middle.map((m, i) =>
      isNaN(m) || isNaN(atrValues[i]) ? NaN : m + multiplier * atrValues[i]
    );
    const lower = middle.map((m, i) =>
      isNaN(m) || isNaN(atrValues[i]) ? NaN : m - multiplier * atrValues[i]
    );

    return {
      values: [upper, middle, lower],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Standard Deviation
 * Measures price volatility
 */
export class StandardDeviation extends Indicator {
  private sma: SMA;

  constructor() {
    super({
      name: 'Standard Deviation',
      shortName: 'StdDev',
      type: 'oscillator',
      description: 'Statistical measure of volatility',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 2,
          max: 200,
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
          ],
        },
      ],
      outputs: [
        {
          name: 'StdDev',
          color: '#9C27B0',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 100,
      },
    });
    this.sma = new SMA();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, source } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, source);

    // Calculate SMA
    const smaResult = this.sma.calculate(data, { period, source });
    const smaValues = smaResult.values[0];

    const result = new Float64Array(data.length);

    for (let i = period - 1; i < data.length; i++) {
      const periodPrices = new Float64Array(period);
      for (let j = 0; j < period; j++) {
        periodPrices[j] = prices[i - j];
      }

      result[i] = this.calculateStdDev(periodPrices, smaValues[i]);
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

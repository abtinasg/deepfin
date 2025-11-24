import { OHLCVData } from '@/types/chart';
import { IndicatorResult, IndicatorParams } from '@/types/indicators';
import { Indicator } from './base';
import { EMA } from './moving-averages';

/**
 * Relative Strength Index (RSI)
 * Momentum oscillator measuring speed and magnitude of price changes
 * Range: 0-100, typically overbought > 70, oversold < 30
 */
export class RSI extends Indicator {
  constructor() {
    super({
      name: 'Relative Strength Index',
      shortName: 'RSI',
      type: 'oscillator',
      description: 'Momentum oscillator measuring overbought/oversold conditions',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 14,
          min: 2,
          max: 100,
          step: 1,
          description: 'Number of periods for RSI calculation',
        },
        {
          name: 'overbought',
          type: 'number',
          default: 70,
          min: 50,
          max: 90,
          step: 1,
          description: 'Overbought threshold',
        },
        {
          name: 'oversold',
          type: 'number',
          default: 30,
          min: 10,
          max: 50,
          step: 1,
          description: 'Oversold threshold',
        },
      ],
      outputs: [
        {
          name: 'RSI',
          color: '#7E57C2',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 150,
        horizontalLines: [
          { value: 70, color: '#EF5350', style: 'dashed' },
          { value: 50, color: '#9E9E9E', style: 'dotted' },
          { value: 30, color: '#66BB6A', style: 'dashed' },
        ],
        minValue: 0,
        maxValue: 100,
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period, overbought, oversold } = { ...this.getDefaultParams(), ...params };
    const prices = this.extractPrices(data, 'close');
    const result = new Float64Array(data.length);

    // Calculate price changes
    const changes = new Float64Array(data.length);
    for (let i = 1; i < data.length; i++) {
      changes[i] = prices[i] - prices[i - 1];
    }

    // Separate gains and losses
    const gains = new Float64Array(data.length);
    const losses = new Float64Array(data.length);
    for (let i = 1; i < data.length; i++) {
      if (changes[i] > 0) {
        gains[i] = changes[i];
        losses[i] = 0;
      } else {
        gains[i] = 0;
        losses[i] = Math.abs(changes[i]);
      }
    }

    // Calculate initial average gain/loss (SMA for first period)
    let avgGain = 0;
    let avgLoss = 0;
    for (let i = 1; i <= period; i++) {
      avgGain += gains[i];
      avgLoss += losses[i];
    }
    avgGain /= period;
    avgLoss /= period;

    // Calculate RSI
    for (let i = period; i < data.length; i++) {
      if (i === period) {
        // First RSI value
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result[i] = 100 - 100 / (1 + rs);
      } else {
        // Smoothed average (Wilder's smoothing method)
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        result[i] = 100 - 100 / (1 + rs);
      }
    }

    // Fill initial values with NaN
    for (let i = 0; i < period; i++) {
      result[i] = NaN;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
      metadata: {
        overbought,
        oversold,
      },
    };
  }
}

/**
 * Stochastic Oscillator
 * Compares closing price to price range over a given period
 * Outputs %K (fast) and %D (slow/signal) lines
 */
export class Stochastic extends Indicator {
  private sma: any;

  constructor() {
    super({
      name: 'Stochastic Oscillator',
      shortName: 'Stoch',
      type: 'oscillator',
      description: 'Momentum indicator comparing close to price range',
      inputs: [
        {
          name: 'kPeriod',
          type: 'number',
          default: 14,
          min: 1,
          max: 100,
          step: 1,
          description: '%K period (fast stochastic)',
        },
        {
          name: 'dPeriod',
          type: 'number',
          default: 3,
          min: 1,
          max: 100,
          step: 1,
          description: '%D period (signal line)',
        },
        {
          name: 'smooth',
          type: 'number',
          default: 3,
          min: 1,
          max: 100,
          step: 1,
          description: 'Smoothing period',
        },
      ],
      outputs: [
        {
          name: '%K',
          color: '#2196F3',
          lineWidth: 2,
        },
        {
          name: '%D',
          color: '#FF5722',
          lineWidth: 2,
          lineStyle: 'dashed',
        },
      ],
      panelOptions: {
        height: 150,
        horizontalLines: [
          { value: 80, color: '#EF5350', style: 'dashed' },
          { value: 50, color: '#9E9E9E', style: 'dotted' },
          { value: 20, color: '#66BB6A', style: 'dashed' },
        ],
        minValue: 0,
        maxValue: 100,
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { kPeriod, dPeriod, smooth } = { ...this.getDefaultParams(), ...params };

    // Extract prices
    const closes = this.extractPrices(data, 'close');
    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');

    // Calculate raw %K
    const rawK = new Float64Array(data.length);
    for (let i = kPeriod - 1; i < data.length; i++) {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;

      for (let j = 0; j < kPeriod; j++) {
        highestHigh = Math.max(highestHigh, highs[i - j]);
        lowestLow = Math.min(lowestLow, lows[i - j]);
      }

      const range = highestHigh - lowestLow;
      rawK[i] = range === 0 ? 50 : ((closes[i] - lowestLow) / range) * 100;
    }

    // Smooth %K
    const smoothedK = new Float64Array(data.length);
    for (let i = kPeriod + smooth - 2; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < smooth; j++) {
        sum += rawK[i - j];
      }
      smoothedK[i] = sum / smooth;
    }

    // Calculate %D (SMA of %K)
    const d = new Float64Array(data.length);
    for (let i = kPeriod + smooth + dPeriod - 3; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < dPeriod; j++) {
        sum += smoothedK[i - j];
      }
      d[i] = sum / dPeriod;
    }

    // Fill initial values with NaN
    const warmup = kPeriod + smooth - 2;
    for (let i = 0; i < warmup; i++) {
      smoothedK[i] = NaN;
      d[i] = NaN;
    }
    for (let i = warmup; i < kPeriod + smooth + dPeriod - 3; i++) {
      d[i] = NaN;
    }

    return {
      values: [Array.from(smoothedK), Array.from(d)],
      timestamps: this.extractTimestamps(data),
      metadata: {
        overbought: 80,
        oversold: 20,
      },
    };
  }
}

/**
 * Commodity Channel Index (CCI)
 * Measures deviation of price from statistical mean
 */
export class CCI extends Indicator {
  constructor() {
    super({
      name: 'Commodity Channel Index',
      shortName: 'CCI',
      type: 'oscillator',
      description: 'Identifies cyclical trends in price',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 20,
          min: 1,
          max: 200,
          step: 1,
        },
      ],
      outputs: [
        {
          name: 'CCI',
          color: '#FF9800',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 150,
        horizontalLines: [
          { value: 100, color: '#EF5350', style: 'dashed' },
          { value: 0, color: '#9E9E9E', style: 'solid' },
          { value: -100, color: '#66BB6A', style: 'dashed' },
        ],
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period } = { ...this.getDefaultParams(), ...params };
    const typicalPrices = new Float64Array(data.length);
    const result = new Float64Array(data.length);

    // Calculate Typical Price (HLC/3)
    for (let i = 0; i < data.length; i++) {
      typicalPrices[i] = (data[i].high + data[i].low + data[i].close) / 3;
    }

    // Calculate CCI
    for (let i = period - 1; i < data.length; i++) {
      // SMA of typical price
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += typicalPrices[i - j];
      }
      const sma = sum / period;

      // Mean deviation
      let devSum = 0;
      for (let j = 0; j < period; j++) {
        devSum += Math.abs(typicalPrices[i - j] - sma);
      }
      const meanDev = devSum / period;

      // CCI = (Typical Price - SMA) / (0.015 * Mean Deviation)
      result[i] = meanDev === 0 ? 0 : (typicalPrices[i] - sma) / (0.015 * meanDev);
    }

    // Fill initial values with NaN
    for (let i = 0; i < period - 1; i++) {
      result[i] = NaN;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
      metadata: {
        overbought: 100,
        oversold: -100,
      },
    };
  }
}

/**
 * Williams %R
 * Momentum indicator similar to Stochastic but inverted
 */
export class WilliamsR extends Indicator {
  constructor() {
    super({
      name: "Williams %R",
      shortName: '%R',
      type: 'oscillator',
      description: 'Momentum oscillator measuring overbought/oversold levels',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 14,
          min: 1,
          max: 100,
          step: 1,
        },
      ],
      outputs: [
        {
          name: '%R',
          color: '#4CAF50',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 150,
        horizontalLines: [
          { value: -20, color: '#EF5350', style: 'dashed' },
          { value: -50, color: '#9E9E9E', style: 'dotted' },
          { value: -80, color: '#66BB6A', style: 'dashed' },
        ],
        minValue: -100,
        maxValue: 0,
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period } = { ...this.getDefaultParams(), ...params };
    const closes = this.extractPrices(data, 'close');
    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');
    const result = new Float64Array(data.length);

    for (let i = period - 1; i < data.length; i++) {
      let highestHigh = -Infinity;
      let lowestLow = Infinity;

      for (let j = 0; j < period; j++) {
        highestHigh = Math.max(highestHigh, highs[i - j]);
        lowestLow = Math.min(lowestLow, lows[i - j]);
      }

      const range = highestHigh - lowestLow;
      result[i] = range === 0 ? -50 : ((highestHigh - closes[i]) / range) * -100;
    }

    // Fill initial values with NaN
    for (let i = 0; i < period - 1; i++) {
      result[i] = NaN;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
      metadata: {
        overbought: -20,
        oversold: -80,
      },
    };
  }
}

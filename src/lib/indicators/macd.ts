import { OHLCVData } from '@/types/chart';
import { IndicatorResult, IndicatorParams } from '@/types/indicators';
import { Indicator } from './base';
import { EMA } from './moving-averages';

/**
 * Moving Average Convergence Divergence (MACD)
 * Trend-following momentum indicator
 * Returns three values: MACD line, Signal line, and Histogram
 */
export class MACD extends Indicator {
  private ema: EMA;

  constructor() {
    super({
      name: 'Moving Average Convergence Divergence',
      shortName: 'MACD',
      type: 'oscillator',
      description: 'Trend-following momentum indicator showing relationship between two EMAs',
      inputs: [
        {
          name: 'fastPeriod',
          type: 'number',
          default: 12,
          min: 2,
          max: 100,
          step: 1,
          description: 'Fast EMA period',
        },
        {
          name: 'slowPeriod',
          type: 'number',
          default: 26,
          min: 2,
          max: 200,
          step: 1,
          description: 'Slow EMA period',
        },
        {
          name: 'signalPeriod',
          type: 'number',
          default: 9,
          min: 2,
          max: 100,
          step: 1,
          description: 'Signal line EMA period',
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
          name: 'MACD',
          color: '#2196F3',
          lineWidth: 2,
        },
        {
          name: 'Signal',
          color: '#FF5722',
          lineWidth: 2,
          lineStyle: 'dashed',
        },
        {
          name: 'Histogram',
          color: '#9E9E9E',
          lineWidth: 1,
        },
      ],
      panelOptions: {
        height: 150,
        horizontalLines: [{ value: 0, color: '#9E9E9E', style: 'solid' }],
      },
    });
    this.ema = new EMA();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { fastPeriod, slowPeriod, signalPeriod, source } = {
      ...this.getDefaultParams(),
      ...params,
    };

    // Calculate fast EMA
    const fastEMA = this.ema.calculate(data, { period: fastPeriod, source });
    const fastValues = fastEMA.values[0];

    // Calculate slow EMA
    const slowEMA = this.ema.calculate(data, { period: slowPeriod, source });
    const slowValues = slowEMA.values[0];

    // Calculate MACD line (fast EMA - slow EMA)
    const macdLine = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      if (isNaN(fastValues[i]) || isNaN(slowValues[i])) {
        macdLine[i] = NaN;
      } else {
        macdLine[i] = fastValues[i] - slowValues[i];
      }
    }

    // Convert MACD line to OHLCV format for signal line calculation
    const macdData: OHLCVData[] = data.map((d, i) => ({
      ...d,
      close: macdLine[i] || 0,
      open: macdLine[i] || 0,
      high: macdLine[i] || 0,
      low: macdLine[i] || 0,
    }));

    // Calculate signal line (EMA of MACD line)
    const signalEMA = this.ema.calculate(macdData, {
      period: signalPeriod,
      source: 'close',
    });
    const signalValues = signalEMA.values[0];

    // Calculate histogram (MACD - Signal)
    const histogram = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      if (isNaN(macdLine[i]) || isNaN(signalValues[i])) {
        histogram[i] = NaN;
      } else {
        histogram[i] = macdLine[i] - signalValues[i];
      }
    }

    // Detect crossovers for signals
    const signals: Array<{ timestamp: number; type: 'buy' | 'sell'; price: number }> = [];
    for (let i = 1; i < data.length; i++) {
      if (
        !isNaN(macdLine[i]) &&
        !isNaN(signalValues[i]) &&
        !isNaN(macdLine[i - 1]) &&
        !isNaN(signalValues[i - 1])
      ) {
        // Bullish crossover: MACD crosses above Signal
        if (macdLine[i - 1] <= signalValues[i - 1] && macdLine[i] > signalValues[i]) {
          signals.push({
            timestamp: this.extractTimestamps(data)[i],
            type: 'buy',
            price: data[i].close,
          });
        }
        // Bearish crossover: MACD crosses below Signal
        else if (macdLine[i - 1] >= signalValues[i - 1] && macdLine[i] < signalValues[i]) {
          signals.push({
            timestamp: this.extractTimestamps(data)[i],
            type: 'sell',
            price: data[i].close,
          });
        }
      }
    }

    return {
      values: [Array.from(macdLine), Array.from(signalValues), Array.from(histogram)],
      timestamps: this.extractTimestamps(data),
      metadata: {
        signals,
      },
    };
  }
}

/**
 * MACD Histogram Only
 * Just the histogram component of MACD for cleaner visualization
 */
export class MACDHistogram extends Indicator {
  private macd: MACD;

  constructor() {
    super({
      name: 'MACD Histogram',
      shortName: 'MACD Hist',
      type: 'oscillator',
      description: 'MACD histogram showing momentum strength',
      inputs: [
        {
          name: 'fastPeriod',
          type: 'number',
          default: 12,
          min: 2,
          max: 100,
          step: 1,
        },
        {
          name: 'slowPeriod',
          type: 'number',
          default: 26,
          min: 2,
          max: 200,
          step: 1,
        },
        {
          name: 'signalPeriod',
          type: 'number',
          default: 9,
          min: 2,
          max: 100,
          step: 1,
        },
      ],
      outputs: [
        {
          name: 'Histogram',
          color: '#4CAF50',
          lineWidth: 3,
        },
      ],
      panelOptions: {
        height: 100,
        horizontalLines: [{ value: 0, color: '#9E9E9E', style: 'solid' }],
      },
    });
    this.macd = new MACD();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const macdResult = this.macd.calculate(data, params);
    // Return only histogram (3rd value)
    return {
      values: [macdResult.values[2]],
      timestamps: macdResult.timestamps,
      metadata: macdResult.metadata,
    };
  }
}

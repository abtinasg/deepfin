import { OHLCVData } from '@/types/chart';
import { IndicatorResult, IndicatorParams } from '@/types/indicators';
import { Indicator } from './base';
import { ATR } from './volatility';
import { EMA } from './moving-averages';

/**
 * Average Directional Index (ADX)
 * Measures trend strength (not direction)
 * ADX > 25 indicates strong trend, < 20 indicates weak trend
 */
export class ADX extends Indicator {
  private atr: ATR;

  constructor() {
    super({
      name: 'Average Directional Index',
      shortName: 'ADX',
      type: 'oscillator',
      description: 'Measures trend strength regardless of direction',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 14,
          min: 2,
          max: 100,
          step: 1,
          description: 'Smoothing period',
        },
      ],
      outputs: [
        {
          name: 'ADX',
          color: '#000000',
          lineWidth: 2,
        },
        {
          name: '+DI',
          color: '#4CAF50',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
        {
          name: '-DI',
          color: '#F44336',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
      ],
      panelOptions: {
        height: 150,
        horizontalLines: [
          { value: 25, color: '#4CAF50', style: 'dashed' },
          { value: 20, color: '#FFC107', style: 'dotted' },
        ],
        minValue: 0,
        maxValue: 100,
      },
    });
    this.atr = new ATR();
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { period } = { ...this.getDefaultParams(), ...params };
    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');

    // Calculate ATR
    const atrResult = this.atr.calculate(data, { period });
    const atrValues = new Float64Array(atrResult.values[0]);

    // Calculate +DM and -DM
    const plusDM = new Float64Array(data.length);
    const minusDM = new Float64Array(data.length);

    for (let i = 1; i < data.length; i++) {
      const upMove = highs[i] - highs[i - 1];
      const downMove = lows[i - 1] - lows[i];

      if (upMove > downMove && upMove > 0) {
        plusDM[i] = upMove;
      } else {
        plusDM[i] = 0;
      }

      if (downMove > upMove && downMove > 0) {
        minusDM[i] = downMove;
      } else {
        minusDM[i] = 0;
      }
    }

    // Smooth +DM and -DM (Wilder's smoothing)
    const smoothedPlusDM = new Float64Array(data.length);
    const smoothedMinusDM = new Float64Array(data.length);

    // Initial sum
    let plusSum = 0;
    let minusSum = 0;
    for (let i = 1; i <= period; i++) {
      plusSum += plusDM[i];
      minusSum += minusDM[i];
    }
    smoothedPlusDM[period] = plusSum;
    smoothedMinusDM[period] = minusSum;

    // Smooth
    for (let i = period + 1; i < data.length; i++) {
      smoothedPlusDM[i] = smoothedPlusDM[i - 1] - smoothedPlusDM[i - 1] / period + plusDM[i];
      smoothedMinusDM[i] = smoothedMinusDM[i - 1] - smoothedMinusDM[i - 1] / period + minusDM[i];
    }

    // Calculate +DI and -DI
    const plusDI = new Float64Array(data.length);
    const minusDI = new Float64Array(data.length);

    for (let i = period; i < data.length; i++) {
      plusDI[i] = atrValues[i] > 0 ? (smoothedPlusDM[i] / atrValues[i]) * 100 : 0;
      minusDI[i] = atrValues[i] > 0 ? (smoothedMinusDM[i] / atrValues[i]) * 100 : 0;
    }

    // Calculate DX
    const dx = new Float64Array(data.length);
    for (let i = period; i < data.length; i++) {
      const diSum = plusDI[i] + minusDI[i];
      const diDiff = Math.abs(plusDI[i] - minusDI[i]);
      dx[i] = diSum > 0 ? (diDiff / diSum) * 100 : 0;
    }

    // Calculate ADX (smoothed DX)
    const adx = new Float64Array(data.length);
    let dxSum = 0;
    for (let i = period; i < period * 2; i++) {
      dxSum += dx[i];
    }
    adx[period * 2 - 1] = dxSum / period;

    for (let i = period * 2; i < data.length; i++) {
      adx[i] = (adx[i - 1] * (period - 1) + dx[i]) / period;
    }

    // Fill initial values with NaN
    for (let i = 0; i < period * 2 - 1; i++) {
      adx[i] = NaN;
      if (i < period) {
        plusDI[i] = NaN;
        minusDI[i] = NaN;
      }
    }

    return {
      values: [Array.from(adx), Array.from(plusDI), Array.from(minusDI)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Parabolic SAR (Stop and Reverse)
 * Trend-following indicator providing entry/exit points
 */
export class ParabolicSAR extends Indicator {
  constructor() {
    super({
      name: 'Parabolic SAR',
      shortName: 'PSAR',
      type: 'overlay',
      description: 'Trend-following indicator showing potential reversal points',
      inputs: [
        {
          name: 'acceleration',
          type: 'number',
          default: 0.02,
          min: 0.001,
          max: 0.2,
          step: 0.001,
          description: 'Acceleration factor',
        },
        {
          name: 'maximum',
          type: 'number',
          default: 0.2,
          min: 0.01,
          max: 1,
          step: 0.01,
          description: 'Maximum acceleration',
        },
      ],
      outputs: [
        {
          name: 'SAR',
          color: '#FF5722',
          lineWidth: 1,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { acceleration, maximum } = { ...this.getDefaultParams(), ...params };
    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');
    const result = new Float64Array(data.length);
    const signals: Array<{ timestamp: number; type: 'buy' | 'sell'; price: number }> = [];

    if (data.length < 2) {
      return {
        values: [Array.from(result)],
        timestamps: this.extractTimestamps(data),
      };
    }

    // Initialize
    let isLong = highs[1] > highs[0];
    let sar = isLong ? lows[0] : highs[0];
    let ep = isLong ? highs[0] : lows[0]; // Extreme Point
    let af = acceleration; // Acceleration Factor

    result[0] = sar;

    for (let i = 1; i < data.length; i++) {
      // Calculate new SAR
      sar = sar + af * (ep - sar);

      // Check for reversal
      let reverse = false;

      if (isLong) {
        if (lows[i] < sar) {
          reverse = true;
          sar = ep;
          ep = lows[i];
          af = acceleration;
          signals.push({
            timestamp: this.extractTimestamps(data)[i],
            type: 'sell',
            price: data[i].close,
          });
        } else {
          // Update EP and AF
          if (highs[i] > ep) {
            ep = highs[i];
            af = Math.min(af + acceleration, maximum);
          }
          // Ensure SAR is below last two lows
          sar = Math.min(sar, lows[i - 1]);
          if (i > 1) sar = Math.min(sar, lows[i - 2]);
        }
      } else {
        if (highs[i] > sar) {
          reverse = true;
          sar = ep;
          ep = highs[i];
          af = acceleration;
          signals.push({
            timestamp: this.extractTimestamps(data)[i],
            type: 'buy',
            price: data[i].close,
          });
        } else {
          // Update EP and AF
          if (lows[i] < ep) {
            ep = lows[i];
            af = Math.min(af + acceleration, maximum);
          }
          // Ensure SAR is above last two highs
          sar = Math.max(sar, highs[i - 1]);
          if (i > 1) sar = Math.max(sar, highs[i - 2]);
        }
      }

      if (reverse) {
        isLong = !isLong;
      }

      result[i] = sar;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
      metadata: { signals },
    };
  }
}

/**
 * Ichimoku Cloud
 * Comprehensive trend indicator with multiple components
 */
export class Ichimoku extends Indicator {
  constructor() {
    super({
      name: 'Ichimoku Cloud',
      shortName: 'Ichimoku',
      type: 'overlay',
      description: 'Comprehensive trend indicator with support/resistance levels',
      inputs: [
        {
          name: 'conversionPeriod',
          type: 'number',
          default: 9,
          min: 1,
          max: 100,
          step: 1,
          description: 'Tenkan-sen (Conversion Line) period',
        },
        {
          name: 'basePeriod',
          type: 'number',
          default: 26,
          min: 1,
          max: 100,
          step: 1,
          description: 'Kijun-sen (Base Line) period',
        },
        {
          name: 'laggingSpan2Period',
          type: 'number',
          default: 52,
          min: 1,
          max: 200,
          step: 1,
          description: 'Senkou Span B period',
        },
        {
          name: 'displacement',
          type: 'number',
          default: 26,
          min: 1,
          max: 100,
          step: 1,
          description: 'Cloud displacement',
        },
      ],
      outputs: [
        {
          name: 'Tenkan-sen',
          color: '#F44336',
          lineWidth: 1,
        },
        {
          name: 'Kijun-sen',
          color: '#2196F3',
          lineWidth: 1,
        },
        {
          name: 'Senkou Span A',
          color: '#4CAF50',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
        {
          name: 'Senkou Span B',
          color: '#FF5722',
          lineWidth: 1,
          lineStyle: 'dashed',
        },
        {
          name: 'Chikou Span',
          color: '#9C27B0',
          lineWidth: 1,
          lineStyle: 'dotted',
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { conversionPeriod, basePeriod, laggingSpan2Period, displacement } = {
      ...this.getDefaultParams(),
      ...params,
    };

    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');
    const closes = this.extractPrices(data, 'close');

    const tenkan = new Float64Array(data.length);
    const kijun = new Float64Array(data.length);
    const senkouA = new Float64Array(data.length);
    const senkouB = new Float64Array(data.length);
    const chikou = new Float64Array(data.length);

    // Calculate Tenkan-sen (Conversion Line)
    for (let i = conversionPeriod - 1; i < data.length; i++) {
      let highest = -Infinity;
      let lowest = Infinity;
      for (let j = 0; j < conversionPeriod; j++) {
        highest = Math.max(highest, highs[i - j]);
        lowest = Math.min(lowest, lows[i - j]);
      }
      tenkan[i] = (highest + lowest) / 2;
    }

    // Calculate Kijun-sen (Base Line)
    for (let i = basePeriod - 1; i < data.length; i++) {
      let highest = -Infinity;
      let lowest = Infinity;
      for (let j = 0; j < basePeriod; j++) {
        highest = Math.max(highest, highs[i - j]);
        lowest = Math.min(lowest, lows[i - j]);
      }
      kijun[i] = (highest + lowest) / 2;
    }

    // Calculate Senkou Span A (Leading Span A) - projected forward
    for (let i = 0; i < data.length - displacement; i++) {
      if (!isNaN(tenkan[i]) && !isNaN(kijun[i])) {
        senkouA[i + displacement] = (tenkan[i] + kijun[i]) / 2;
      }
    }

    // Calculate Senkou Span B (Leading Span B) - projected forward
    for (let i = laggingSpan2Period - 1; i < data.length - displacement; i++) {
      let highest = -Infinity;
      let lowest = Infinity;
      for (let j = 0; j < laggingSpan2Period; j++) {
        highest = Math.max(highest, highs[i - j]);
        lowest = Math.min(lowest, lows[i - j]);
      }
      senkouB[i + displacement] = (highest + lowest) / 2;
    }

    // Calculate Chikou Span (Lagging Span) - shifted backward
    for (let i = displacement; i < data.length; i++) {
      chikou[i - displacement] = closes[i];
    }

    // Fill initial values with NaN
    for (let i = 0; i < conversionPeriod - 1; i++) {
      tenkan[i] = NaN;
    }
    for (let i = 0; i < basePeriod - 1; i++) {
      kijun[i] = NaN;
    }

    return {
      values: [
        Array.from(tenkan),
        Array.from(kijun),
        Array.from(senkouA),
        Array.from(senkouB),
        Array.from(chikou),
      ],
      timestamps: this.extractTimestamps(data),
    };
  }
}

import { OHLCVData } from '@/types/chart';
import { IndicatorResult, IndicatorParams } from '@/types/indicators';
import { Indicator } from './base';
import { SMA } from './moving-averages';

/**
 * On-Balance Volume (OBV)
 * Cumulative volume indicator showing buying/selling pressure
 */
export class OBV extends Indicator {
  constructor() {
    super({
      name: 'On-Balance Volume',
      shortName: 'OBV',
      type: 'oscillator',
      description: 'Cumulative volume indicator measuring buying and selling pressure',
      inputs: [],
      outputs: [
        {
          name: 'OBV',
          color: '#3F51B5',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 120,
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const closes = this.extractPrices(data, 'close');
    const volumes = this.extractVolumes(data);
    const result = new Float64Array(data.length);

    result[0] = volumes[0];

    for (let i = 1; i < data.length; i++) {
      if (closes[i] > closes[i - 1]) {
        // Price up: add volume
        result[i] = result[i - 1] + volumes[i];
      } else if (closes[i] < closes[i - 1]) {
        // Price down: subtract volume
        result[i] = result[i - 1] - volumes[i];
      } else {
        // Price unchanged: keep same
        result[i] = result[i - 1];
      }
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

/**
 * Volume-Weighted Average Price (VWAP)
 * Average price weighted by volume
 */
export class VWAP extends Indicator {
  constructor() {
    super({
      name: 'Volume Weighted Average Price',
      shortName: 'VWAP',
      type: 'overlay',
      description: 'Average price weighted by volume throughout the day',
      inputs: [
        {
          name: 'anchor',
          type: 'select',
          default: 'day',
          options: [
            { label: 'Day', value: 'day' },
            { label: 'Week', value: 'week' },
            { label: 'Month', value: 'month' },
            { label: 'Session', value: 'session' },
          ],
          description: 'Reset period for VWAP calculation',
        },
      ],
      outputs: [
        {
          name: 'VWAP',
          color: '#FF9800',
          lineWidth: 2,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { anchor } = { ...this.getDefaultParams(), ...params };
    const volumes = this.extractVolumes(data);
    const result = new Float64Array(data.length);

    let cumulativeTPV = 0; // Typical Price * Volume
    let cumulativeVolume = 0;

    for (let i = 0; i < data.length; i++) {
      const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;

      // For simplicity, reset at start (can add date-based reset for day/week/month)
      if (i === 0 || (anchor === 'day' && this.isNewDay(data, i))) {
        cumulativeTPV = 0;
        cumulativeVolume = 0;
      }

      cumulativeTPV += typicalPrice * volumes[i];
      cumulativeVolume += volumes[i];

      result[i] = cumulativeVolume > 0 ? cumulativeTPV / cumulativeVolume : typicalPrice;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }

  private isNewDay(data: OHLCVData[], index: number): boolean {
    if (index === 0) return false;
    const currentTime = this.extractTimestamps(data)[index];
    const previousTime = this.extractTimestamps(data)[index - 1];
    
    const currentDate = new Date(currentTime * 1000);
    const previousDate = new Date(previousTime * 1000);
    
    return currentDate.getDate() !== previousDate.getDate();
  }
}

/**
 * Volume Profile
 * Shows volume distribution across price levels
 */
export class VolumeProfile extends Indicator {
  constructor() {
    super({
      name: 'Volume Profile',
      shortName: 'VP',
      type: 'volume',
      description: 'Volume distribution across price levels',
      inputs: [
        {
          name: 'bins',
          type: 'number',
          default: 24,
          min: 10,
          max: 100,
          step: 1,
          description: 'Number of price levels',
        },
        {
          name: 'showPOC',
          type: 'boolean',
          default: true,
          description: 'Show Point of Control (highest volume price)',
        },
      ],
      outputs: [
        {
          name: 'Volume Profile',
          color: '#2196F3',
          lineWidth: 1,
        },
      ],
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const { bins, showPOC } = { ...this.getDefaultParams(), ...params };
    
    // Find price range
    const highs = this.extractPrices(data, 'high');
    const lows = this.extractPrices(data, 'low');
    const closes = this.extractPrices(data, 'close');
    const volumes = this.extractVolumes(data);

    const minPrice = Math.min(...Array.from(lows));
    const maxPrice = Math.max(...Array.from(highs));
    const priceRange = maxPrice - minPrice;
    const binSize = priceRange / bins;

    // Initialize volume bins
    const volumeBins = new Float64Array(bins);

    // Distribute volume across price levels
    for (let i = 0; i < data.length; i++) {
      const price = closes[i];
      const binIndex = Math.min(Math.floor((price - minPrice) / binSize), bins - 1);
      volumeBins[binIndex] += volumes[i];
    }

    // Find POC (Point of Control) - price level with highest volume
    let pocIndex = 0;
    let maxVolume = 0;
    for (let i = 0; i < bins; i++) {
      if (volumeBins[i] > maxVolume) {
        maxVolume = volumeBins[i];
        pocIndex = i;
      }
    }
    const pocPrice = minPrice + (pocIndex + 0.5) * binSize;

    // Return profile data
    // Note: This needs special rendering, not typical line chart
    const profileData: number[] = [];
    for (let i = 0; i < bins; i++) {
      profileData.push(volumeBins[i]);
    }

    return {
      values: [profileData],
      timestamps: this.extractTimestamps(data),
      metadata: {
        minPrice,
        maxPrice,
        binSize,
        pocPrice,
        pocVolume: maxVolume,
      },
    };
  }
}

/**
 * Money Flow Index (MFI)
 * Volume-weighted RSI
 */
export class MFI extends Indicator {
  constructor() {
    super({
      name: 'Money Flow Index',
      shortName: 'MFI',
      type: 'oscillator',
      description: 'Volume-weighted momentum indicator (RSI with volume)',
      inputs: [
        {
          name: 'period',
          type: 'number',
          default: 14,
          min: 2,
          max: 100,
          step: 1,
        },
      ],
      outputs: [
        {
          name: 'MFI',
          color: '#00BCD4',
          lineWidth: 2,
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
    const { period } = { ...this.getDefaultParams(), ...params };
    const volumes = this.extractVolumes(data);
    const result = new Float64Array(data.length);

    // Calculate typical price
    const typicalPrices = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      typicalPrices[i] = (data[i].high + data[i].low + data[i].close) / 3;
    }

    // Calculate raw money flow
    const rawMoneyFlow = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) {
      rawMoneyFlow[i] = typicalPrices[i] * volumes[i];
    }

    // Calculate MFI
    for (let i = period; i < data.length; i++) {
      let positiveFlow = 0;
      let negativeFlow = 0;

      for (let j = 0; j < period; j++) {
        const idx = i - j;
        if (typicalPrices[idx] > typicalPrices[idx - 1]) {
          positiveFlow += rawMoneyFlow[idx];
        } else if (typicalPrices[idx] < typicalPrices[idx - 1]) {
          negativeFlow += rawMoneyFlow[idx];
        }
      }

      const moneyFlowRatio = negativeFlow === 0 ? 100 : positiveFlow / negativeFlow;
      result[i] = 100 - 100 / (1 + moneyFlowRatio);
    }

    // Fill initial values with NaN
    for (let i = 0; i < period; i++) {
      result[i] = NaN;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
      metadata: {
        overbought: 80,
        oversold: 20,
      },
    };
  }
}

/**
 * Accumulation/Distribution Line (A/D)
 * Volume-based indicator showing cumulative buying/selling pressure
 */
export class AD extends Indicator {
  constructor() {
    super({
      name: 'Accumulation/Distribution',
      shortName: 'A/D',
      type: 'oscillator',
      description: 'Cumulative indicator measuring money flow',
      inputs: [],
      outputs: [
        {
          name: 'A/D',
          color: '#673AB7',
          lineWidth: 2,
        },
      ],
      panelOptions: {
        height: 120,
      },
    });
  }

  calculate(data: OHLCVData[], params?: IndicatorParams): IndicatorResult {
    const volumes = this.extractVolumes(data);
    const result = new Float64Array(data.length);

    result[0] = 0;

    for (let i = 0; i < data.length; i++) {
      const { high, low, close } = data[i];
      const range = high - low;

      // Money Flow Multiplier
      const mfm = range === 0 ? 0 : ((close - low) - (high - close)) / range;

      // Money Flow Volume
      const mfv = mfm * volumes[i];

      result[i] = i === 0 ? mfv : result[i - 1] + mfv;
    }

    return {
      values: [Array.from(result)],
      timestamps: this.extractTimestamps(data),
    };
  }
}

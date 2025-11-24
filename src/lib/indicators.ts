import { OHLCVData, LineData } from '@/types/chart';

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(data: OHLCVData[], period: number, source: 'close' | 'open' | 'high' | 'low' = 'close'): LineData[] {
  const result: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j][source];
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  
  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(data: OHLCVData[], period: number, source: 'close' | 'open' | 'high' | 'low' = 'close'): LineData[] {
  const result: LineData[] = [];
  const multiplier = 2 / (period + 1);
  
  // Start with SMA for first value
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += data[i][source];
  }
  ema = ema / period;
  result.push({ time: data[period - 1].time, value: ema });
  
  // Calculate EMA for remaining values
  for (let i = period; i < data.length; i++) {
    ema = (data[i][source] - ema) * multiplier + ema;
    result.push({ time: data[i].time, value: ema });
  }
  
  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(data: OHLCVData[], period: number = 14): LineData[] {
  const result: LineData[] = [];
  
  if (data.length < period + 1) return result;
  
  let gains = 0;
  let losses = 0;
  
  // Calculate initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate RSI
  for (let i = period; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;
    
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    
    const rs = avgGain / avgLoss;
    const rsi = 100 - (100 / (1 + rs));
    
    result.push({
      time: data[i].time,
      value: rsi,
    });
  }
  
  return result;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(data: OHLCVData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const fastEMA = calculateEMA(data, fastPeriod, 'close');
  const slowEMA = calculateEMA(data, slowPeriod, 'close');
  
  const macdLine: LineData[] = [];
  const signalLine: LineData[] = [];
  const histogram: LineData[] = [];
  
  // Calculate MACD line
  const startIndex = slowPeriod - 1;
  for (let i = 0; i < fastEMA.length; i++) {
    const slowIndex = i + (fastPeriod - slowPeriod);
    if (slowIndex >= 0 && slowIndex < slowEMA.length) {
      macdLine.push({
        time: fastEMA[i].time,
        value: fastEMA[i].value - slowEMA[slowIndex].value,
      });
    }
  }
  
  // Calculate signal line (EMA of MACD)
  if (macdLine.length >= signalPeriod) {
    const multiplier = 2 / (signalPeriod + 1);
    let ema = 0;
    
    // Initial SMA
    for (let i = 0; i < signalPeriod; i++) {
      ema += macdLine[i].value;
    }
    ema = ema / signalPeriod;
    signalLine.push({ time: macdLine[signalPeriod - 1].time, value: ema });
    histogram.push({ time: macdLine[signalPeriod - 1].time, value: macdLine[signalPeriod - 1].value - ema });
    
    // Calculate signal EMA
    for (let i = signalPeriod; i < macdLine.length; i++) {
      ema = (macdLine[i].value - ema) * multiplier + ema;
      signalLine.push({ time: macdLine[i].time, value: ema });
      histogram.push({ time: macdLine[i].time, value: macdLine[i].value - ema });
    }
  }
  
  return { macdLine, signalLine, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(data: OHLCVData[], period: number = 20, stdDev: number = 2, source: 'close' | 'open' | 'high' | 'low' = 'close') {
  const sma = calculateSMA(data, period, source);
  const upper: LineData[] = [];
  const lower: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    // Calculate standard deviation
    let sum = 0;
    const smaValue = sma[i - period + 1].value;
    
    for (let j = 0; j < period; j++) {
      const diff = data[i - j][source] - smaValue;
      sum += diff * diff;
    }
    
    const std = Math.sqrt(sum / period);
    
    upper.push({
      time: data[i].time,
      value: smaValue + (std * stdDev),
    });
    
    lower.push({
      time: data[i].time,
      value: smaValue - (std * stdDev),
    });
  }
  
  return { middle: sma, upper, lower };
}

/**
 * Calculate Stochastic Oscillator
 */
export function calculateStochastic(data: OHLCVData[], kPeriod: number = 14, dPeriod: number = 3, smooth: number = 3) {
  const kLine: LineData[] = [];
  const dLine: LineData[] = [];
  
  // Calculate %K
  for (let i = kPeriod - 1; i < data.length; i++) {
    let highest = data[i - kPeriod + 1].high;
    let lowest = data[i - kPeriod + 1].low;
    
    for (let j = 0; j < kPeriod; j++) {
      highest = Math.max(highest, data[i - j].high);
      lowest = Math.min(lowest, data[i - j].low);
    }
    
    const k = ((data[i].close - lowest) / (highest - lowest)) * 100;
    kLine.push({ time: data[i].time, value: k });
  }
  
  // Smooth %K
  if (smooth > 1) {
    const smoothedK: LineData[] = [];
    for (let i = smooth - 1; i < kLine.length; i++) {
      let sum = 0;
      for (let j = 0; j < smooth; j++) {
        sum += kLine[i - j].value;
      }
      smoothedK.push({ time: kLine[i].time, value: sum / smooth });
    }
    kLine.length = 0;
    kLine.push(...smoothedK);
  }
  
  // Calculate %D (SMA of %K)
  for (let i = dPeriod - 1; i < kLine.length; i++) {
    let sum = 0;
    for (let j = 0; j < dPeriod; j++) {
      sum += kLine[i - j].value;
    }
    dLine.push({ time: kLine[i].time, value: sum / dPeriod });
  }
  
  return { kLine, dLine };
}

/**
 * Calculate Average True Range (ATR)
 */
export function calculateATR(data: OHLCVData[], period: number = 14): LineData[] {
  const result: LineData[] = [];
  const trueRanges: number[] = [];
  
  // Calculate True Range
  for (let i = 1; i < data.length; i++) {
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    
    trueRanges.push(tr);
  }
  
  // Calculate ATR (Wilder's smoothing)
  if (trueRanges.length >= period) {
    let atr = 0;
    
    // Initial ATR
    for (let i = 0; i < period; i++) {
      atr += trueRanges[i];
    }
    atr = atr / period;
    result.push({ time: data[period].time, value: atr });
    
    // Subsequent ATR values
    for (let i = period; i < trueRanges.length; i++) {
      atr = ((atr * (period - 1)) + trueRanges[i]) / period;
      result.push({ time: data[i + 1].time, value: atr });
    }
  }
  
  return result;
}

/**
 * Calculate On-Balance Volume (OBV)
 */
export function calculateOBV(data: OHLCVData[]): LineData[] {
  const result: LineData[] = [];
  let obv = 0;
  
  result.push({ time: data[0].time, value: obv });
  
  for (let i = 1; i < data.length; i++) {
    if (data[i].close > data[i - 1].close) {
      obv += data[i].volume;
    } else if (data[i].close < data[i - 1].close) {
      obv -= data[i].volume;
    }
    
    result.push({ time: data[i].time, value: obv });
  }
  
  return result;
}

/**
 * Calculate VWAP (Volume Weighted Average Price)
 */
export function calculateVWAP(data: OHLCVData[]): LineData[] {
  const result: LineData[] = [];
  let cumulativeTPV = 0; // Typical Price * Volume
  let cumulativeVolume = 0;
  
  for (let i = 0; i < data.length; i++) {
    const typicalPrice = (data[i].high + data[i].low + data[i].close) / 3;
    cumulativeTPV += typicalPrice * data[i].volume;
    cumulativeVolume += data[i].volume;
    
    const vwap = cumulativeTPV / cumulativeVolume;
    result.push({ time: data[i].time, value: vwap });
  }
  
  return result;
}

/**
 * Calculate Weighted Moving Average (WMA)
 */
export function calculateWMA(data: OHLCVData[], period: number, source: 'close' | 'open' | 'high' | 'low' = 'close'): LineData[] {
  const result: LineData[] = [];
  const weights = period * (period + 1) / 2;
  
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j][source] * (period - j);
    }
    result.push({
      time: data[i].time,
      value: sum / weights,
    });
  }
  
  return result;
}

/**
 * Calculate Commodity Channel Index (CCI)
 */
export function calculateCCI(data: OHLCVData[], period: number = 20): LineData[] {
  const result: LineData[] = [];
  
  for (let i = period - 1; i < data.length; i++) {
    // Calculate typical price SMA
    let sum = 0;
    const typicalPrices: number[] = [];
    
    for (let j = 0; j < period; j++) {
      const tp = (data[i - j].high + data[i - j].low + data[i - j].close) / 3;
      typicalPrices.push(tp);
      sum += tp;
    }
    
    const sma = sum / period;
    
    // Calculate mean deviation
    let meanDeviation = 0;
    for (let j = 0; j < period; j++) {
      meanDeviation += Math.abs(typicalPrices[j] - sma);
    }
    meanDeviation = meanDeviation / period;
    
    const currentTP = (data[i].high + data[i].low + data[i].close) / 3;
    const cci = (currentTP - sma) / (0.015 * meanDeviation);
    
    result.push({
      time: data[i].time,
      value: cci,
    });
  }
  
  return result;
}

/**
 * Calculate Keltner Channels
 */
export function calculateKeltnerChannels(data: OHLCVData[], period: number = 20, multiplier: number = 2) {
  const ema = calculateEMA(data, period, 'close');
  const atr = calculateATR(data, period);
  
  const upper: LineData[] = [];
  const lower: LineData[] = [];
  
  // Align EMA and ATR data
  for (let i = 0; i < atr.length; i++) {
    const emaIndex = ema.findIndex(e => e.time === atr[i].time);
    if (emaIndex !== -1) {
      upper.push({
        time: atr[i].time,
        value: ema[emaIndex].value + (multiplier * atr[i].value),
      });
      lower.push({
        time: atr[i].time,
        value: ema[emaIndex].value - (multiplier * atr[i].value),
      });
    }
  }
  
  return { middle: ema, upper, lower };
}

/**
 * Calculate Average Directional Index (ADX)
 */
export function calculateADX(data: OHLCVData[], period: number = 14): LineData[] {
  const result: LineData[] = [];
  const plusDM: number[] = [];
  const minusDM: number[] = [];
  const tr: number[] = [];
  
  // Calculate +DM, -DM, and TR
  for (let i = 1; i < data.length; i++) {
    const highDiff = data[i].high - data[i - 1].high;
    const lowDiff = data[i - 1].low - data[i].low;
    
    plusDM.push(highDiff > lowDiff && highDiff > 0 ? highDiff : 0);
    minusDM.push(lowDiff > highDiff && lowDiff > 0 ? lowDiff : 0);
    
    const trueRange = Math.max(
      data[i].high - data[i].low,
      Math.abs(data[i].high - data[i - 1].close),
      Math.abs(data[i].low - data[i - 1].close)
    );
    tr.push(trueRange);
  }
  
  // Calculate smoothed values
  if (tr.length >= period) {
    let smoothedPlusDM = 0;
    let smoothedMinusDM = 0;
    let smoothedTR = 0;
    
    // Initial sums
    for (let i = 0; i < period; i++) {
      smoothedPlusDM += plusDM[i];
      smoothedMinusDM += minusDM[i];
      smoothedTR += tr[i];
    }
    
    const plusDI: number[] = [];
    const minusDI: number[] = [];
    
    for (let i = period; i < tr.length; i++) {
      smoothedPlusDM = smoothedPlusDM - (smoothedPlusDM / period) + plusDM[i];
      smoothedMinusDM = smoothedMinusDM - (smoothedMinusDM / period) + minusDM[i];
      smoothedTR = smoothedTR - (smoothedTR / period) + tr[i];
      
      plusDI.push((smoothedPlusDM / smoothedTR) * 100);
      minusDI.push((smoothedMinusDM / smoothedTR) * 100);
    }
    
    // Calculate DX and ADX
    const dx: number[] = [];
    for (let i = 0; i < plusDI.length; i++) {
      const sum = plusDI[i] + minusDI[i];
      const diff = Math.abs(plusDI[i] - minusDI[i]);
      dx.push(sum === 0 ? 0 : (diff / sum) * 100);
    }
    
    // Calculate ADX (smoothed DX)
    if (dx.length >= period) {
      let adx = 0;
      for (let i = 0; i < period; i++) {
        adx += dx[i];
      }
      adx = adx / period;
      result.push({ time: data[period + period].time, value: adx });
      
      for (let i = period; i < dx.length; i++) {
        adx = ((adx * (period - 1)) + dx[i]) / period;
        result.push({ time: data[i + period + 1].time, value: adx });
      }
    }
  }
  
  return result;
}

/**
 * Calculate Parabolic SAR
 */
export function calculateParabolicSAR(data: OHLCVData[], acceleration: number = 0.02, maximum: number = 0.2): LineData[] {
  const result: LineData[] = [];
  
  if (data.length < 2) return result;
  
  let isUptrend = data[1].close > data[0].close;
  let sar = isUptrend ? data[0].low : data[0].high;
  let ep = isUptrend ? data[0].high : data[0].low;
  let af = acceleration;
  
  result.push({ time: data[0].time, value: sar });
  
  for (let i = 1; i < data.length; i++) {
    // Calculate new SAR
    sar = sar + af * (ep - sar);
    
    // Check for reversal
    const reversal = isUptrend 
      ? data[i].low < sar 
      : data[i].high > sar;
    
    if (reversal) {
      isUptrend = !isUptrend;
      sar = ep;
      ep = isUptrend ? data[i].high : data[i].low;
      af = acceleration;
    } else {
      // Update EP and AF
      if (isUptrend) {
        if (data[i].high > ep) {
          ep = data[i].high;
          af = Math.min(af + acceleration, maximum);
        }
      } else {
        if (data[i].low < ep) {
          ep = data[i].low;
          af = Math.min(af + acceleration, maximum);
        }
      }
    }
    
    result.push({ time: data[i].time, value: sar });
  }
  
  return result;
}

/**
 * Calculate Ichimoku Cloud
 */
export function calculateIchimoku(
  data: OHLCVData[],
  conversionPeriod: number = 9,
  basePeriod: number = 26,
  spanPeriod: number = 52,
  displacement: number = 26
) {
  const tenkanSen: LineData[] = [];
  const kijunSen: LineData[] = [];
  const senkouSpanA: LineData[] = [];
  const senkouSpanB: LineData[] = [];
  const chikouSpan: LineData[] = [];
  
  // Helper function to calculate midpoint
  const getMidpoint = (start: number, end: number, period: number): number => {
    let highest = data[start].high;
    let lowest = data[start].low;
    
    for (let i = start; i <= end; i++) {
      highest = Math.max(highest, data[i].high);
      lowest = Math.min(lowest, data[i].low);
    }
    
    return (highest + lowest) / 2;
  };
  
  // Calculate Tenkan-sen (Conversion Line)
  for (let i = conversionPeriod - 1; i < data.length; i++) {
    tenkanSen.push({
      time: data[i].time,
      value: getMidpoint(i - conversionPeriod + 1, i, conversionPeriod),
    });
  }
  
  // Calculate Kijun-sen (Base Line)
  for (let i = basePeriod - 1; i < data.length; i++) {
    kijunSen.push({
      time: data[i].time,
      value: getMidpoint(i - basePeriod + 1, i, basePeriod),
    });
  }
  
  // Calculate Senkou Span A (Leading Span A)
  for (let i = basePeriod - 1; i < data.length; i++) {
    const tenkanIndex = i - (basePeriod - conversionPeriod);
    if (tenkanIndex >= 0 && tenkanIndex < tenkanSen.length) {
      const kijunIndex = i - basePeriod + 1;
      if (kijunIndex >= 0 && kijunIndex < kijunSen.length) {
        senkouSpanA.push({
          time: data[Math.min(i + displacement, data.length - 1)].time,
          value: (tenkanSen[tenkanIndex].value + kijunSen[kijunIndex].value) / 2,
        });
      }
    }
  }
  
  // Calculate Senkou Span B (Leading Span B)
  for (let i = spanPeriod - 1; i < data.length; i++) {
    senkouSpanB.push({
      time: data[Math.min(i + displacement, data.length - 1)].time,
      value: getMidpoint(i - spanPeriod + 1, i, spanPeriod),
    });
  }
  
  // Calculate Chikou Span (Lagging Span)
  for (let i = 0; i < data.length - displacement; i++) {
    chikouSpan.push({
      time: data[i].time,
      value: data[i + displacement].close,
    });
  }
  
  return {
    tenkanSen,
    kijunSen,
    senkouSpanA,
    senkouSpanB,
    chikouSpan,
  };
}

/**
 * Calculate Heikin Ashi candles
 */
export function calculateHeikinAshi(data: OHLCVData[]): OHLCVData[] {
  const result: OHLCVData[] = [];
  
  if (data.length === 0) return result;
  
  // First candle is the same
  let haClose = (data[0].open + data[0].high + data[0].low + data[0].close) / 4;
  let haOpen = (data[0].open + data[0].close) / 2;
  
  result.push({
    time: data[0].time,
    open: haOpen,
    high: data[0].high,
    low: data[0].low,
    close: haClose,
    volume: data[0].volume,
  });
  
  // Calculate subsequent candles
  for (let i = 1; i < data.length; i++) {
    haClose = (data[i].open + data[i].high + data[i].low + data[i].close) / 4;
    haOpen = (result[i - 1].open + result[i - 1].close) / 2;
    const haHigh = Math.max(data[i].high, haOpen, haClose);
    const haLow = Math.min(data[i].low, haOpen, haClose);
    
    result.push({
      time: data[i].time,
      open: haOpen,
      high: haHigh,
      low: haLow,
      close: haClose,
      volume: data[i].volume,
    });
  }
  
  return result;
}

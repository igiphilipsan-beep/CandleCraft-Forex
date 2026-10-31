import { Candle } from '../types/forex';

export interface IndicatorPoint {
  time: number;
  value: number;
}

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  result.push({
    time: candles[period - 1].time,
    value: Number((sum / period).toFixed(5)),
  });

  for (let i = period; i < candles.length; i++) {
    sum += candles[i].close - candles[i - period].close;
    result.push({
      time: candles[i].time,
      value: Number((sum / period).toFixed(5)),
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(candles: Candle[], period: number): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length < period) return result;

  const multiplier = 2 / (period + 1);

  // Initial SMA as first EMA
  let initialSum = 0;
  for (let i = 0; i < period; i++) {
    initialSum += candles[i].close;
  }
  let prevEma = initialSum / period;
  result.push({
    time: candles[period - 1].time,
    value: Number(prevEma.toFixed(5)),
  });

  for (let i = period; i < candles.length; i++) {
    const currentClose = candles[i].close;
    const currentEma = (currentClose - prevEma) * multiplier + prevEma;
    result.push({
      time: candles[i].time,
      value: Number(currentEma.toFixed(5)),
    });
    prevEma = currentEma;
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI 14)
 */
export function calculateRSI(candles: Candle[], period = 14): IndicatorPoint[] {
  const result: IndicatorPoint[] = [];
  if (candles.length <= period) return result;

  let gains = 0;
  let losses = 0;

  // Calculate first average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = candles[i].close - candles[i - 1].close;
    if (change > 0) {
      gains += change;
    } else {
      losses += Math.abs(change);
    }
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  let rsi = 100 - (100 / (1 + rs));

  result.push({
    time: candles[period].time,
    value: Number(rsi.toFixed(2)),
  });

  // Smoothed RS for remainder
  for (let i = period + 1; i < candles.length; i++) {
    const change = candles[i].close - candles[i - 1].close;
    const currentGain = change > 0 ? change : 0;
    const currentLoss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi = 100 - (100 / (1 + rs));

    result.push({
      time: candles[i].time,
      value: Number(rsi.toFixed(2)),
    });
  }

  return result;
}

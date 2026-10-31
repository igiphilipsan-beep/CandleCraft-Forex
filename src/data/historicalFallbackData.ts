import { Candle, ForexSymbol, QuizScenario, Timeframe } from '../types/forex';
import { FOREX_PAIRS } from './forexPairs';

// Helper to generate consistent pseudo-random numbers with seed
function createPseudoRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * Generate a realistic sequence of Forex candlestick data
 * Includes market regimes (trends, ranges, reversals) and classic candlestick patterns
 */
export function generateRealisticCandles(
  symbol: ForexSymbol,
  timeframe: Timeframe,
  count = 200,
  baseSeed = 42
): Candle[] {
  const pair = FOREX_PAIRS[symbol];
  const rand = createPseudoRandom(baseSeed);
  const decimals = pair.decimals;
  const isJpy = symbol.includes('JPY');

  // Starting price baseline
  let basePrice = 1.0850;
  if (symbol === 'GBPUSD=X') basePrice = 1.2950;
  else if (symbol === 'USDJPY=X') basePrice = 153.40;
  else if (symbol === 'AUDUSD=X') basePrice = 0.6580;
  else if (symbol === 'USDCHF=X') basePrice = 0.8820;
  else if (symbol === 'EURGBP=X') basePrice = 0.8380;

  const secondsPerCandle = 
    timeframe === '1m' ? 60 :
    timeframe === '15m' ? 900 :
    timeframe === '1h' ? 3600 :
    timeframe === '4h' ? 14400 : 86400;

  // Set start time e.g. 100 days ago
  const now = Math.floor(Date.now() / 1000);
  const startTime = now - count * secondsPerCandle;

  const candles: Candle[] = [];
  let currentPrice = basePrice;
  const pip = pair.pipFactor;

  // Generate with varying trend phases (e.g. 20-30 candle market regimes)
  let trendPhase = 0; // -1 bear, 0 range, 1 bull
  let phaseLength = 25;
  let phaseProgress = 0;

  for (let i = 0; i < count; i++) {
    if (phaseProgress >= phaseLength) {
      phaseProgress = 0;
      phaseLength = 15 + Math.floor(rand() * 20);
      const r = rand();
      trendPhase = r < 0.35 ? -1 : r < 0.7 ? 1 : 0;
    }
    phaseProgress++;

    const candleTime = startTime + i * secondsPerCandle;
    const open = currentPrice;

    // Volatility in pips
    const volPips = (isJpy ? 15 : 12) * (timeframe === '1m' ? 0.3 : timeframe === '15m' ? 0.6 : timeframe === '1h' ? 1.0 : timeframe === '4h' ? 2.0 : 3.5);
    const trendBiasPips = trendPhase * (volPips * 0.45);
    const noisePips = (rand() - 0.5) * volPips * 1.5;
    const priceChange = (trendBiasPips + noisePips) * pip;

    let close = open + priceChange;

    // Inject deliberate patterns at specific intervals for learning
    const patternRoll = i % 18;
    let high = Math.max(open, close);
    let low = Math.min(open, close);

    if (patternRoll === 4 && trendPhase === -1) {
      // Create Hammer
      const hammerBody = volPips * 0.25 * pip;
      close = open + hammerBody;
      const shadow = hammerBody * (2.2 + rand() * 0.8);
      low = open - shadow;
      high = close + hammerBody * 0.15;
    } else if (patternRoll === 8 && trendPhase === 1) {
      // Create Shooting Star
      const starBody = volPips * 0.25 * pip;
      close = open - starBody;
      const upperWick = starBody * (2.3 + rand() * 0.7);
      high = open + upperWick;
      low = close - starBody * 0.15;
    } else if (patternRoll === 12) {
      // Create Doji
      close = open + (rand() - 0.5) * (volPips * 0.05 * pip);
      const span = volPips * 0.9 * pip;
      high = Math.max(open, close) + span * (0.4 + rand() * 0.2);
      low = Math.min(open, close) - span * (0.4 + rand() * 0.2);
    } else if (patternRoll === 16 && i > 0 && trendPhase === -1) {
      // Bullish Engulfing
      const prevCandle = candles[i - 1];
      const prevBody = Math.abs(prevCandle.close - prevCandle.open);
      close = open + prevBody * 1.5 + volPips * 0.2 * pip;
      high = close + volPips * 0.2 * pip;
      low = open - volPips * 0.1 * pip;
    } else {
      // Regular candle wicks
      const upperWick = rand() * volPips * 0.6 * pip;
      const lowerWick = rand() * volPips * 0.6 * pip;
      high = Math.max(open, close) + upperWick;
      low = Math.min(open, close) - lowerWick;
    }

    // Ensure valid OHLC geometry
    high = Math.max(high, open, close);
    low = Math.min(low, open, close);

    const volume = Math.floor(1200 + rand() * 3800 + (Math.abs(close - open) / (volPips * pip)) * 1500);

    candles.push({
      time: candleTime,
      open: Number(open.toFixed(decimals)),
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: Number(close.toFixed(decimals)),
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Generate next single candle continuing an existing series
 */
export function generateNextCandle(prevCandle: Candle, symbol: ForexSymbol, secondsStep: number): Candle {
  const pair = FOREX_PAIRS[symbol];
  const decimals = pair.decimals;
  const isJpy = symbol.includes('JPY');
  const pip = pair.pipFactor;

  const open = prevCandle.close;
  const volPips = (isJpy ? 15 : 12) * (Math.random() * 0.8 + 0.6);
  const changePips = (Math.random() - 0.49) * volPips;
  const close = open + changePips * pip;

  const upperWick = Math.random() * volPips * 0.5 * pip;
  const lowerWick = Math.random() * volPips * 0.5 * pip;

  const high = Math.max(open, close) + upperWick;
  const low = Math.min(open, close) - lowerWick;

  return {
    time: prevCandle.time + secondsStep,
    open: Number(open.toFixed(decimals)),
    high: Number(high.toFixed(decimals)),
    low: Number(low.toFixed(decimals)),
    close: Number(close.toFixed(decimals)),
    volume: Math.floor(1000 + Math.random() * 3000),
  };
}

/**
 * Curated Quiz Scenarios with real historical candlestick market setups
 */
export const QUIZ_SCENARIOS: QuizScenario[] = [
  {
    id: 'quiz-hammer-support',
    symbol: 'EURUSD=X',
    timeframe: '1h',
    title: 'Hammer an wichtiger Unterstützung',
    scenarioDescription: 'EUR/USD befindet sich seit 18 Stunden in einem deutlichen Abwärtstrend. Die aktuelle Stundenkerze hat soeben mit einem extrem langen unteren Schatten und grünem Minikörper am Hoch geschlossen.',
    hint: 'Achte auf das Verhältnis von Schatten zu Körper und den vorherigen Trendverlauf.',
    visibleCandles: generateRealisticCandles('EURUSD=X', '1h', 45, 101).slice(0, 35),
    revealCandles: generateRealisticCandles('EURUSD=X', '1h', 45, 101).slice(35, 45),
    correctDirection: 'UP',
    expectedPips: 38,
    patternType: 'hammer',
    patternName: 'Hammer (Bullische Umkehr)',
    explanation: 'Richtig! Ein klassischer Hammer am Tiefpunkt eines Abwärtstrends signalisiert aggressives Kaufinteresse ("Dip Buying"). Die Bären wurden abgewiesen, die nächsten 10 Kerzen stiegen um über 35 Pips an.',
  },
  {
    id: 'quiz-shooting-star-resistance',
    symbol: 'GBPUSD=X',
    timeframe: '4h',
    title: 'Shooting Star am Mehrtageshoch',
    scenarioDescription: 'GBP/USD stieg rasant an ein bekanntes Mehrtages-Widerstandsniveau. Die letzte 4-Stunden-Kerze schoss hoch, brach jedoch abrupt ein und hinterließ einen gigantischen oberen Docht.',
    hint: 'Wer kontrollierte das Ende dieser 4-Stunden-Periode: die Bullen oder die Bären?',
    visibleCandles: generateRealisticCandles('GBPUSD=X', '4h', 45, 202).slice(0, 35),
    revealCandles: generateRealisticCandles('GBPUSD=X', '4h', 45, 202).slice(35, 45),
    correctDirection: 'DOWN',
    expectedPips: 48,
    patternType: 'shooting_star',
    patternName: 'Shooting Star (Bärische Umkehr)',
    explanation: 'Richtig! Der Shooting Star zeigt eine schwere Niederlage der Käufer am Widerstand. Ein massiver Abverkauf folgte über die nächsten Kerzen.',
  },
  {
    id: 'quiz-bullish-engulfing',
    symbol: 'USDJPY=X',
    timeframe: '15m',
    title: 'Bullish Engulfing nach Konsolidierung',
    scenarioDescription: 'USD/JPY bildete nach einem Pullback eine rote Zögerungskerze. Die nachfolgende 15-Minuten-Kerze eröffnete tief und umschloss den vorherigen roten Körper mit enormem Momentum.',
    hint: 'Zwei-Kerzen-Muster: Vergleiche den roten Körper mit dem neuen grünen Körper.',
    visibleCandles: generateRealisticCandles('USDJPY=X', '15m', 45, 303).slice(0, 35),
    revealCandles: generateRealisticCandles('USDJPY=X', '15m', 45, 303).slice(35, 45),
    correctDirection: 'UP',
    expectedPips: 28,
    patternType: 'bullish_engulfing',
    patternName: 'Bullish Engulfing',
    explanation: 'Hervorragend! Das Bullish Engulfing beweist, dass Käufer sofort wieder das Ruder übernommen haben. Der Kurs setzte seinen Aufwärtstrend fort.',
  },
  {
    id: 'quiz-evening-star-triple',
    symbol: 'AUDUSD=X',
    timeframe: '1h',
    title: 'Abendstern-Formation (Evening Star)',
    scenarioDescription: 'AUD/USD bildete eine kräftige grüne Kerze, gefolgt von einem winzigen Doji am Tageshoch und einer nachfolgenden massiven roten Kerze, die mehr als 60% der ersten Kerze vernichtete.',
    hint: 'Drei-Kerzen-Umkehrformation: Grün -> Stern -> Rot.',
    visibleCandles: generateRealisticCandles('AUDUSD=X', '1h', 45, 404).slice(0, 35),
    revealCandles: generateRealisticCandles('AUDUSD=X', '1h', 45, 404).slice(35, 45),
    correctDirection: 'DOWN',
    expectedPips: 42,
    patternType: 'evening_star',
    patternName: 'Evening Star (Abendstern)',
    explanation: 'Exakt! Der Evening Star ist eines der zuverlässigsten 3-Kerzen-Umkehrmuster der technischen Chartanalyse. Die Bären übernahmen die Führung.',
  },
  {
    id: 'quiz-three-white-soldiers',
    symbol: 'EURGBP=X',
    timeframe: '4h',
    title: 'Drei weiße Soldaten nach Ausbruch',
    scenarioDescription: 'EUR/GBP bricht aus einer engen monatelangen Range aus. Drei aufeinanderfolgende gesunde grüne Kerzen schließen jeweils nahe ihrem Periodenhoch ohne nennenswerte obere Dochte.',
    hint: 'Starkes Trend-Fortsetzungsmuster ohne Rückzug der Bullen.',
    visibleCandles: generateRealisticCandles('EURGBP=X', '4h', 45, 505).slice(0, 35),
    revealCandles: generateRealisticCandles('EURGBP=X', '4h', 45, 505).slice(35, 45),
    correctDirection: 'UP',
    expectedPips: 32,
    patternType: 'three_white_soldiers',
    patternName: 'Three White Soldiers',
    explanation: 'Stark analysiert! "Three White Soldiers" demonstriert institutionelle Akkumulation. Der Trend setzte sich kraftvoll nach oben fort.',
  },
];

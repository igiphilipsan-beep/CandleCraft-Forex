export type ForexSymbol = 
  | 'EURUSD=X'
  | 'GBPUSD=X'
  | 'USDJPY=X'
  | 'AUDUSD=X'
  | 'USDCHF=X'
  | 'EURGBP=X';

export type Timeframe = '1m' | '15m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type CandlePatternType =
  | 'hammer'
  | 'inverted_hammer'
  | 'hanging_man'
  | 'shooting_star'
  | 'doji'
  | 'dragonfly_doji'
  | 'gravestone_doji'
  | 'bullish_engulfing'
  | 'bearish_engulfing'
  | 'morning_star'
  | 'evening_star'
  | 'piercing_line'
  | 'dark_cloud_cover'
  | 'three_white_soldiers'
  | 'three_black_crows'
  | 'tweezer_bottom'
  | 'tweezer_top';

export type PatternSignal = 'bullish' | 'bearish' | 'neutral';

export interface DetectedPattern {
  id: string;
  time: number;
  candleIndex: number;
  type: CandlePatternType;
  name: string;
  germanName: string;
  signal: PatternSignal;
  description: string;
  psychology: string;
  confirmation: string;
  price: number;
  reliability: 'Hoch' | 'Mittel' | 'Moderat';
}

export interface ForexPairInfo {
  symbol: ForexSymbol;
  name: string;
  base: string;
  quote: string;
  pipFactor: number; // 0.0001 or 0.01 for JPY
  decimals: number;
  defaultSpreadPips: number;
  description: string;
}

export interface TradeOrder {
  id: string;
  symbol: ForexSymbol;
  type: 'BUY' | 'SELL';
  openPrice: number;
  openTime: number;
  closePrice?: number;
  closeTime?: number;
  sl?: number;
  tp?: number;
  lotSize: number;
  units: number;
  status: 'OPEN' | 'CLOSED';
  pnlEur: number;
  pnlPips: number;
  closeReason?: 'TP' | 'SL' | 'MANUAL';
  highestPrice?: number;
  lowestPrice?: number;
}

export interface EquityPoint {
  time: number;
  equity: number;
  label: string;
}

export interface QuizScenario {
  id: string;
  symbol: ForexSymbol;
  timeframe: Timeframe;
  title: string;
  scenarioDescription: string;
  hint?: string;
  visibleCandles: Candle[];
  revealCandles: Candle[];
  correctDirection: 'UP' | 'DOWN';
  expectedPips: number;
  patternType?: CandlePatternType;
  patternName?: string;
  explanation: string;
}

export interface QuizProgress {
  totalAnswered: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  score: number;
  history: {
    scenarioId: string;
    userChoice: 'UP' | 'DOWN';
    isCorrect: boolean;
    date: number;
  }[];
}

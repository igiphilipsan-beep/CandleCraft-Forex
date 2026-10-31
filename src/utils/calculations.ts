import { ForexSymbol, TradeOrder } from '../types/forex';
import { FOREX_PAIRS } from '../data/forexPairs';

/**
 * Get pip factor for a symbol (0.0001 for EURUSD, 0.01 for USDJPY)
 */
export function getPipFactor(symbol: ForexSymbol): number {
  return FOREX_PAIRS[symbol]?.pipFactor ?? 0.0001;
}

/**
 * Format price according to symbol decimals
 */
export function formatPrice(price: number | undefined | null, symbol: ForexSymbol): string {
  if (typeof price !== 'number' || isNaN(price)) return '0.00000';
  const decimals = FOREX_PAIRS[symbol]?.decimals ?? 5;
  return price.toFixed(decimals);
}

/**
 * Calculate difference in pips between two prices
 */
export function calculatePipsDiff(entryPrice: number, currentPrice: number, type: 'BUY' | 'SELL', symbol: ForexSymbol): number {
  if (typeof entryPrice !== 'number' || typeof currentPrice !== 'number' || isNaN(entryPrice) || isNaN(currentPrice)) {
    return 0;
  }
  const pipFactor = getPipFactor(symbol);
  const rawDiff = type === 'BUY' ? (currentPrice - entryPrice) : (entryPrice - currentPrice);
  return Number((rawDiff / pipFactor).toFixed(1));
}

/**
 * Calculate PnL in EUR for a trade
 * Standard lot is 100,000 units of base currency.
 * For EUR/USD: 1 Pip on 1.0 Lot = $10 USD. At EUR/USD ~1.08, $10 = ~9.25 EUR.
 * For USD/JPY: 1 Pip on 1.0 Lot = 1,000 JPY. At USD/JPY ~150, ~6.67 USD = ~6.15 EUR.
 */
export function calculateTradePnL(
  order: Pick<TradeOrder, 'symbol' | 'type' | 'openPrice' | 'lotSize'>,
  currentPrice: number
): { pnlPips: number; pnlEur: number } {
  const { symbol, type, openPrice, lotSize } = order;
  const pnlPips = calculatePipsDiff(openPrice, currentPrice, type, symbol);

  // Approximate pip value in EUR for 1 standard lot
  let pipValuePerLotInEur = 9.20; // Default for EUR/USD
  if (symbol === 'USDJPY=X') {
    pipValuePerLotInEur = 6.20;
  } else if (symbol === 'GBPUSD=X') {
    pipValuePerLotInEur = 9.20;
  } else if (symbol === 'AUDUSD=X') {
    pipValuePerLotInEur = 9.20;
  } else if (symbol === 'EURGBP=X') {
    pipValuePerLotInEur = 11.50; // 1 pip = 10 GBP ~ 11.5 EUR
  } else if (symbol === 'USDCHF=X') {
    pipValuePerLotInEur = 10.40;
  }

  const pnlEur = Number((pnlPips * pipValuePerLotInEur * lotSize).toFixed(2));
  return { pnlPips, pnlEur };
}

/**
 * Get current Bid and Ask prices given a candle close and the symbol's spread
 */
export function getBidAsk(closePrice: number | undefined | null, symbol: ForexSymbol, customSpreadPips?: number): { bid: number; ask: number; spreadPips: number } {
  const safePrice = (typeof closePrice === 'number' && !isNaN(closePrice)) ? closePrice : 1.085;
  const spreadPips = customSpreadPips ?? (FOREX_PAIRS[symbol]?.defaultSpreadPips ?? 1.2);
  const pipFactor = getPipFactor(symbol);
  const halfSpread = (spreadPips / 2) * pipFactor;

  const bid = Number((safePrice - halfSpread).toFixed(FOREX_PAIRS[symbol]?.decimals ?? 5));
  const ask = Number((safePrice + halfSpread).toFixed(FOREX_PAIRS[symbol]?.decimals ?? 5));

  return { bid, ask, spreadPips };
}

/**
 * Calculate target price based on pips offset
 */
export function getTargetPriceByPips(
  entryPrice: number,
  pips: number,
  type: 'BUY' | 'SELL',
  target: 'TP' | 'SL',
  symbol: ForexSymbol
): number {
  const pipFactor = getPipFactor(symbol);
  const decimals = FOREX_PAIRS[symbol]?.decimals ?? 5;
  const offset = pips * pipFactor;

  let targetPrice = entryPrice;
  if (type === 'BUY') {
    targetPrice = target === 'TP' ? entryPrice + offset : entryPrice - offset;
  } else {
    targetPrice = target === 'TP' ? entryPrice - offset : entryPrice + offset;
  }

  return Number(targetPrice.toFixed(decimals));
}

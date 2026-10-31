import React, { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, ShieldAlert, Target, X, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { ForexSymbol, TradeOrder } from '../../types/forex';
import { formatPrice, getBidAsk, getTargetPriceByPips } from '../../utils/calculations';
import { FOREX_PAIRS } from '../../data/forexPairs';

interface TradingPanelProps {
  symbol: ForexSymbol;
  currentClosePrice: number;
  balance: number;
  equity: number;
  activeOrders: TradeOrder[];
  onOpenOrder: (order: {
    type: 'BUY' | 'SELL';
    lotSize: number;
    sl?: number;
    tp?: number;
  }) => void;
  onCloseOrder: (orderId: string, reason?: 'MANUAL') => void;
}

const LOT_PRESETS = [0.01, 0.05, 0.1, 0.5, 1.0];

export const TradingPanel: React.FC<TradingPanelProps> = ({
  symbol,
  currentClosePrice,
  balance,
  equity,
  activeOrders,
  onOpenOrder,
  onCloseOrder,
}) => {
  const [lotSize, setLotSize] = useState<number>(0.1);
  const [slPips, setSlPips] = useState<number>(25);
  const [tpPips, setTpPips] = useState<number>(50);
  const [useSl, setUseSl] = useState<boolean>(true);
  const [useTp, setUseTp] = useState<boolean>(true);

  const { bid, ask, spreadPips } = getBidAsk(currentClosePrice, symbol);
  const pairInfo = FOREX_PAIRS[symbol];

  const handleBuy = () => {
    const sl = useSl ? getTargetPriceByPips(ask, slPips, 'BUY', 'SL', symbol) : undefined;
    const tp = useTp ? getTargetPriceByPips(ask, tpPips, 'BUY', 'TP', symbol) : undefined;
    onOpenOrder({
      type: 'BUY',
      lotSize,
      sl,
      tp,
    });
  };

  const handleSell = () => {
    const sl = useSl ? getTargetPriceByPips(bid, slPips, 'SELL', 'SL', symbol) : undefined;
    const tp = useTp ? getTargetPriceByPips(bid, tpPips, 'SELL', 'TP', symbol) : undefined;
    onOpenOrder({
      type: 'SELL',
      lotSize,
      sl,
      tp,
    });
  };

  const setRrRatio = (ratio: number) => {
    setTpPips(Math.round(slPips * ratio));
    setUseTp(true);
  };

  // Calculate total open PnL
  const totalOpenPnlEur = activeOrders.reduce((sum, o) => sum + o.pnlEur, 0);
  const totalOpenPnlPips = activeOrders.reduce((sum, o) => sum + o.pnlPips, 0);

  return (
    <div className="flex flex-col gap-4 bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      {/* Account Balance & Spread Header */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Spielgeld-Konto</span>
          <span className="text-base font-bold font-mono text-white tabular-nums">
            {balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-500 font-medium block">Equity (Eigenkapital)</span>
          <span className={`text-base font-bold font-mono tabular-nums ${equity >= balance ? 'text-emerald-400' : 'text-rose-400'}`}>
            {equity.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex flex-col justify-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800/60">
          <span className="text-[11px] text-slate-500 font-medium">Spread</span>
          <span className="text-xs font-mono font-semibold text-amber-400">
            {spreadPips.toFixed(1)} Pips
          </span>
        </div>
      </div>

      {/* Lot Size Selector */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300">Positionsgröße (Lots):</label>
          <span className="text-xs font-mono text-slate-400">
            {lotSize} Lot = {(lotSize * 100000).toLocaleString('de-DE')} {pairInfo.base}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {LOT_PRESETS.map((preset) => (
            <button
              key={preset}
              onClick={() => setLotSize(preset)}
              className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg border transition-colors cursor-pointer ${
                lotSize === preset
                  ? 'bg-sky-500 text-white border-sky-400 font-semibold'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/70'
              }`}
            >
              {preset}
            </button>
          ))}
          <input
            type="number"
            step="0.01"
            min="0.01"
            max="10"
            value={lotSize}
            onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.01))}
            className="w-20 px-2 py-1.5 text-xs font-mono bg-slate-950 border border-slate-700 rounded-lg text-white text-center focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Stop Loss & Take Profit Settings */}
      <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
        {/* Stop Loss */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useSl}
                onChange={(e) => setUseSl(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-rose-400 flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" /> Stop-Loss
              </span>
            </label>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              disabled={!useSl}
              value={slPips}
              onChange={(e) => setSlPips(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white disabled:opacity-40"
            />
            <span className="text-xs text-slate-500 font-mono">Pips</span>
          </div>
        </div>

        {/* Take Profit */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={useTp}
                onChange={(e) => setUseTp(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-0"
              />
              <span className="text-emerald-400 flex items-center gap-1">
                <Target className="w-3 h-3" /> Take-Profit
              </span>
            </label>
          </div>
          <div className="flex items-center gap-1">
            <input
              type="number"
              disabled={!useTp}
              value={tpPips}
              onChange={(e) => setTpPips(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-2 py-1 text-xs font-mono bg-slate-900 border border-slate-700 rounded text-white disabled:opacity-40"
            />
            <span className="text-xs text-slate-500 font-mono">Pips</span>
          </div>
        </div>

        {/* Quick CRV shortcuts */}
        <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-slate-800/40 text-[11px]">
          <span className="text-slate-500">CRV Schnellwahl:</span>
          {[1, 1.5, 2, 3].map((r) => (
            <button
              key={r}
              onClick={() => setRrRatio(r)}
              className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono cursor-pointer"
            >
              1:{r}
            </button>
          ))}
        </div>
      </div>

      {/* Buy / Sell Buttons */}
      <div className="grid grid-cols-2 gap-3">
        {/* SELL Button */}
        <button
          onClick={handleSell}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-semibold shadow-lg shadow-rose-950/50 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-xs text-rose-200 uppercase tracking-wider font-medium">
            <ArrowDownRight className="w-4 h-4 text-white" />
            <span>Verkaufen (Short)</span>
          </div>
          <span className="text-lg font-bold font-mono tracking-tight text-white mt-0.5">
            {formatPrice(bid, symbol)}
          </span>
          <span className="text-[10px] text-rose-200/70 font-mono">Geldkurs (Bid)</span>
        </button>

        {/* BUY Button */}
        <button
          onClick={handleBuy}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/50 active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 text-xs text-emerald-200 uppercase tracking-wider font-medium">
            <ArrowUpRight className="w-4 h-4 text-white" />
            <span>Kaufen (Long)</span>
          </div>
          <span className="text-lg font-bold font-mono tracking-tight text-white mt-0.5">
            {formatPrice(ask, symbol)}
          </span>
          <span className="text-[10px] text-emerald-200/70 font-mono">Briefkurs (Ask)</span>
        </button>
      </div>

      {/* Active Trades Section */}
      <div className="flex flex-col gap-2 pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-300">
            Offene Positionen ({activeOrders.length})
          </span>
          {activeOrders.length > 0 && (
            <span className={`font-mono font-semibold tabular-nums ${totalOpenPnlEur >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Gesamt: {totalOpenPnlEur >= 0 ? `+${totalOpenPnlEur.toFixed(2)}` : totalOpenPnlEur.toFixed(2)} € ({totalOpenPnlPips >= 0 ? `+${totalOpenPnlPips.toFixed(1)}` : totalOpenPnlPips.toFixed(1)} Pips)
            </span>
          )}
        </div>

        {activeOrders.length === 0 ? (
          <div className="py-4 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/40">
            Keine offenen Trades. Wähle Kaufen oder Verkaufen, um zu üben!
          </div>
        ) : (
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {activeOrders.map((order) => {
              const isProfit = order.pnlEur >= 0;
              return (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        order.type === 'BUY'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {order.type} {order.lotSize}L
                    </span>
                    <span className="text-slate-300">
                      @{formatPrice(order.openPrice, order.symbol)}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`font-bold tabular-nums ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {order.pnlEur >= 0 ? `+${order.pnlEur.toFixed(2)}` : order.pnlEur.toFixed(2)} €
                      </div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        {order.pnlPips >= 0 ? `+${order.pnlPips.toFixed(1)}` : order.pnlPips.toFixed(1)} Pips
                      </div>
                    </div>

                    <button
                      onClick={() => onCloseOrder(order.id, 'MANUAL')}
                      className="p-1 rounded bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-400 border border-slate-700/60 transition-colors cursor-pointer"
                      title="Position schließen"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

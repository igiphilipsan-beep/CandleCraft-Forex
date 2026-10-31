import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Target, Award, RotateCcw, BarChart3, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { EquityPoint, TradeOrder } from '../../types/forex';
import { formatPrice } from '../../utils/calculations';

interface StatsViewProps {
  balance: number;
  equity: number;
  tradeHistory: TradeOrder[];
  equityHistory: EquityPoint[];
  onResetAccount: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({
  balance,
  equity,
  tradeHistory,
  equityHistory,
  onResetAccount,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const initialBalance = 10000;
  const totalTrades = tradeHistory.length;
  const winningTrades = tradeHistory.filter((t) => t.pnlEur > 0);
  const losingTrades = tradeHistory.filter((t) => t.pnlEur < 0);
  const breakEvenTrades = tradeHistory.filter((t) => t.pnlEur === 0);

  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades) * 100 : 0;
  const totalPnlEur = balance - initialBalance;
  const totalPnlPercent = ((balance - initialBalance) / initialBalance) * 100;

  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnlEur, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnlEur, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? '∞' : '0.00';

  const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
  const crv = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : avgWin > 0 ? '1:∞' : '1:0';

  const totalPips = tradeHistory.reduce((sum, t) => sum + t.pnlPips, 0);

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-sky-400" />
            <span>Trading-Performance & Statistiken</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Umfassende Analyse deiner bisherigen Übungs-Trades, Trefferquote und Kontoverlauf.
          </p>
        </div>

        {/* Reset button */}
        <div>
          {showConfirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300">Wirklich zurücksetzen?</span>
              <button
                onClick={() => {
                  onResetAccount();
                  setShowConfirmReset(false);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Ja, Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs cursor-pointer"
              >
                Abbrechen
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Fortschritt zurücksetzen</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Kontostand */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium block">Aktueller Kontostand</span>
          <div className="text-2xl font-bold font-mono text-white mt-1 tabular-nums">
            {balance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
          </div>
          <span className="text-[11px] text-slate-500 block mt-0.5">Start: 10.000,00 €</span>
        </div>

        {/* Gesamt PnL */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium block">Gesamtgewinn / Verlust</span>
          <div className={`text-2xl font-bold font-mono mt-1 tabular-nums ${totalPnlEur >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnlEur >= 0 ? `+${totalPnlEur.toFixed(2)}` : totalPnlEur.toFixed(2)} €
          </div>
          <span className={`text-[11px] font-mono block mt-0.5 ${totalPnlPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnlPercent >= 0 ? `+${totalPnlPercent.toFixed(2)}%` : `${totalPnlPercent.toFixed(2)}%`} ({totalPips >= 0 ? `+${totalPips.toFixed(1)}` : totalPips.toFixed(1)} Pips)
          </span>
        </div>

        {/* Trefferquote */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium block">Trefferquote (Win Rate)</span>
          <div className="text-2xl font-bold font-mono text-sky-400 mt-1 tabular-nums">
            {winRate.toFixed(1)}%
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {winningTrades.length} Win · {losingTrades.length} Loss ({totalTrades} Trades)
          </span>
        </div>

        {/* Profit Factor & CRV */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
          <span className="text-xs text-slate-400 font-medium block">Chance-Risiko (CRV) / Faktor</span>
          <div className="text-2xl font-bold font-mono text-amber-400 mt-1 tabular-nums">
            1 : {crv}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Profit-Faktor: <strong className="text-slate-200">{profitFactor}</strong>
          </span>
        </div>
      </div>

      {/* Kontoverlauf (Equity Curve Chart) */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white text-base">Verlauf des Spielgeld-Kontos</h3>
            <span className="text-xs text-slate-400">Entwicklung der Equity über Zeit</span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            {equityHistory.length} Datenpunkte
          </div>
        </div>

        <EquityCurveChart equityHistory={equityHistory} initialBalance={initialBalance} />
      </div>

      {/* Trade History Journal */}
      <div className="flex flex-col gap-3 bg-slate-900/90 border border-slate-800 rounded-xl p-5">
        <h3 className="font-bold text-white text-base">Trade-Journal ({totalTrades})</h3>

        {totalTrades === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 bg-slate-950/40 rounded-lg border border-slate-800/40">
            Noch keine geschlossenen Trades vorhanden. Übe im Chart-Simulator!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="py-2.5 px-3">Symbol</th>
                  <th className="py-2.5 px-3">Richtung</th>
                  <th className="py-2.5 px-3">Lots</th>
                  <th className="py-2.5 px-3">Einstieg</th>
                  <th className="py-2.5 px-3">Ausstieg</th>
                  <th className="py-2.5 px-3">Grund</th>
                  <th className="py-2.5 px-3 text-right">Pips</th>
                  <th className="py-2.5 px-3 text-right">Gewinn (€)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tradeHistory.slice().reverse().map((trade) => {
                  const isWin = trade.pnlEur > 0;
                  return (
                    <tr key={trade.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {trade.symbol.replace('=X', '')}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            trade.type === 'BUY'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50'
                              : 'bg-rose-950 text-rose-400 border border-rose-800/50'
                          }`}
                        >
                          {trade.type}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{trade.lotSize}</td>
                      <td className="py-2.5 px-3 text-slate-300">{formatPrice(trade.openPrice, trade.symbol)}</td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {trade.closePrice ? formatPrice(trade.closePrice, trade.symbol) : '-'}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[11px] text-slate-400">
                          {trade.closeReason === 'TP' ? 'Take-Profit 🎯' : trade.closeReason === 'SL' ? 'Stop-Loss 🛡️' : 'Manuell ✋'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.pnlPips >= 0 ? `+${trade.pnlPips.toFixed(1)}` : trade.pnlPips.toFixed(1)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-bold tabular-nums ${isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.pnlEur >= 0 ? `+${trade.pnlEur.toFixed(2)}` : trade.pnlEur.toFixed(2)} €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// Clean SVG Equity Curve
const EquityCurveChart: React.FC<{ equityHistory: EquityPoint[]; initialBalance: number }> = ({
  equityHistory,
  initialBalance,
}) => {
  if (equityHistory.length < 2) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-slate-500 bg-slate-950/50 rounded-lg border border-slate-800/50">
        Schließe mindestens 2 Trades ab, um deine Kontokurve zu zeichnen.
      </div>
    );
  }

  const values = equityHistory.map((p) => p.equity);
  const minVal = Math.min(initialBalance * 0.95, ...values);
  const maxVal = Math.max(initialBalance * 1.05, ...values);
  const range = maxVal - minVal || 1;

  const width = 800;
  const height = 180;
  const padding = 20;

  const points = equityHistory.map((p, idx) => {
    const x = padding + (idx / (equityHistory.length - 1)) * (width - padding * 2);
    const y = height - padding - ((p.equity - minVal) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathD = `M ${points.join(' L ')}`;
  const baselineY = height - padding - ((initialBalance - minVal) / range) * (height - padding * 2);

  const lastEquity = values[values.length - 1];
  const isNetProfit = lastEquity >= initialBalance;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        {/* Baseline (10,000 €) */}
        <line
          x1={padding}
          y1={baselineY}
          x2={width - padding}
          y2={baselineY}
          stroke="#475569"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <text
          x={width - padding}
          y={baselineY - 6}
          fill="#94a3b8"
          fontSize="10"
          fontFamily="monospace"
          textAnchor="end"
        >
          Start 10.000 €
        </text>

        {/* Equity Line */}
        <path
          d={pathD}
          fill="none"
          stroke={isNetProfit ? '#22c55e' : '#ef4444'}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {equityHistory.map((p, idx) => {
          const x = padding + (idx / (equityHistory.length - 1)) * (width - padding * 2);
          const y = height - padding - ((p.equity - minVal) / range) * (height - padding * 2);
          return (
            <circle
              key={idx}
              cx={x}
              cy={y}
              r="3.5"
              fill="#090d16"
              stroke={p.equity >= initialBalance ? '#22c55e' : '#ef4444'}
              strokeWidth="2"
            />
          );
        })}
      </svg>
    </div>
  );
};

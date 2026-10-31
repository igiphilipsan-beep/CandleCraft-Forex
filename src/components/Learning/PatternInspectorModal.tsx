import React from 'react';
import { X, CheckCircle2, TrendingUp, TrendingDown, MinusCircle, Lightbulb, ShieldCheck } from 'lucide-react';
import { DetectedPattern } from '../../types/forex';
import { PATTERN_DEFINITIONS } from '../../utils/patterns';

interface PatternInspectorModalProps {
  pattern: DetectedPattern | null;
  onClose: () => void;
}

export const PatternInspectorModal: React.FC<PatternInspectorModalProps> = ({
  pattern,
  onClose,
}) => {
  if (!pattern) return null;

  const def = PATTERN_DEFINITIONS[pattern.type] || {
    name: pattern.name,
    germanName: pattern.germanName,
    signal: pattern.signal,
    description: pattern.description,
    psychology: pattern.psychology,
    confirmation: pattern.confirmation,
    reliability: pattern.reliability,
    rules: [],
  };

  const isBull = pattern.signal === 'bullish';
  const isBear = pattern.signal === 'bearish';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                isBull
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : isBear
                  ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-500/10 text-slate-300 border border-slate-500/30'
              }`}
            >
              {isBull && <TrendingUp className="w-5 h-5" />}
              {isBear && <TrendingDown className="w-5 h-5" />}
              {!isBull && !isBear && <MinusCircle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{def.germanName}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="font-mono text-slate-300">{def.name}</span>
                <span>·</span>
                <span className={isBull ? 'text-emerald-400 font-semibold' : isBear ? 'text-rose-400 font-semibold' : 'text-slate-300'}>
                  {isBull ? 'Bullisches Signal (Kauf)' : isBear ? 'Bärisches Signal (Verkauf)' : 'Neutral / Unentschlossenheit'}
                </span>
                <span>·</span>
                <span className="text-slate-400">Zuverlässigkeit: <strong className="text-white">{def.reliability}</strong></span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[75vh] overflow-y-auto">
          {/* Visual Mini Graphic */}
          <div className="flex items-center justify-center p-6 bg-slate-950 rounded-xl border border-slate-800/80">
            <CandlestickPatternSVG type={pattern.type} />
          </div>

          {/* Description */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Was bedeutet dieses Muster?
            </h4>
            <p className="text-sm text-slate-200 leading-relaxed">
              {def.description}
            </p>
          </div>

          {/* Psychology */}
          <div className="p-4 bg-sky-950/20 border border-sky-900/40 rounded-xl">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1.5">
              <Lightbulb className="w-4 h-4 text-sky-400" />
              Marktpsychologie (Käufer vs. Verkäufer)
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {def.psychology}
            </p>
          </div>

          {/* Rules & Confirmation */}
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-xl">
            <h4 className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Trading-Setup & Bestätigung
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              {def.confirmation}
            </p>

            {def.rules && def.rules.length > 0 && (
              <ul className="flex flex-col gap-1.5">
                {def.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
          >
            Verstanden & Schließen
          </button>
        </div>
      </div>
    </div>
  );
};

// SVG Candlestick renderer for the pattern modal
export const CandlestickPatternSVG: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'hammer':
      return (
        <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
          <line x1="50" y1="20" x2="50" y2="90" stroke="#22c55e" strokeWidth="3" />
          <rect x="35" y="20" width="30" height="25" rx="2" fill="#22c55e" />
          <text x="50" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Langer unterer Docht</text>
        </svg>
      );
    case 'shooting_star':
      return (
        <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
          <line x1="50" y1="10" x2="50" y2="80" stroke="#ef4444" strokeWidth="3" />
          <rect x="35" y="55" width="30" height="25" rx="2" fill="#ef4444" />
          <text x="50" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Langer oberer Docht</text>
        </svg>
      );
    case 'bullish_engulfing':
      return (
        <svg width="140" height="120" viewBox="0 0 120 100" className="overflow-visible">
          {/* Red candle */}
          <line x1="40" y1="35" x2="40" y2="75" stroke="#ef4444" strokeWidth="2.5" />
          <rect x="30" y="45" width="20" height="20" rx="1.5" fill="#ef4444" />
          {/* Big Green candle */}
          <line x1="75" y1="20" x2="75" y2="85" stroke="#22c55e" strokeWidth="2.5" />
          <rect x="65" y="30" width="20" height="50" rx="1.5" fill="#22c55e" />
          <text x="60" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Grün umschließt Rot</text>
        </svg>
      );
    case 'bearish_engulfing':
      return (
        <svg width="140" height="120" viewBox="0 0 120 100" className="overflow-visible">
          {/* Green candle */}
          <line x1="40" y1="35" x2="40" y2="75" stroke="#22c55e" strokeWidth="2.5" />
          <rect x="30" y="45" width="20" height="20" rx="1.5" fill="#22c55e" />
          {/* Big Red candle */}
          <line x1="75" y1="20" x2="75" y2="85" stroke="#ef4444" strokeWidth="2.5" />
          <rect x="65" y="30" width="20" height="50" rx="1.5" fill="#ef4444" />
          <text x="60" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Rot verschlingt Grün</text>
        </svg>
      );
    case 'doji':
    case 'dragonfly_doji':
    case 'gravestone_doji':
      return (
        <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
          <line x1="50" y1="15" x2="50" y2="85" stroke="#cbd5e1" strokeWidth="3" />
          <line x1="30" y1="50" x2="70" y2="50" stroke="#cbd5e1" strokeWidth="4" />
          <text x="50" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Eröffnung = Schluss</text>
        </svg>
      );
    case 'morning_star':
      return (
        <svg width="160" height="120" viewBox="0 0 140 100" className="overflow-visible">
          {/* Red 1 */}
          <line x1="30" y1="20" x2="30" y2="75" stroke="#ef4444" strokeWidth="2" />
          <rect x="22" y="30" width="16" height="40" fill="#ef4444" />
          {/* Star 2 */}
          <line x1="70" y1="70" x2="70" y2="90" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="64" y="75" width="12" height="10" fill="#cbd5e1" />
          {/* Green 3 */}
          <line x1="110" y1="25" x2="110" y2="80" stroke="#22c55e" strokeWidth="2" />
          <rect x="102" y="35" width="16" height="40" fill="#22c55e" />
          <text x="70" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">3-Kerzen Trendwende</text>
        </svg>
      );
    default:
      return (
        <svg width="120" height="120" viewBox="0 0 100 100" className="overflow-visible">
          <line x1="50" y1="15" x2="50" y2="85" stroke="#38bdf8" strokeWidth="3" />
          <rect x="35" y="30" width="30" height="40" rx="2" fill="#38bdf8" />
          <text x="50" y="105" textAnchor="middle" fill="#94a3b8" fontSize="10" fontFamily="sans-serif">Kerzenformation</text>
        </svg>
      );
  }
};

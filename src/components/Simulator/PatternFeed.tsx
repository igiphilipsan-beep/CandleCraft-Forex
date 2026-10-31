import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, MinusCircle, Info, ChevronRight } from 'lucide-react';
import { DetectedPattern } from '../../types/forex';

interface PatternFeedProps {
  patterns: DetectedPattern[];
  onSelectPattern: (p: DetectedPattern) => void;
}

export const PatternFeed: React.FC<PatternFeedProps> = ({
  patterns,
  onSelectPattern,
}) => {
  // Show newest detected patterns first
  const reversed = [...patterns].reverse();

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/70 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Erkannte Muster ({patterns.length})
          </h3>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">Letzte 30 Kerzen</span>
      </div>

      <div className="flex-1 p-2 overflow-y-auto max-h-[360px] flex flex-col gap-1.5">
        {patterns.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center gap-2">
            <Info className="w-5 h-5 text-slate-600" />
            <span>Noch keine Kerzenmuster im aktuellen Ausschnitt erkannt.</span>
            <span className="text-[11px] text-slate-600">Klicke &quot;Nächste Kerze&quot;, um den Replay fortzusetzen.</span>
          </div>
        ) : (
          reversed.map((p) => {
            const isBull = p.signal === 'bullish';
            const isBear = p.signal === 'bearish';
            return (
              <button
                key={p.id}
                onClick={() => onSelectPattern(p)}
                className="w-full text-left p-2.5 rounded-lg bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer group flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`p-1.5 rounded-md shrink-0 ${
                      isBull
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : isBear
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-slate-500/10 text-slate-300'
                    }`}
                  >
                    {isBull && <TrendingUp className="w-3.5 h-3.5" />}
                    {isBear && <TrendingDown className="w-3.5 h-3.5" />}
                    {!isBull && !isBear && <MinusCircle className="w-3.5 h-3.5" />}
                  </div>

                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-200 group-hover:text-sky-300 transition-colors truncate">
                      {p.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {p.germanName.split('(')[0]} · {isBull ? 'Kauf-Signal' : isBear ? 'Verkauf-Signal' : 'Neutral'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 text-slate-500 group-hover:text-slate-300">
                  <span className="text-[10px] font-mono font-medium hidden sm:inline">{p.reliability}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

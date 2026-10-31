import React, { useState } from 'react';
import { Search, TrendingUp, TrendingDown, MinusCircle, BookOpen, ChevronRight, Check } from 'lucide-react';
import { PATTERN_DEFINITIONS, PatternDefinition } from '../../utils/patterns';
import { CandlestickPatternSVG, PatternInspectorModal } from './PatternInspectorModal';
import { DetectedPattern } from '../../types/forex';

export const PatternLexikon: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSignal, setFilterSignal] = useState<'all' | 'bullish' | 'bearish' | 'neutral'>('all');
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);

  const patternList = Object.values(PATTERN_DEFINITIONS);

  const filtered = patternList.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.germanName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filterSignal === 'all' || p.signal === filterSignal;

    return matchesSearch && matchesFilter;
  });

  const handleOpenPattern = (def: PatternDefinition) => {
    setSelectedPattern({
      id: def.type,
      time: Math.floor(Date.now() / 1000),
      candleIndex: 0,
      type: def.type,
      name: def.name,
      germanName: def.germanName,
      signal: def.signal,
      description: def.description,
      psychology: def.psychology,
      confirmation: def.confirmation,
      reliability: def.reliability,
      price: 1.0850,
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-sky-400" />
            <span>Forex Kerzen-Lexikon & Muster-Bibliothek</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Lerne die Psychologie und Mechanik hinter den 17 wichtigsten japanischen Candlestick-Mustern. Jedes Muster erklärt, was Käufer und Verkäufer antreibt und wie du Einstiege planst.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Muster suchen (z. B. Hammer, Doji)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 w-56 sm:w-64 focus:outline-none focus:border-sky-500"
            />
          </div>

          {/* Filter segment */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setFilterSignal('all')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterSignal === 'all' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterSignal('bullish')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterSignal === 'bullish' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bullisch
            </button>
            <button
              onClick={() => setFilterSignal('bearish')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterSignal === 'bearish' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bärisch
            </button>
            <button
              onClick={() => setFilterSignal('neutral')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer ${
                filterSignal === 'neutral' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Neutral
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Patterns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((def) => {
          const isBull = def.signal === 'bullish';
          const isBear = def.signal === 'bearish';

          return (
            <div
              key={def.type}
              onClick={() => handleOpenPattern(def)}
              className="group flex flex-col justify-between p-5 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 rounded-xl transition-all cursor-pointer shadow-lg hover:shadow-xl"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`p-2 rounded-lg ${
                        isBull
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isBear
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          : 'bg-slate-500/10 text-slate-300 border border-slate-500/30'
                      }`}
                    >
                      {isBull && <TrendingUp className="w-4 h-4" />}
                      {isBear && <TrendingDown className="w-4 h-4" />}
                      {!isBull && !isBear && <MinusCircle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-sky-300 transition-colors">
                        {def.name}
                      </h3>
                      <span className="text-xs text-slate-400 block">{def.germanName}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                      isBull
                        ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
                        : isBear
                        ? 'bg-rose-950/60 text-rose-400 border-rose-800/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {isBull ? 'Bullisch' : isBear ? 'Bärisch' : 'Neutral'}
                  </span>
                </div>

                <div className="h-28 flex items-center justify-center bg-slate-950/80 rounded-lg border border-slate-800/60 p-2 my-3">
                  <CandlestickPatternSVG type={def.type} />
                </div>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                  {def.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Zuverlässigkeit: <strong className="text-slate-200">{def.reliability}</strong></span>
                <span className="flex items-center gap-1 text-sky-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  Details <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspector Modal */}
      <PatternInspectorModal
        pattern={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
};

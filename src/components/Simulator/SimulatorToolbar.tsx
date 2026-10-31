import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Filter, RefreshCw, Check, CheckSquare, Square, ChevronDown } from 'lucide-react';
import { CandlePatternType, ForexSymbol, Timeframe } from '../../types/forex';
import { FOREX_PAIRS, TIMEFRAMES } from '../../data/forexPairs';
import { PATTERN_CATEGORIES, ALL_PATTERN_TYPES } from '../../utils/patterns';

interface SimulatorToolbarProps {
  symbol: ForexSymbol;
  timeframe: Timeframe;
  onSymbolChange: (s: ForexSymbol) => void;
  onTimeframeChange: (t: Timeframe) => void;
  showPatterns: boolean;
  onTogglePatterns: () => void;
  patternCount: number;
  selectedPatternTypes: Set<CandlePatternType>;
  onTogglePatternType: (types: CandlePatternType[]) => void;
  onSelectAllPatterns: () => void;
  onClearAllPatterns: () => void;
  indicators: {
    sma20: boolean;
    sma50: boolean;
    sma200: boolean;
    rsi: boolean;
    volume: boolean;
  };
  onToggleIndicator: (key: 'sma20' | 'sma50' | 'sma200' | 'rsi' | 'volume') => void;
  isLoadingData: boolean;
  onReloadData: () => void;
  isLiveYahoo: boolean;
}

export const SimulatorToolbar: React.FC<SimulatorToolbarProps> = ({
  symbol,
  timeframe,
  onSymbolChange,
  onTimeframeChange,
  showPatterns,
  onTogglePatterns,
  patternCount,
  selectedPatternTypes,
  onTogglePatternType,
  onSelectAllPatterns,
  onClearAllPatterns,
  indicators,
  onToggleIndicator,
  isLoadingData,
  onReloadData,
  isLiveYahoo,
}) => {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allSelected = selectedPatternTypes.size === ALL_PATTERN_TYPES.length;

  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
      {/* Top Row: Symbol, Timeframe, Data source, Indicators */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Pair & Timeframe */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Paar:</label>
            <select
              value={symbol}
              onChange={(e) => onSymbolChange(e.target.value as ForexSymbol)}
              className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono font-bold text-white focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {Object.values(FOREX_PAIRS).map((p) => (
                <option key={p.symbol} value={p.symbol}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => onTimeframeChange(tf.id)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                  timeframe === tf.id
                    ? 'bg-sky-500 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
                title={tf.subLabel}
              >
                {tf.label}
              </button>
            ))}
          </div>

          {/* Data source indicator */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
            <span className="text-slate-500">Quelle:</span>
            <span>{isLiveYahoo ? 'Yahoo Finance (Live)' : 'Historischer Datensatz'}</span>
            <button
              onClick={onReloadData}
              disabled={isLoadingData}
              className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer ml-0.5"
              title="Daten neu laden"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Indicators */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono self-start lg:self-auto">
          <span className="text-[10px] text-slate-500 px-1 hidden sm:inline">Indikatoren:</span>

          <button
            onClick={() => onToggleIndicator('sma20')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              indicators.sma20 ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMA 20
          </button>

          <button
            onClick={() => onToggleIndicator('sma50')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              indicators.sma50 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMA 50
          </button>

          <button
            onClick={() => onToggleIndicator('sma200')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              indicators.sma200 ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            SMA 200
          </button>

          <button
            onClick={() => onToggleIndicator('rsi')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              indicators.rsi ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            RSI
          </button>

          <button
            onClick={() => onToggleIndicator('volume')}
            className={`px-2 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              indicators.volume ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Volumen
          </button>
        </div>
      </div>

      {/* Bottom Row: REQUIREMENT 3 & 4 - Prominent "Muster anzeigen" switch (default OFF) & Filter selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 bg-slate-950/40 -mx-3 -mb-3 p-3 rounded-b-xl">
        {/* Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={onTogglePatterns}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              showPatterns ? 'bg-amber-500' : 'bg-slate-700'
            }`}
            role="switch"
            aria-checked={showPatterns}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                showPatterns ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-200">
                Muster anzeigen {showPatterns ? '(EIN)' : '(AUS)'}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                  showPatterns
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {showPatterns ? `${patternCount} in letzten 30 Kerzen` : 'Standard: Aus'}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              {showPatterns
                ? 'Kleine Pfeile (🟢 Steigend, 🔴 Fallend, ⚪ Doji) ohne störenden Text markiert.'
                : 'Trainingsmodus aktiv: Suche Formationen selbst im Chart, bevor du auflöst!'}
            </span>
          </div>
        </div>

        {/* Pattern Filter Dropdown / Popover (Requirement 4) */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5 text-sky-400" />
            <span>Muster-Filter ({selectedPatternTypes.size})</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 bottom-full sm:bottom-auto sm:top-full mb-2 sm:mb-0 sm:mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white">Welche Muster anzeigen?</span>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <button
                    onClick={onSelectAllPatterns}
                    className="text-sky-400 hover:underline cursor-pointer"
                  >
                    Alle
                  </button>
                  <span className="text-slate-600">·</span>
                  <button
                    onClick={onClearAllPatterns}
                    className="text-slate-400 hover:underline cursor-pointer"
                  >
                    Keine
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 max-h-60 overflow-y-auto pr-1">
                {PATTERN_CATEGORIES.map((cat) => {
                  const isChecked = cat.types.every((t) => selectedPatternTypes.has(t));
                  const isPartial = !isChecked && cat.types.some((t) => selectedPatternTypes.has(t));

                  return (
                    <label
                      key={cat.id}
                      onClick={() => onTogglePatternType(cat.types)}
                      className="flex items-start gap-2 p-1.5 rounded hover:bg-slate-800/80 cursor-pointer transition-colors"
                    >
                      <div className="mt-0.5 text-sky-400">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 fill-sky-500/20 text-sky-400" />
                        ) : isPartial ? (
                          <CheckSquare className="w-4 h-4 text-sky-400 opacity-60" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-slate-200">{cat.name}</span>
                        <span className="text-[10px] text-slate-500">{cat.description}</span>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-800 text-[10px] text-slate-400 text-center">
                Nur ausgewählte Muster der letzten 30 Kerzen werden markiert.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

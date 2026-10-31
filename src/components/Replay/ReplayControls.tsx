import React from 'react';
import { Play, Pause, SkipForward, FastForward, Shuffle, RotateCcw } from 'lucide-react';

interface ReplayControlsProps {
  currentIndex: number;
  totalCandles: number;
  isPlaying: boolean;
  playSpeed: number; // in milliseconds
  onNextCandle: (count?: number) => void;
  onTogglePlay: () => void;
  onChangeSpeed: (speedMs: number) => void;
  onRandomStart: () => void;
  onReset: () => void;
}

const SPEED_OPTIONS = [
  { label: '0.2s', value: 200 },
  { label: '0.5s', value: 500 },
  { label: '1.0s', value: 1000 },
  { label: '2.0s', value: 2000 },
  { label: '4.0s', value: 4000 },
];

export const ReplayControls: React.FC<ReplayControlsProps> = ({
  currentIndex,
  totalCandles,
  isPlaying,
  playSpeed,
  onNextCandle,
  onTogglePlay,
  onChangeSpeed,
  onRandomStart,
  onReset,
}) => {
  const progressPercent = totalCandles > 0 ? Math.min(100, Math.round((currentIndex / totalCandles) * 100)) : 0;
  const isAtEnd = currentIndex >= totalCandles;

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl shadow-lg">
      {/* Replay action buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Next Candle button (Primary) */}
        <button
          onClick={() => onNextCandle(1)}
          disabled={isPlaying}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95 cursor-pointer ${
            isPlaying
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
          }`}
          title="Nächste historische Kerze aufdecken (Leertaste)"
        >
          <SkipForward className="w-4 h-4" />
          <span>Nächste Kerze</span>
        </button>

        {/* Step +5 */}
        <button
          onClick={() => onNextCandle(5)}
          disabled={isPlaying}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer"
          title="5 Kerzen vorspringen"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>+5</span>
        </button>

        {/* Step +10 */}
        <button
          onClick={() => onNextCandle(10)}
          disabled={isPlaying}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-colors disabled:opacity-50 cursor-pointer"
          title="10 Kerzen vorspringen"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>+10</span>
        </button>

        {/* Auto-Play Toggle */}
        <button
          onClick={onTogglePlay}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isPlaying
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-amber-300" /> : <Play className="w-4 h-4 fill-slate-300" />}
          <span>{isPlaying ? 'Pause' : 'Auto-Play'}</span>
        </button>

        {/* Random historical start */}
        <button
          onClick={onRandomStart}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors cursor-pointer"
          title="Zufälliger historischer Zeitpunkt in der Vergangenheit"
        >
          <Shuffle className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden md:inline">Zufälliger Start</span>
        </button>

        {/* Reset */}
        <button
          onClick={onReset}
          className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-colors cursor-pointer"
          title="Replay zurücksetzen"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Selector and Progress info */}
      <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
        {/* Playback speed buttons */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <span className="text-[11px] font-medium text-slate-500 px-1.5 hidden lg:inline">Tempo:</span>
          {SPEED_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChangeSpeed(opt.value)}
              className={`px-2 py-1 rounded text-xs font-mono font-medium transition-colors cursor-pointer ${
                playSpeed === opt.value
                  ? 'bg-sky-500 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Progress counter */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 min-w-[130px] justify-end">
          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span>
            {currentIndex} / {totalCandles}
          </span>
        </div>
      </div>
    </div>
  );
};

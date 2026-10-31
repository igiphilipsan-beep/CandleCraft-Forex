import React from 'react';
import { CandlestickChart, BookOpen, HelpCircle, BarChart3, Wallet } from 'lucide-react';

export type ActiveTab = 'simulator' | 'lexikon' | 'quiz' | 'stats';

interface AppHeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  balance: number;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  activeTab,
  onTabChange,
  balance,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md">
      {/* Zone 1: Single text element wordmark */}
      <div
        onClick={() => onTabChange('simulator')}
        className="flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
      >
        <CandlestickChart className="w-5 h-5 text-emerald-400 shrink-0" />
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap">
          CandleCraft <span className="text-emerald-400 font-medium">Forex</span>
        </span>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="flex items-center gap-1 sm:gap-6 text-xs sm:text-sm font-medium overflow-x-auto py-1">
        <button
          onClick={() => onTabChange('simulator')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
            activeTab === 'simulator'
              ? 'text-white font-semibold border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CandlestickChart className="w-4 h-4 hidden sm:inline" />
          <span>Chart-Simulator</span>
        </button>

        <button
          onClick={() => onTabChange('lexikon')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
            activeTab === 'lexikon'
              ? 'text-white font-semibold border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4 hidden sm:inline" />
          <span>Muster-Lexikon</span>
        </button>

        <button
          onClick={() => onTabChange('quiz')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
            activeTab === 'quiz'
              ? 'text-white font-semibold border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4 hidden sm:inline" />
          <span>Quiz-Modus</span>
        </button>

        <button
          onClick={() => onTabChange('stats')}
          className={`flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 pb-1 cursor-pointer ${
            activeTab === 'stats'
              ? 'text-white font-semibold border-b-2 border-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 hidden sm:inline" />
          <span>Statistiken</span>
        </button>
      </nav>

      {/* Zone 3: 1 primary action / virtual balance element */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg whitespace-nowrap shrink-0">
          <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span className="font-mono text-xs font-bold text-slate-100 tabular-nums">
            {balance.toLocaleString('de-DE', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">Demo</span>
        </div>
      </div>
    </header>
  );
};

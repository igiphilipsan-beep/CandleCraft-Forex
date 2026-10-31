import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { HelpCircle, ArrowUpRight, ArrowDownRight, CheckCircle2, XCircle, Sparkles, Award, RotateCcw, Lightbulb } from 'lucide-react';
import { QuizProgress, QuizScenario } from '../../types/forex';
import { QUIZ_SCENARIOS } from '../../data/historicalFallbackData';
import { TradingViewChart } from '../Chart/TradingViewChart';
import { detectPatterns } from '../../utils/patterns';

interface QuizViewProps {
  progress: QuizProgress;
  onUpdateProgress: (newProgress: QuizProgress) => void;
}

export const QuizView: React.FC<QuizViewProps> = ({ progress, onUpdateProgress }) => {
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);
  const [userChoice, setUserChoice] = useState<'UP' | 'DOWN' | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealedCount, setRevealedCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const scenario: QuizScenario = QUIZ_SCENARIOS[currentScenarioIndex] || QUIZ_SCENARIOS[0];

  // The displayed candles: visibleCandles + however many revealed candles
  const displayedCandles = [
    ...scenario.visibleCandles,
    ...scenario.revealCandles.slice(0, revealedCount),
  ];

  const detected = detectPatterns(displayedCandles);

  // When user makes a choice: reveal animation of next 10 candles
  const handleChoice = (choice: 'UP' | 'DOWN') => {
    if (userChoice !== null) return;

    setUserChoice(choice);
    const isCorrect = choice === scenario.correctDirection;

    // Trigger reveal sequence of the 10 candles
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setRevealedCount(count);
      if (count >= scenario.revealCandles.length) {
        clearInterval(interval);
        setIsRevealed(true);

        if (isCorrect) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#22c55e', '#38bdf8', '#fbbf24'],
          });
        }

        // Update progress stats
        const newStreak = isCorrect ? progress.currentStreak + 1 : 0;
        const newBest = Math.max(progress.bestStreak, newStreak);
        const newScore = progress.score + (isCorrect ? 100 + newStreak * 20 : 0);

        onUpdateProgress({
          totalAnswered: progress.totalAnswered + 1,
          correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
          currentStreak: newStreak,
          bestStreak: newBest,
          score: newScore,
          history: [
            ...progress.history,
            {
              scenarioId: scenario.id,
              userChoice: choice,
              isCorrect,
              date: Date.now(),
            },
          ],
        });
      }
    }, 150);
  };

  const handleNextScenario = () => {
    setUserChoice(null);
    setIsRevealed(false);
    setRevealedCount(0);
    setShowHint(false);
    setCurrentScenarioIndex((prev) => (prev + 1) % QUIZ_SCENARIOS.length);
  };

  const isCorrect = userChoice === scenario.correctDirection;
  const accuracy = progress.totalAnswered > 0 ? Math.round((progress.correctAnswers / progress.totalAnswered) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 max-w-7xl mx-auto p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Quiz Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Praxis-Training · Modus: Kerzen-Prognose</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Geht der Preis hoch oder runter?
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Analysiere den eingefrorenen Chart. Entscheide, ob die Bullen (Kaufen) oder Bären (Verkaufen) die nächsten 10 Kerzen dominieren.
          </p>
        </div>

        {/* Scorecard */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl p-2.5">
          <div className="px-3 border-r border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Punkte</span>
            <span className="text-base font-bold font-mono text-amber-400">{progress.score}</span>
          </div>
          <div className="px-3 border-r border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Serie</span>
            <span className="text-base font-bold font-mono text-emerald-400">{progress.currentStreak} 🔥</span>
          </div>
          <div className="px-3 text-center">
            <span className="text-[10px] text-slate-500 block uppercase">Treffer</span>
            <span className="text-base font-bold font-mono text-white">{accuracy}%</span>
          </div>
        </div>
      </div>

      {/* Scenario Context Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/50">
              {scenario.symbol.replace('=X', '')}
            </span>
            <span className="text-xs text-slate-400 font-mono">Zeitrahmen: {scenario.timeframe}</span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-semibold text-slate-300">Fall {currentScenarioIndex + 1} von {QUIZ_SCENARIOS.length}</span>
          </div>
          <h3 className="text-base font-bold text-white">{scenario.title}</h3>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            {scenario.scenarioDescription}
          </p>
        </div>

        {scenario.hint && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-colors shrink-0 cursor-pointer"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{showHint ? 'Tipp verbergen' : 'Tipp anzeigen'}</span>
          </button>
        )}
      </div>

      {showHint && scenario.hint && (
        <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded-lg text-xs text-amber-200 animate-in fade-in">
          <strong>Hinweis:</strong> {scenario.hint}
        </div>
      )}

      {/* Chart Viewport */}
      <div className="w-full">
        <TradingViewChart
          candles={displayedCandles}
          symbol={scenario.symbol}
          patterns={detected}
          showPatterns={isRevealed}
          activeOrders={[]}
          indicators={{
            sma20: true,
            sma50: true,
            sma200: false,
            rsi: false,
            volume: true,
          }}
          height={420}
        />
      </div>

      {/* Question & Interactive Decision Buttons */}
      {!isRevealed ? (
        <div className="flex flex-col items-center gap-4 p-6 bg-slate-900 border border-slate-800 rounded-xl">
          <span className="text-sm font-semibold text-slate-200">
            Deine Prognose für die nächsten 10 Kerzen:
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
            {/* BUY / UP */}
            <button
              onClick={() => handleChoice('UP')}
              disabled={userChoice !== null}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-base transition-all shadow-lg cursor-pointer ${
                userChoice === 'UP'
                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/30 scale-105'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:scale-[1.02] shadow-emerald-950/50 active:scale-95'
              }`}
            >
              <ArrowUpRight className="w-6 h-6 stroke-[3]" />
              <div className="text-left">
                <div className="leading-tight">KAUFEN (Long)</div>
                <div className="text-[11px] font-normal text-emerald-100/80">Preis geht hoch</div>
              </div>
            </button>

            {/* SELL / DOWN */}
            <button
              onClick={() => handleChoice('DOWN')}
              disabled={userChoice !== null}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl font-bold text-base transition-all shadow-lg cursor-pointer ${
                userChoice === 'DOWN'
                  ? 'bg-rose-500 text-white ring-4 ring-rose-500/30 scale-105'
                  : 'bg-rose-600 hover:bg-rose-500 text-white hover:scale-[1.02] shadow-rose-950/50 active:scale-95'
              }`}
            >
              <ArrowDownRight className="w-6 h-6 stroke-[3]" />
              <div className="text-left">
                <div className="leading-tight">VERKAUFEN (Short)</div>
                <div className="text-[11px] font-normal text-rose-100/80">Preis fällt</div>
              </div>
            </button>
          </div>

          {userChoice && (
            <div className="text-xs text-sky-400 font-mono animate-pulse">
              Decke die nächsten 10 Kerzen auf... ({revealedCount} / 10)
            </div>
          )}
        </div>
      ) : (
        /* Result & Explanation Card */
        <div
          className={`flex flex-col gap-4 p-6 rounded-xl border animate-in zoom-in-95 duration-300 shadow-xl ${
            isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/40'
              : 'bg-rose-950/30 border-rose-500/40'
          }`}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="text-lg font-bold text-white">
                  {isCorrect ? 'Großartig! Richtige Prognose!' : 'Leider daneben – Gute Lernchance!'}
                </h4>
                <p className="text-xs text-slate-300">
                  Erwartete Richtung: <strong className="text-white">{scenario.correctDirection === 'UP' ? 'KAUFEN (Steigend)' : 'VERKAUFEN (Fallend)'}</strong> · Ergebnis: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{scenario.expectedPips} Pips Bewegung</strong>
                </p>
              </div>
            </div>

            <button
              onClick={handleNextScenario}
              className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Nächstes Szenario &rarr;
            </button>
          </div>

          <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Analyse & Erklärung
            </h5>
            <p className="text-xs text-slate-200 leading-relaxed">
              {scenario.explanation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

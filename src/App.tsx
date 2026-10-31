/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppHeader, ActiveTab } from './components/Header/AppHeader';
import { SimulatorToolbar } from './components/Simulator/SimulatorToolbar';
import { TradingViewChart } from './components/Chart/TradingViewChart';
import { ReplayControls } from './components/Replay/ReplayControls';
import { TradingPanel } from './components/Trading/TradingPanel';
import { PatternFeed } from './components/Simulator/PatternFeed';
import { PatternInspectorModal } from './components/Learning/PatternInspectorModal';
import { PatternLexikon } from './components/Learning/PatternLexikon';
import { QuizView } from './components/Quiz/QuizView';
import { StatsView } from './components/Stats/StatsView';
import { Candle, CandlePatternType, DetectedPattern, EquityPoint, ForexSymbol, QuizProgress, Timeframe, TradeOrder } from './types/forex';
import { generateNextCandle, generateRealisticCandles } from './data/historicalFallbackData';
import { detectPatterns, ALL_PATTERN_TYPES } from './utils/patterns';
import { calculatePipsDiff, calculateTradePnL, getBidAsk } from './utils/calculations';
import { FOREX_PAIRS } from './data/forexPairs';

const STORAGE_KEY_BALANCE = 'forex_sim_balance_v1';
const STORAGE_KEY_HISTORY = 'forex_sim_history_v1';
const STORAGE_KEY_EQUITY = 'forex_sim_equity_v1';
const STORAGE_KEY_QUIZ = 'forex_sim_quiz_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [symbol, setSymbol] = useState<ForexSymbol>('EURUSD=X');
  const [timeframe, setTimeframe] = useState<Timeframe>('1h');

  // Candlestick Data & Replay State
  const [allCandles, setAllCandles] = useState<Candle[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(50);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playSpeed, setPlaySpeed] = useState<number>(1000);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isLiveYahoo, setIsLiveYahoo] = useState<boolean>(false);

  // Indicators & Pattern Detection toggles (Requirement 3: Standard AUS!)
  const [showPatterns, setShowPatterns] = useState<boolean>(false);
  const [selectedPatternTypes, setSelectedPatternTypes] = useState<Set<CandlePatternType>>(
    () => new Set(ALL_PATTERN_TYPES)
  );
  const [selectedPattern, setSelectedPattern] = useState<DetectedPattern | null>(null);
  const [indicators, setIndicators] = useState({
    sma20: true,
    sma50: true,
    sma200: false,
    rsi: false,
    volume: true,
  });

  // Virtual Trading Demo Account (Starts with 10.000 €)
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_BALANCE);
    return saved ? parseFloat(saved) : 10000;
  });

  const [activeOrders, setActiveOrders] = useState<TradeOrder[]>([]);

  const [tradeHistory, setTradeHistory] = useState<TradeOrder[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
    return saved ? JSON.parse(saved) : [];
  });

  const [equityHistory, setEquityHistory] = useState<EquityPoint[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_EQUITY);
    return saved ? JSON.parse(saved) : [{ time: Date.now(), equity: 10000, label: 'Start' }];
  });

  const [quizProgress, setQuizProgress] = useState<QuizProgress>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_QUIZ);
    return saved
      ? JSON.parse(saved)
      : {
          totalAnswered: 0,
          correctAnswers: 0,
          currentStreak: 0,
          bestStreak: 0,
          score: 0,
          history: [],
        };
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_BALANCE, balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EQUITY, JSON.stringify(equityHistory));
  }, [equityHistory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_QUIZ, JSON.stringify(quizProgress));
  }, [quizProgress]);

  // Load candle data from server or fallback
  const loadCandleData = useCallback(async (sym: ForexSymbol, tf: Timeframe) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`/api/forex/candles?symbol=${encodeURIComponent(sym)}&interval=${tf}`);
      if (res.ok) {
        const data = await res.json();
        if (data.candles && data.candles.length >= 30) {
          setAllCandles(data.candles);
          setIsLiveYahoo(true);
          // Set random start point in the past
          const randStart = Math.min(
            data.candles.length - 20,
            Math.max(30, Math.floor(data.candles.length * 0.45) + Math.floor(Math.random() * 20))
          );
          setCurrentIndex(randStart);
          setIsLoadingData(false);
          return;
        }
      }
    } catch {
      // Fallback on network or CORS failure
    }

    // High quality offline fallback data
    const fallback = generateRealisticCandles(sym, tf, 200, Math.floor(Math.random() * 10000));
    setAllCandles(fallback);
    setIsLiveYahoo(false);
    setCurrentIndex(50);
    setIsLoadingData(false);
  }, []);

  // Initial load or on pair/timeframe change
  useEffect(() => {
    loadCandleData(symbol, timeframe);
    setIsPlaying(false);
  }, [symbol, timeframe, loadCandleData]);

  // The slice of candles currently visible to user
  const visibleCandles = allCandles.slice(0, currentIndex);
  const currentCandle = visibleCandles[visibleCandles.length - 1];

  // Auto-detect patterns on visible candles (Requirements 4 & 5: Filtered by type, limited to last 30 candles)
  const detectedPatterns = React.useMemo(() => {
    const rawPatterns = detectPatterns(visibleCandles);
    const recentCandles = visibleCandles.slice(-30);
    const minRecentTime = recentCandles.length > 0 ? recentCandles[0].time : 0;

    return rawPatterns.filter(
      (p) => p.time >= minRecentTime && selectedPatternTypes.has(p.type)
    );
  }, [visibleCandles, selectedPatternTypes]);

  // Pattern filter handlers
  const handleTogglePatternType = (types: CandlePatternType[]) => {
    setSelectedPatternTypes((prev) => {
      const next = new Set(prev);
      const allActive = types.every((t) => next.has(t));
      if (allActive) {
        types.forEach((t) => next.delete(t));
      } else {
        types.forEach((t) => next.add(t));
      }
      return next;
    });
  };

  const handleSelectAllPatterns = () => {
    setSelectedPatternTypes(new Set(ALL_PATTERN_TYPES));
  };

  const handleClearAllPatterns = () => {
    setSelectedPatternTypes(new Set());
  };

  // Check and update open orders whenever a new candle appears
  useEffect(() => {
    if (!currentCandle || activeOrders.length === 0) return;

    const updatedActive: TradeOrder[] = [];
    let balanceDelta = 0;
    const closedThisStep: TradeOrder[] = [];

    activeOrders.forEach((order) => {
      let closed = false;
      let exitPrice = currentCandle.close;
      let closeReason: 'TP' | 'SL' | undefined;

      // Check if SL was hit during this candle's range
      if (order.sl !== undefined) {
        if (order.type === 'BUY' && currentCandle.low <= order.sl) {
          exitPrice = order.sl;
          closeReason = 'SL';
          closed = true;
        } else if (order.type === 'SELL' && currentCandle.high >= order.sl) {
          exitPrice = order.sl;
          closeReason = 'SL';
          closed = true;
        }
      }

      // Check if TP was hit
      if (!closed && order.tp !== undefined) {
        if (order.type === 'BUY' && currentCandle.high >= order.tp) {
          exitPrice = order.tp;
          closeReason = 'TP';
          closed = true;
        } else if (order.type === 'SELL' && currentCandle.low <= order.tp) {
          exitPrice = order.tp;
          closeReason = 'TP';
          closed = true;
        }
      }

      if (closed && closeReason) {
        const { pnlEur, pnlPips } = calculateTradePnL(order, exitPrice);
        balanceDelta += pnlEur;
        closedThisStep.push({
          ...order,
          status: 'CLOSED',
          closePrice: exitPrice,
          closeTime: currentCandle.time,
          closeReason,
          pnlEur,
          pnlPips,
        });
      } else {
        // Still open: update current floating PnL
        const { bid, ask } = getBidAsk(currentCandle.close, order.symbol);
        const checkPrice = order.type === 'BUY' ? bid : ask;
        const { pnlEur, pnlPips } = calculateTradePnL(order, checkPrice);

        updatedActive.push({
          ...order,
          pnlEur,
          pnlPips,
        });
      }
    });

    if (closedThisStep.length > 0) {
      setBalance((prev) => {
        const newBal = Number((prev + balanceDelta).toFixed(2));
        return newBal;
      });
      setEquityHistory((hist) => [
        ...hist,
        {
          time: Date.now(),
          equity: Number((balance + balanceDelta).toFixed(2)),
          label: `Trade (${closedThisStep[0].symbol.replace('=X', '')})`,
        },
      ]);
      setTradeHistory((prev) => [...prev, ...closedThisStep]);
    }

    setActiveOrders(updatedActive);
  }, [currentCandle?.time]);

  // Calculate live floating equity
  const totalOpenPnl = activeOrders.reduce((sum, o) => sum + o.pnlEur, 0);
  const liveEquity = Number((balance + totalOpenPnl).toFixed(2));

  // Advance replay by N candles
  const handleNextCandle = useCallback((stepCount = 1) => {
    setCurrentIndex((prev) => {
      let target = prev + stepCount;
      // If we surpass the pre-loaded data, synthesize continuation candles
      if (target > allCandles.length) {
        const needed = target - allCandles.length;
        let last = allCandles[allCandles.length - 1];
        const added: Candle[] = [];
        const secondsStep =
          timeframe === '1m' ? 60 :
          timeframe === '15m' ? 900 :
          timeframe === '1h' ? 3600 :
          timeframe === '4h' ? 14400 : 86400;

        for (let i = 0; i < needed; i++) {
          const next = generateNextCandle(last, symbol, secondsStep);
          added.push(next);
          last = next;
        }
        setAllCandles((curr) => [...curr, ...added]);
      }
      return target;
    });
  }, [allCandles, symbol, timeframe]);

  // Auto-play interval
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      handleNextCandle(1);
    }, playSpeed);

    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, handleNextCandle]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'simulator') return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.code === 'Space') {
        e.preventDefault();
        handleNextCandle(1);
      } else if (e.code === 'KeyP') {
        e.preventDefault();
        setIsPlaying((p) => !p);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, handleNextCandle]);

  // Jump to random start
  const handleRandomStart = () => {
    if (allCandles.length < 50) return;
    const minStart = 30;
    const maxStart = Math.max(minStart + 10, allCandles.length - 40);
    const rand = minStart + Math.floor(Math.random() * (maxStart - minStart));
    setCurrentIndex(rand);
    setIsPlaying(false);
  };

  // Reset current replay
  const handleResetReplay = () => {
    setCurrentIndex(45);
    setIsPlaying(false);
  };

  // Open a new trade
  const handleOpenOrder = ({
    type,
    lotSize,
    sl,
    tp,
  }: {
    type: 'BUY' | 'SELL';
    lotSize: number;
    sl?: number;
    tp?: number;
  }) => {
    if (!currentCandle) return;
    const { bid, ask } = getBidAsk(currentCandle.close, symbol);
    const entryPrice = type === 'BUY' ? ask : bid;

    const newOrder: TradeOrder = {
      id: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      symbol,
      type,
      openPrice: entryPrice,
      openTime: currentCandle.time,
      sl,
      tp,
      lotSize,
      units: lotSize * 100000,
      status: 'OPEN',
      pnlEur: 0,
      pnlPips: 0,
    };

    // Calculate immediate spread cost
    const exitPrice = type === 'BUY' ? bid : ask;
    const { pnlEur, pnlPips } = calculateTradePnL(newOrder, exitPrice);
    newOrder.pnlEur = pnlEur;
    newOrder.pnlPips = pnlPips;

    setActiveOrders((prev) => [...prev, newOrder]);
  };

  // Close an active trade manually
  const handleCloseOrder = (orderId: string) => {
    if (!currentCandle) return;
    const order = activeOrders.find((o) => o.id === orderId);
    if (!order) return;

    const { bid, ask } = getBidAsk(currentCandle.close, order.symbol);
    const exitPrice = order.type === 'BUY' ? bid : ask;
    const { pnlEur, pnlPips } = calculateTradePnL(order, exitPrice);

    setBalance((prev) => {
      const newBal = Number((prev + pnlEur).toFixed(2));
      return newBal;
    });

    setEquityHistory((hist) => [
      ...hist,
      {
        time: Date.now(),
        equity: Number((balance + pnlEur).toFixed(2)),
        label: `Manuell (${order.symbol.replace('=X', '')})`,
      },
    ]);

    setTradeHistory((prev) => [
      ...prev,
      {
        ...order,
        status: 'CLOSED',
        closePrice: exitPrice,
        closeTime: currentCandle.time,
        closeReason: 'MANUAL',
        pnlEur,
        pnlPips,
      },
    ]);

    setActiveOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  // Reset entire account balance and progress
  const handleResetAccount = () => {
    setBalance(10000);
    setActiveOrders([]);
    setTradeHistory([]);
    setEquityHistory([{ time: Date.now(), equity: 10000, label: 'Neustart' }]);
    localStorage.removeItem(STORAGE_KEY_BALANCE);
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    localStorage.removeItem(STORAGE_KEY_EQUITY);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar Header adhering to Top Bar Contract */}
      <AppHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        balance={balance}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5">
        {/* TAB 1: CHART-SIMULATOR & REPLAY */}
        {activeTab === 'simulator' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-200">
            {/* Top Toolbar (Pair, Timeframe, Indicators, Pattern Toggle & Filter) */}
            <SimulatorToolbar
              symbol={symbol}
              timeframe={timeframe}
              onSymbolChange={setSymbol}
              onTimeframeChange={setTimeframe}
              showPatterns={showPatterns}
              onTogglePatterns={() => setShowPatterns(!showPatterns)}
              patternCount={detectedPatterns.length}
              selectedPatternTypes={selectedPatternTypes}
              onTogglePatternType={handleTogglePatternType}
              onSelectAllPatterns={handleSelectAllPatterns}
              onClearAllPatterns={handleClearAllPatterns}
              indicators={indicators}
              onToggleIndicator={(k) =>
                setIndicators((prev) => ({ ...prev, [k]: !prev[k] }))
              }
              isLoadingData={isLoadingData}
              onReloadData={() => loadCandleData(symbol, timeframe)}
              isLiveYahoo={isLiveYahoo}
            />

            {/* Replay Controls (Nächste Kerze, Auto-Play, Tempo, Zufälliger Start) */}
            <ReplayControls
              currentIndex={currentIndex}
              totalCandles={allCandles.length}
              isPlaying={isPlaying}
              playSpeed={playSpeed}
              onNextCandle={handleNextCandle}
              onTogglePlay={() => setIsPlaying(!isPlaying)}
              onChangeSpeed={setPlaySpeed}
              onRandomStart={handleRandomStart}
              onReset={handleResetReplay}
            />

            {/* Main Interactive Trading Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
              {/* Left / Center 8 Cols: TradingView Candlestick Chart */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <TradingViewChart
                  candles={visibleCandles}
                  symbol={symbol}
                  patterns={detectedPatterns}
                  showPatterns={showPatterns}
                  activeOrders={activeOrders}
                  indicators={indicators}
                  onSelectPattern={(p) => setSelectedPattern(p)}
                  height={500}
                />

                {/* Keyboard shortcut banner */}
                <div className="hidden sm:flex items-center justify-between px-3 py-2 bg-slate-900/60 border border-slate-800/80 rounded-lg text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-300">Leertaste</kbd>
                    <span>= Nächste Kerze aufdecken</span>
                    <span className="text-slate-600">·</span>
                    <kbd className="px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 font-mono text-slate-300">P</kbd>
                    <span>= Auto-Play ein/aus</span>
                  </div>
                  <span className="text-slate-500">Klicke auf Muster im Chart für detaillierte deutsche Erklärungen</span>
                </div>
              </div>

              {/* Right 4 Cols: Order Execution Panel & Pattern Feed */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Practice Trading Panel */}
                <TradingPanel
                  symbol={symbol}
                  currentClosePrice={currentCandle?.close ?? 1.085}
                  balance={balance}
                  equity={liveEquity}
                  activeOrders={activeOrders}
                  onOpenOrder={handleOpenOrder}
                  onCloseOrder={handleCloseOrder}
                />

                {/* Detected Patterns Feed */}
                <PatternFeed
                  patterns={detectedPatterns}
                  onSelectPattern={(p) => setSelectedPattern(p)}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MUSTER-LEXIKON (Candlestick Encyclopedia) */}
        {activeTab === 'lexikon' && <PatternLexikon />}

        {/* TAB 3: QUIZ-MODUS ("Geht der Preis hoch oder runter?") */}
        {activeTab === 'quiz' && (
          <QuizView
            progress={quizProgress}
            onUpdateProgress={setQuizProgress}
          />
        )}

        {/* TAB 4: STATISTIKEN & KONTOVERLAUF */}
        {activeTab === 'stats' && (
          <StatsView
            balance={balance}
            equity={liveEquity}
            tradeHistory={tradeHistory}
            equityHistory={equityHistory}
            onResetAccount={handleResetAccount}
          />
        )}
      </main>

      {/* Pattern Inspector Modal */}
      <PatternInspectorModal
        pattern={selectedPattern}
        onClose={() => setSelectedPattern(null)}
      />
    </div>
  );
}

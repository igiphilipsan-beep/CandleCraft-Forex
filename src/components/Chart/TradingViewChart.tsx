import React, { useEffect, useRef, useState } from 'react';
import {
  createChart,
  ColorType,
  LineStyle,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  CandlestickData,
  UTCTimestamp,
  SeriesMarker,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  createSeriesMarkers,
  ISeriesMarkersPluginApi,
  LogicalRange,
} from 'lightweight-charts';
import { ArrowUp, ArrowDown, BarChart2, ChevronRight, X } from 'lucide-react';
import { Candle, DetectedPattern, ForexSymbol, TradeOrder } from '../../types/forex';
import { calculateSMA, calculateRSI } from '../../utils/indicators';
import { formatPrice } from '../../utils/calculations';

interface TradingViewChartProps {
  candles: Candle[];
  symbol: ForexSymbol;
  patterns: DetectedPattern[];
  showPatterns: boolean;
  activeOrders: TradeOrder[];
  indicators: {
    sma20: boolean;
    sma50: boolean;
    sma200: boolean;
    rsi: boolean;
    volume: boolean;
  };
  onSelectPattern?: (pattern: DetectedPattern) => void;
  height?: number;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  symbol,
  patterns,
  showPatterns,
  activeOrders,
  indicators,
  onSelectPattern,
  height = 520,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const volumeContainerRef = useRef<HTMLDivElement>(null);
  const rsiContainerRef = useRef<HTMLDivElement>(null);

  const chartRef = useRef<IChartApi | null>(null);
  const volumeChartRef = useRef<IChartApi | null>(null);
  const rsiChartRef = useRef<IChartApi | null>(null);

  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const sma20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const sma200SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const markersPluginRef = useRef<ISeriesMarkersPluginApi<UTCTimestamp> | null>(null);

  const priceLinesRef = useRef<IPriceLine[]>([]);

  // Hovered candle & pattern for interactive HUD and floating tooltip
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [hoveredPattern, setHoveredPattern] = useState<DetectedPattern | null>(null);
  const [pinnedPattern, setPinnedPattern] = useState<DetectedPattern | null>(null);

  // Price formatting parameters
  const isJpy = symbol.includes('JPY');
  const priceDecimals = isJpy ? 3 : 5;
  const priceMinMove = isJpy ? 0.001 : 0.00001;

  // Calculate main chart height dynamically (accounting for volume and rsi panes)
  let mainChartHeight = height;
  if (indicators.volume && indicators.rsi) {
    mainChartHeight = height - 210;
  } else if (indicators.volume || indicators.rsi) {
    mainChartHeight = height - 110;
  }

  // 1. Initialize main candlestick chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      height: mainChartHeight,
      layout: {
        background: { type: ColorType.Solid, color: '#090d16' },
        textColor: '#94a3b8',
        fontSize: 12,
        fontFamily: "'JetBrains Mono', monospace",
      },
      localization: {
        priceFormatter: (p: number) => p.toFixed(priceDecimals),
      },
      grid: {
        vertLines: { color: 'rgba(30, 41, 59, 0.45)' },
        horzLines: { color: 'rgba(30, 41, 59, 0.45)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: '#64748b',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
        horzLine: {
          color: '#64748b',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: '#1e293b',
        },
      },
      rightPriceScale: {
        borderColor: '#1e293b',
        autoScale: true,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      },
      timeScale: {
        borderColor: '#1e293b',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    // Candlestick Series with exact 5-decimal (3 for JPY) formatting
    const candleSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      priceFormat: {
        type: 'price',
        precision: priceDecimals,
        minMove: priceMinMove,
      },
    });

    // Moving Average Lines
    const sma20Series = chart.addSeries(LineSeries, {
      color: '#38bdf8',
      lineWidth: 2,
      title: 'SMA 20',
      crosshairMarkerVisible: false,
      priceFormat: {
        type: 'price',
        precision: priceDecimals,
        minMove: priceMinMove,
      },
    });

    const sma50Series = chart.addSeries(LineSeries, {
      color: '#fbbf24',
      lineWidth: 2,
      title: 'SMA 50',
      crosshairMarkerVisible: false,
      priceFormat: {
        type: 'price',
        precision: priceDecimals,
        minMove: priceMinMove,
      },
    });

    const sma200Series = chart.addSeries(LineSeries, {
      color: '#c084fc',
      lineWidth: 2,
      title: 'SMA 200',
      crosshairMarkerVisible: false,
      priceFormat: {
        type: 'price',
        precision: priceDecimals,
        minMove: priceMinMove,
      },
    });

    // Markers Plugin
    const markersPlugin = createSeriesMarkers(candleSeries, []);
    markersPluginRef.current = markersPlugin as unknown as ISeriesMarkersPluginApi<UTCTimestamp>;

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;
    sma20SeriesRef.current = sma20Series;
    sma50SeriesRef.current = sma50Series;
    sma200SeriesRef.current = sma200Series;

    // Crosshair move listener for HUD & pattern inspection
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData) {
        setHoveredCandle(null);
        setHoveredPattern(null);
        return;
      }
      const data = param.seriesData.get(candleSeries) as (CandlestickData & { volume?: number }) | undefined;
      if (data && typeof data.open === 'number') {
        const timeNum = Number(param.time);
        const orig = candles.find((c) => c.time === timeNum);
        setHoveredCandle({
          time: timeNum,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: orig?.volume ?? (data.volume || 0),
        });

        // Find if a pattern exists on this candle
        const pat = patterns.find((p) => p.time === timeNum);
        setHoveredPattern(pat || null);
      }
    });

    // Click listener on chart to inspect pattern
    chart.subscribeClick((param) => {
      if (!param.time) return;
      const timeNum = Number(param.time);
      const clickedPat = patterns.find((p) => p.time === timeNum);
      if (clickedPat) {
        setPinnedPattern(clickedPat);
        if (onSelectPattern) {
          onSelectPattern(clickedPat);
        }
      }
    });

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !entries[0].contentRect) return;
      const { width } = entries[0].contentRect;
      chart.applyOptions({ width });
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
      markersPluginRef.current = null;
    };
  }, []);

  // Update main chart height when indicators toggle
  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        height: mainChartHeight,
      });
    }
  }, [mainChartHeight]);

  // Update price scale precision when symbol changes
  useEffect(() => {
    if (!candleSeriesRef.current || !chartRef.current) return;

    candleSeriesRef.current.applyOptions({
      priceFormat: {
        type: 'price',
        precision: priceDecimals,
        minMove: priceMinMove,
      },
    });

    chartRef.current.applyOptions({
      localization: {
        priceFormatter: (p: number) => p.toFixed(priceDecimals),
      },
    });
  }, [symbol, priceDecimals, priceMinMove]);

  // 2. REQUIREMENT 1: Dedicated Volume Sub-Chart pane under the candlestick chart (ca. 20% height, whole integer volume)
  useEffect(() => {
    if (!indicators.volume) {
      if (volumeChartRef.current) {
        volumeChartRef.current.remove();
        volumeChartRef.current = null;
        volumeSeriesRef.current = null;
      }
      return;
    }

    if (!volumeContainerRef.current) return;

    if (!volumeChartRef.current) {
      const volChart = createChart(volumeContainerRef.current, {
        height: 100, // ca. 20% of overall height
        layout: {
          background: { type: ColorType.Solid, color: '#090d16' },
          textColor: '#94a3b8',
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
        },
        localization: {
          priceFormatter: (v: number) => Math.round(v).toLocaleString('de-DE'),
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.45)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.45)' },
        },
        rightPriceScale: {
          borderColor: '#1e293b',
          scaleMargins: { top: 0.1, bottom: 0 },
        },
        timeScale: {
          borderColor: '#1e293b',
          timeVisible: true,
          visible: !indicators.rsi, // show time axis on volume if RSI is not below it
        },
      });

      // Volume as whole integer without decimal points
      const volSeries = volChart.addSeries(HistogramSeries, {
        color: '#38bdf8',
        priceFormat: {
          type: 'custom',
          formatter: (v: number) => Math.round(v).toLocaleString('de-DE'),
          minMove: 1,
        },
      });

      volumeChartRef.current = volChart;
      volumeSeriesRef.current = volSeries;

      // Sync volume time scale with main chart
      const syncHandler = (range: LogicalRange | null) => {
        if (range && volumeChartRef.current) {
          volumeChartRef.current.timeScale().setVisibleLogicalRange(range);
        }
      };
      chartRef.current?.timeScale().subscribeVisibleLogicalRangeChange(syncHandler);

      return () => {
        chartRef.current?.timeScale().unsubscribeVisibleLogicalRangeChange(syncHandler);
        if (volumeChartRef.current) {
          volumeChartRef.current.remove();
          volumeChartRef.current = null;
          volumeSeriesRef.current = null;
        }
      };
    }
  }, [indicators.volume, indicators.rsi]);

  // 3. Initialize or update RSI sub-chart
  useEffect(() => {
    if (!indicators.rsi) {
      if (rsiChartRef.current) {
        rsiChartRef.current.remove();
        rsiChartRef.current = null;
        rsiSeriesRef.current = null;
      }
      return;
    }

    if (!rsiContainerRef.current) return;

    if (!rsiChartRef.current) {
      const rsiChart = createChart(rsiContainerRef.current, {
        height: 105,
        layout: {
          background: { type: ColorType.Solid, color: '#090d16' },
          textColor: '#94a3b8',
          fontSize: 10,
          fontFamily: "'JetBrains Mono', monospace",
        },
        grid: {
          vertLines: { color: 'rgba(30, 41, 59, 0.45)' },
          horzLines: { color: 'rgba(30, 41, 59, 0.45)' },
        },
        rightPriceScale: {
          borderColor: '#1e293b',
          scaleMargins: { top: 0.1, bottom: 0.1 },
        },
        timeScale: {
          borderColor: '#1e293b',
          timeVisible: true,
          visible: true,
        },
      });

      const rsiSeries = rsiChart.addSeries(LineSeries, {
        color: '#f43f5e',
        lineWidth: 2,
        title: 'RSI 14',
      });

      // 70 and 30 Overbought/Oversold lines
      rsiSeries.createPriceLine({
        price: 70,
        color: 'rgba(239, 68, 68, 0.6)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '70 Überkauft',
      });

      rsiSeries.createPriceLine({
        price: 30,
        color: 'rgba(34, 197, 94, 0.6)',
        lineWidth: 1,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: '30 Überverkauft',
      });

      rsiChartRef.current = rsiChart;
      rsiSeriesRef.current = rsiSeries;

      // Sync RSI time scale with main chart with unsubscribe cleanup
      const rsiSyncHandler = (range: LogicalRange | null) => {
        if (range && rsiChartRef.current) {
          rsiChartRef.current.timeScale().setVisibleLogicalRange(range);
        }
      };
      chartRef.current?.timeScale().subscribeVisibleLogicalRangeChange(rsiSyncHandler);

      return () => {
        chartRef.current?.timeScale().unsubscribeVisibleLogicalRangeChange(rsiSyncHandler);
        if (rsiChartRef.current) {
          rsiChartRef.current.remove();
          rsiChartRef.current = null;
          rsiSeriesRef.current = null;
        }
      };
    }
  }, [indicators.rsi]);

  // Update chart data whenever candles change
  useEffect(() => {
    if (!candleSeriesRef.current || candles.length === 0) return;

    // Filter out invalid items and ensure unique ascending timestamps
    const cleanCandles: Candle[] = [];
    const seenTimes = new Set<number>();
    for (const c of candles) {
      if (typeof c.time === 'number' && !seenTimes.has(c.time) && !isNaN(c.open) && !isNaN(c.close)) {
        seenTimes.add(c.time);
        cleanCandles.push(c);
      }
    }
    cleanCandles.sort((a, b) => a.time - b.time);

    // Candlesticks
    const candleData: CandlestickData[] = cleanCandles.map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    candleSeriesRef.current.setData(candleData);

    // Dedicated Volume Sub-Chart Series
    if (volumeSeriesRef.current && indicators.volume) {
      const volumeData = cleanCandles.map((c) => ({
        time: c.time as UTCTimestamp,
        value: Math.round(c.volume || 1000), // Integer volume without decimals
        color: c.close >= c.open ? 'rgba(34, 197, 94, 0.75)' : 'rgba(239, 68, 68, 0.75)',
      }));
      volumeSeriesRef.current.setData(volumeData);
    }

    // SMA 20
    if (sma20SeriesRef.current) {
      if (indicators.sma20) {
        const sma20 = calculateSMA(cleanCandles, 20);
        sma20SeriesRef.current.setData(
          sma20.map((p) => ({ time: p.time as UTCTimestamp, value: p.value }))
        );
      } else {
        sma20SeriesRef.current.setData([]);
      }
    }

    // SMA 50
    if (sma50SeriesRef.current) {
      if (indicators.sma50) {
        const sma50 = calculateSMA(cleanCandles, 50);
        sma50SeriesRef.current.setData(
          sma50.map((p) => ({ time: p.time as UTCTimestamp, value: p.value }))
        );
      } else {
        sma50SeriesRef.current.setData([]);
      }
    }

    // SMA 200
    if (sma200SeriesRef.current) {
      if (indicators.sma200) {
        const sma200 = calculateSMA(cleanCandles, 200);
        sma200SeriesRef.current.setData(
          sma200.map((p) => ({ time: p.time as UTCTimestamp, value: p.value }))
        );
      } else {
        sma200SeriesRef.current.setData([]);
      }
    }

    // RSI 14
    if (rsiSeriesRef.current && indicators.rsi) {
      const rsiData = calculateRSI(cleanCandles, 14);
      rsiSeriesRef.current.setData(
        rsiData.map((p) => ({ time: p.time as UTCTimestamp, value: p.value }))
      );
    }

    // Pattern markers (Clean icon-only markers without text, limited to last 30 candles)
    if (markersPluginRef.current) {
      if (showPatterns && patterns.length > 0) {
        const recentCandles = cleanCandles.slice(-30);
        const minRecentTime = recentCandles.length > 0 ? recentCandles[0].time : 0;
        const recentPatterns = patterns.filter((p) => p.time >= minRecentTime);

        // De-duplicate markers per timestamp to avoid collision
        const markerTimes = new Set<number>();
        const markers: SeriesMarker<UTCTimestamp>[] = [];

        recentPatterns
          .sort((a, b) => a.time - b.time)
          .forEach((p) => {
            if (!markerTimes.has(p.time)) {
              markerTimes.add(p.time);
              const isBull = p.signal === 'bullish';
              const isBear = p.signal === 'bearish';
              markers.push({
                time: p.time as UTCTimestamp,
                position: isBull ? 'belowBar' : 'aboveBar',
                color: isBull ? '#22c55e' : isBear ? '#ef4444' : '#94a3b8',
                shape: isBull ? 'arrowUp' : isBear ? 'arrowDown' : 'circle',
                size: 1,
              });
            }
          });

        markersPluginRef.current.setMarkers(markers);
      } else {
        markersPluginRef.current.setMarkers([]);
      }
    }

    // Auto-scroll to latest candle
    try {
      chartRef.current?.timeScale().scrollToRealTime();
      if (indicators.volume && volumeChartRef.current) {
        volumeChartRef.current.timeScale().scrollToRealTime();
      }
      if (indicators.rsi && rsiChartRef.current) {
        rsiChartRef.current.timeScale().scrollToRealTime();
      }
    } catch {
      // Safe guard against race condition during unmount
    }
  }, [candles, patterns, showPatterns, indicators]);

  // Update active order lines (Entry, SL, TP)
  useEffect(() => {
    if (!candleSeriesRef.current) return;

    priceLinesRef.current.forEach((line) => {
      try {
        candleSeriesRef.current?.removePriceLine(line);
      } catch {
        // Safe guard against disposed lines
      }
    });
    priceLinesRef.current = [];

    activeOrders.forEach((order) => {
      if (order.status !== 'OPEN') return;

      try {
        const entryLine = candleSeriesRef.current?.createPriceLine({
          price: order.openPrice,
          color: order.type === 'BUY' ? '#3b82f6' : '#f97316',
          lineWidth: 2,
          lineStyle: LineStyle.Solid,
          axisLabelVisible: true,
          title: `${order.type} ${order.lotSize}L @ ${formatPrice(order.openPrice, symbol)}`,
        });
        if (entryLine) priceLinesRef.current.push(entryLine);

        if (order.sl) {
          const slLine = candleSeriesRef.current?.createPriceLine({
            price: order.sl,
            color: '#ef4444',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `SL (${formatPrice(order.sl, symbol)})`,
          });
          if (slLine) priceLinesRef.current.push(slLine);
        }

        if (order.tp) {
          const tpLine = candleSeriesRef.current?.createPriceLine({
            price: order.tp,
            color: '#22c55e',
            lineWidth: 2,
            lineStyle: LineStyle.Dashed,
            axisLabelVisible: true,
            title: `TP (${formatPrice(order.tp, symbol)})`,
          });
          if (tpLine) priceLinesRef.current.push(tpLine);
        }
      } catch {
        // Ignore price line creation error if series is updating
      }
    });
  }, [activeOrders, symbol]);

  const activeCandle = hoveredCandle || candles[candles.length - 1];
  const isUp = activeCandle ? activeCandle.close >= activeCandle.open : true;
  const candleChangePips = activeCandle
    ? ((activeCandle.close - activeCandle.open) / (symbol.includes('JPY') ? 0.01 : 0.0001)).toFixed(1)
    : '0.0';

  const displayedPattern = hoveredPattern || pinnedPattern;
  const hoveredVolume = activeCandle ? Math.round(activeCandle.volume || 0) : null;

  return (
    <div className="flex flex-col w-full bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Chart Top HUD & Candlestick Metrics */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-200 tracking-wide">{symbol.replace('=X', '')}</span>
          {activeCandle && (
            <div className="flex items-center gap-2 text-slate-400">
              <span>O: <span className="text-slate-200">{formatPrice(activeCandle.open, symbol)}</span></span>
              <span>H: <span className="text-emerald-400">{formatPrice(activeCandle.high, symbol)}</span></span>
              <span>L: <span className="text-rose-400">{formatPrice(activeCandle.low, symbol)}</span></span>
              <span>C: <span className={isUp ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{formatPrice(activeCandle.close, symbol)}</span></span>
              <span className={`px-1.5 py-0.5 rounded text-[11px] font-semibold ${isUp ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'}`}>
                {Number(candleChangePips) >= 0 ? `+${candleChangePips}` : candleChangePips} Pips
              </span>
            </div>
          )}
        </div>

        {/* Legend indicators */}
        <div className="flex items-center gap-2">
          {displayedPattern && (
            <button
              onClick={() => onSelectPattern && onSelectPattern(displayedPattern)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 border border-amber-500/40 text-amber-300 hover:bg-amber-500/25 transition-colors cursor-pointer text-xs"
              title="Klicken für vollständige deutsche Erklärung"
            >
              <span>Muster erkannt:</span>
              <span className="font-bold underline underline-offset-2">{displayedPattern.name}</span>
              <span className="text-[10px] text-amber-400/80">({displayedPattern.signal === 'bullish' ? 'Steigend' : displayedPattern.signal === 'bearish' ? 'Fallend' : 'Neutral'})</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400">
            {indicators.sma20 && <span className="text-sky-400">SMA 20</span>}
            {indicators.sma50 && <span className="text-amber-400">SMA 50</span>}
            {indicators.sma200 && <span className="text-purple-400">SMA 200</span>}
            {indicators.volume && <span className="text-sky-300">Volumen</span>}
            {indicators.rsi && <span className="text-rose-400">RSI 14</span>}
          </div>
        </div>
      </div>

      {/* Main Candlestick Chart Area (Clean without overlapping volume bars) */}
      <div className="relative w-full">
        <div ref={chartContainerRef} className="w-full relative cursor-crosshair" />

        {/* Interactive Floating Tooltip when hovering/clicking on a marker */}
        {displayedPattern && showPatterns && (
          <div className="absolute top-3 left-3 z-30 max-w-sm bg-slate-900/95 border border-slate-700/90 shadow-2xl rounded-xl p-3.5 backdrop-blur-md animate-in fade-in duration-200">
            <div className="flex items-start justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-2">
                {displayedPattern.signal === 'bullish' && (
                  <span className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </span>
                )}
                {displayedPattern.signal === 'bearish' && (
                  <span className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </span>
                )}
                {displayedPattern.signal === 'neutral' && (
                  <span className="w-3.5 h-3.5 rounded-full bg-slate-400 inline-block" />
                )}

                <div>
                  <h4 className="font-bold text-white text-xs leading-snug">
                    {displayedPattern.germanName}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {displayedPattern.name} · Signal:{' '}
                    <strong className={displayedPattern.signal === 'bullish' ? 'text-emerald-400' : displayedPattern.signal === 'bearish' ? 'text-rose-400' : 'text-slate-300'}>
                      {displayedPattern.signal === 'bullish' ? 'Steigend (Kauf)' : displayedPattern.signal === 'bearish' ? 'Fallend (Verkauf)' : 'Neutral'}
                    </strong>
                  </span>
                </div>
              </div>

              {pinnedPattern && (
                <button
                  onClick={() => setPinnedPattern(null)}
                  className="text-slate-500 hover:text-slate-300 p-0.5 rounded cursor-pointer"
                  title="Schließen"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-200 leading-relaxed mb-2.5">
              {displayedPattern.description}
            </p>

            <button
              onClick={() => onSelectPattern && onSelectPattern(displayedPattern)}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-medium transition-colors cursor-pointer"
            >
              <span>Klicken für Setup & Markt-Psychologie</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* REQUIREMENT 1: Dedicated Volume Sub-Chart pane (ca. 20% height, whole integer values) */}
      {indicators.volume && (
        <div className="w-full border-t border-slate-800/80 bg-slate-950/90">
          <div className="px-4 py-1 text-[11px] font-mono text-slate-400 border-b border-slate-800/40 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Volumen (Handelsaktivität)</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {hoveredVolume !== null ? (
                <span>
                  Vol: <strong className="text-white font-bold">{hoveredVolume.toLocaleString('de-DE')}</strong> Kontrakte
                </span>
              ) : (
                'Ganze Zahl ohne Nachkommastellen'
              )}
            </span>
          </div>
          <div ref={volumeContainerRef} className="w-full" />
        </div>
      )}

      {/* RSI Sub-pane */}
      {indicators.rsi && (
        <div className="w-full border-t border-slate-800/80 bg-slate-950/80">
          <div className="px-4 py-1 text-[11px] font-mono text-slate-400 border-b border-slate-800/40 flex items-center justify-between">
            <span>RSI (14) · Momentum-Oszillator</span>
            <span className="text-[10px] text-slate-500">Überkauft &gt; 70 · Überverkauft &lt; 30</span>
          </div>
          <div ref={rsiContainerRef} className="w-full" />
        </div>
      )}
    </div>
  );
};

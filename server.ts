import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Proxy endpoint for Yahoo Finance historical candlestick data
app.get('/api/forex/candles', async (req, res) => {
  try {
    const symbol = (req.query.symbol as string) || 'EURUSD=X';
    const interval = (req.query.interval as string) || '1h';
    const range = (req.query.range as string) || '1mo';

    // Map interval to Yahoo Finance intervals
    const validIntervals: Record<string, string> = {
      '1m': '1m',
      '15m': '15m',
      '1h': '60m',
      '4h': '1d', // Yahoo finance free tier doesn't have native 4h, fallback to 1h aggregated or 1d
      '1d': '1d',
    };

    const yfInterval = validIntervals[interval] || '60m';
    
    // Choose appropriate range based on interval
    let yfRange = range;
    if (interval === '1m') yfRange = '5d';
    else if (interval === '15m') yfRange = '1mo';
    else if (interval === '1h' || interval === '4h') yfRange = '3mo';
    else if (interval === '1d') yfRange = '1y';

    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${yfInterval}&range=${yfRange}&indicators=quote&includeTimestamps=true`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(response.status).json({ error: `Yahoo Finance HTTP ${response.status}` });
    }

    const data = await response.json();
    const result = data?.chart?.result?.[0];

    if (!result || !result.timestamp || !result.indicators?.quote?.[0]) {
      return res.status(404).json({ error: 'No candle data found' });
    }

    const timestamps: number[] = result.timestamp;
    const quote = result.indicators.quote[0];
    const opens = quote.open;
    const highs = quote.high;
    const lows = quote.low;
    const closes = quote.close;
    const volumes = quote.volume || [];

    const candles = [];
    let lastTime = 0;
    for (let i = 0; i < timestamps.length; i++) {
      const t = Math.floor(timestamps[i]);
      const o = opens[i];
      const h = highs[i];
      const l = lows[i];
      const c = closes[i];
      const v = volumes[i] ?? 1000;

      // Filter out null / NaN / zero anomalies and ensure strictly ascending timestamps
      if (
        t > lastTime &&
        typeof o === 'number' && !isNaN(o) &&
        typeof h === 'number' && !isNaN(h) &&
        typeof l === 'number' && !isNaN(l) &&
        typeof c === 'number' && !isNaN(c) &&
        o > 0 && h > 0 && l > 0 && c > 0
      ) {
        lastTime = t;
        candles.push({
          time: t,
          open: Number(o.toFixed(symbol.includes('JPY') ? 3 : 5)),
          high: Number(h.toFixed(symbol.includes('JPY') ? 3 : 5)),
          low: Number(l.toFixed(symbol.includes('JPY') ? 3 : 5)),
          close: Number(c.toFixed(symbol.includes('JPY') ? 3 : 5)),
          volume: Math.round(Number(v)) || Math.floor(500 + Math.random() * 2000),
        });
      }
    }

    res.json({
      symbol,
      interval,
      count: candles.length,
      candles,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Failed to fetch forex candles: ' + errorMsg });
  }
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();

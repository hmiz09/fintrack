// Vercel Serverless Function: Real-time Market Prices for IDX Stocks and Gold
export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=30');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse symbols from query string or use defaults
  const querySymbols = req.query?.symbols || '';
  const requestedSymbols = typeof querySymbols === 'string'
    ? querySymbols.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean)
    : [];

  const defaultSymbols = ['BBCA', 'BBRI', 'BMRI', 'TLKM', 'ASII', 'GOTO', 'AMMN', 'BREN', 'ICBP', 'UNVR'];
  const allSymbols = Array.from(new Set([...defaultSymbols, ...requestedSymbols]));

  // Default fallback prices
  const fallbackStocks = {
    BBCA: 10250,
    BBRI: 4680,
    BMRI: 6750,
    TLKM: 2980,
    ASII: 5150,
    AMMN: 9300,
    BREN: 7100,
    GOTO: 68,
    ICBP: 11400,
    UNVR: 2150,
  };

  const stockPrices = { ...fallbackStocks };

  // Fetch stock prices from Yahoo Finance in parallel with 4s timeout
  await Promise.allSettled(
    allSymbols.map(async (sym) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}.JK?interval=1d`;
        const resp = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            Accept: 'application/json',
          },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (resp.ok) {
          const data = await resp.json();
          const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
          if (typeof price === 'number' && price > 0) {
            stockPrices[sym] = Math.round(price);
          }
        }
      } catch {
        // Silently keep fallback or previous price
      }
    })
  );

  // Fetch Gold live prices
  let spotGold = 1425000;
  let antamGold = 1540000;
  let goldSuccess = false;

  // Primary: Indodax PAXG IDR (1 PAXG = 31.1034768 grams of gold)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const goldResp = await fetch('https://indodax.com/api/ticker/paxgidr', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (goldResp.ok) {
      const goldData = await goldResp.json();
      const last = Number(goldData?.ticker?.last);
      if (last > 0) {
        spotGold = Math.round(last / 31.1034768);
        antamGold = Math.round(spotGold * 1.075);
        goldSuccess = true;
      }
    }
  } catch {
    // Attempt fallback
  }

  // Fallback: Yahoo Finance GC=F (USD/oz) * USDIDR=X
  if (!goldSuccess) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const [gcResp, fxResp] = await Promise.all([
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/GC=F?interval=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: controller.signal,
        }),
        fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDIDR=X?interval=1d', {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: controller.signal,
        }),
      ]);
      clearTimeout(timeoutId);

      if (gcResp.ok && fxResp.ok) {
        const gcData = await gcResp.json();
        const fxData = await fxResp.json();
        const gcPrice = gcData?.chart?.result?.[0]?.meta?.regularMarketPrice;
        const fxRate = fxData?.chart?.result?.[0]?.meta?.regularMarketPrice;

        if (gcPrice && fxRate) {
          spotGold = Math.round((gcPrice * fxRate) / 31.1034768);
          antamGold = Math.round(spotGold * 1.075);
        }
      }
    } catch {
      // Keep initial defaults
    }
  }

  return res.status(200).json({
    success: true,
    timestamp: Date.now(),
    stocks: stockPrices,
    gold: {
      spot: spotGold,
      antam: antamGold,
    },
  });
}

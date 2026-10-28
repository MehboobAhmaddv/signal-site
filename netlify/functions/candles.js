const INTERVALS = ['1min', '5min', '15min', '1h'];
const cache = {}; // short in-memory cache so many visitors share one data request

exports.handler = async (e) => {
  const q = e.queryStringParameters || {};
  // forex/metals/crypto: AAA/BBB   stocks: AAPL or AAPL@NASDAQ
  if (!/^[A-Z0-9.\-]{1,12}(\/[A-Z]{3,4}|@[A-Za-z0-9]{2,12})?$/.test(q.symbol || '') || !INTERVALS.includes(q.interval)) {
    return { statusCode: 400, body: '{"error":"Bad symbol or interval"}' };
  }
  if (!process.env.TD_KEY) return { statusCode: 500, body: '{"error":"TD_KEY is not set on the server"}' };

  const key = q.symbol + q.interval;
  const hit = cache[key];
  const headers = { 'content-type': 'application/json', 'cache-control': 'public, max-age=20' };
  if (hit && Date.now() - hit.t < 20000) return { statusCode: 200, headers, body: hit.body };

  try {
    const [sym, exch] = q.symbol.split('@');
    const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${q.interval}` +
      `&outputsize=1000&order=ASC&timezone=UTC${exch ? '&exchange=' + exch : ''}&apikey=${process.env.TD_KEY}`;
    const d = await (await fetch(url)).json();
    if (d.status === 'error') return { statusCode: 502, body: JSON.stringify({ error: d.message }) };
    const body = JSON.stringify(d.values);
    cache[key] = { t: Date.now(), body };
    return { statusCode: 200, headers, body };
  } catch (err) {
    return { statusCode: 502, body: '{"error":"Data provider unreachable"}' };
  }
};

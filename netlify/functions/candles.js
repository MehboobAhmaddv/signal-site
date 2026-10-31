// Needs env var TD_KEY (free key from twelvedata.com). Without it the site falls back to Demo feed automatically.
const A = require('../lib/auth');
const OK = ['1min', '5min', '15min', '1h'], cache = {};
exports.handler = async (e) => {
  const a = await A.authed(e);
  if (!a) return A.json(401, { error: 'Please log in again' });
  const q = e.queryStringParameters || {};
  if (!/^[A-Z0-9.\-]{1,12}(\/[A-Z]{3,4})?$/.test(q.symbol || '') || !OK.includes(q.interval))
    return { statusCode: 400, body: '{"error":"bad request"}' };
  if (!A.canUse(a.user, q.symbol)) return A.json(403, { error: 'Members only' });
  if (!process.env.TD_KEY) return { statusCode: 503, body: '{"error":"TD_KEY missing"}' };
  const k = q.symbol + q.interval, h = cache[k];
  const headers = { 'content-type': 'application/json', 'cache-control': 'private, max-age=15' };
  if (h && Date.now() - h.t < 15000) return { statusCode: 200, headers, body: h.b };
  try {
    const r = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(q.symbol)}&interval=${q.interval}&outputsize=1000&order=ASC&timezone=UTC&apikey=${process.env.TD_KEY}`);
    const d = await r.json();
    if (d.status === 'error' || !d.values) return { statusCode: 502, body: JSON.stringify({ error: d.message || 'no data' }) };
    const b = JSON.stringify(d.values); cache[k] = { t: Date.now(), b };
    return { statusCode: 200, headers, body: b };
  } catch (err) { return { statusCode: 502, body: '{"error":"provider unreachable"}' }; }
};

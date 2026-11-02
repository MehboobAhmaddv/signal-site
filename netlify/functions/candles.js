// Shared candle cache: all users read the same cached candles, so Twelve Data (free plan: 8/min, 800/day) is called only when the cache is stale.
// Needs env var TD_KEY (free key from twelvedata.com). Without it the site falls back to Demo feed automatically.
const A = require('../lib/auth');
const db = require('../lib/db');
const OK = ['1min', '5min', '15min', '1h'];
const FRESH = { '1min': 20e3, '5min': 25e3, '15min': 35e3, '1h': 60e3 };   // how long a cached copy counts as live for signals
const STAT_TTL = 10 * 60e3;       // pair-list win rates tolerate older candles
const STAT_STALE_MAX = 6 * 3600e3;
const PER_MIN = 7, PER_DAY = 770; // stay under the free plan limits (8/min, 800/day)
const STAT_MIN = 3, STAT_DAY = 400; // the pair-list win rates may use only part of it: the rest is reserved for live signals

const reply = (code, body, extra) => ({ statusCode: code, headers: Object.assign({ 'content-type': 'application/json', 'cache-control': 'private, max-age=10' }, extra || {}), body });
const err = (code, msg) => ({ statusCode: code, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify({ error: msg }) });

exports.handler = async (e) => {
  const a = await A.authed(e);
  if (!a) return A.json(401, { error: 'Please log in again' });
  const q = e.queryStringParameters || {};
  if (!/^[A-Z0-9.\-]{1,12}(\/[A-Z]{3,4})?$/.test(q.symbol || '') || !OK.includes(q.interval)) return err(400, 'bad request');
  if (!A.canUse(a.user, q.symbol)) return A.json(403, { error: 'Members only' });
  const stat = q.stat === '1', hot = q.hot === '1';
  let store, meta, hit = null;
  try {
    store = await db.open(e, 'candles'); meta = await db.open(e, 'meta');
    hit = await store.get(q.symbol.replace('/', '_') + '|' + q.interval);
  } catch (x) { console.error('[candles] cache read', x && x.message); }
  const now = Date.now(), age = hit ? now - hit.t : Infinity, ttl = stat ? STAT_TTL : hot ? Math.min(FRESH[q.interval], 6e3) : FRESH[q.interval];
  if (hit && age < ttl) return reply(200, hit.b, { 'x-cache': 'HIT' });
  const staleOk = hit && (stat ? age < STAT_STALE_MAX : age < Math.max(ttl * 3, 45e3));
  if (!process.env.TD_KEY) return err(503, 'TD_KEY missing');
  try {
    // global quota gate shared by every user
    const mi = Math.floor(now / 60000), day = new Date().toISOString().slice(0, 10);
    let m = (await meta.get('min')) || {}, d = (await meta.get('day')) || {};
    if (m.i !== mi) m = { i: mi, n: 0, s: 0 };
    if (d.d !== day) d = { d: day, n: 0, s: 0 };
    if (m.n >= PER_MIN || d.n >= PER_DAY || (stat && ((m.s || 0) >= STAT_MIN || (d.s || 0) >= STAT_DAY))) {
      if (staleOk) return reply(200, hit.b, { 'x-cache': 'STALE' });
      return err(429, d.n >= PER_DAY ? 'Daily data limit reached. Live data resumes tomorrow.' : 'Data rate limit: too many requests this minute, retry shortly.');
    }
    m.n++; d.n++; if (stat) { m.s = (m.s || 0) + 1; d.s = (d.s || 0) + 1; }
    await meta.set('min', m); await meta.set('day', d);
  } catch (x) { console.error('[candles] quota', x && x.message); }
  try {
    const r = await fetch(`https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(q.symbol)}&interval=${q.interval}&outputsize=1000&order=ASC&timezone=UTC&apikey=${process.env.TD_KEY}`);
    const dd = await r.json();
    if (dd.status === 'error' || !dd.values) { if (staleOk) return reply(200, hit.b, { 'x-cache': 'STALE' }); return err(502, dd.message || 'no data'); }
    const b = JSON.stringify(dd.values);
    try { await store.set(q.symbol.replace('/', '_') + '|' + q.interval, { t: Date.now(), b }); } catch (x) { console.error('[candles] cache write', x && x.message); }
    return reply(200, b, { 'x-cache': 'MISS' });
  } catch (x) { if (staleOk) return reply(200, hit.b, { 'x-cache': 'STALE' }); return err(502, 'provider unreachable'); }
};

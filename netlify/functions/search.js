// Company / ticker search so visitors can find any listed stock or ETF.
const cache = {};

exports.handler = async (e) => {
  const q = String((e.queryStringParameters || {}).q || '').trim().slice(0, 40);
  const h = { 'content-type': 'application/json', 'cache-control': 'public, max-age=3600' };
  if (q.length < 2) return { statusCode: 200, headers: h, body: '[]' };
  if (!process.env.TD_KEY) return { statusCode: 500, body: '{"error":"TD_KEY is not set on the server"}' };
  const k = q.toLowerCase();
  if (cache[k]) return { statusCode: 200, headers: h, body: cache[k] };
  try {
    const d = await (await fetch(`https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(q)}&outputsize=20`)).json();
    const out = (d.data || [])
      .filter((r) => /stock|etf|adr/i.test(r.instrument_type || ''))
      .slice(0, 12)
      .map((r) => ({ s: r.symbol, n: r.instrument_name, x: r.exchange }));
    const body = JSON.stringify(out);
    cache[k] = body;
    return { statusCode: 200, headers: h, body };
  } catch (err) {
    return { statusCode: 502, body: '{"error":"Search unavailable"}' };
  }
};

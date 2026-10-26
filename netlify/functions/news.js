// Free public economic-calendar feed (unofficial, may change). Fails safe: returns ok:false.
let cache = { t: 0, body: null };

exports.handler = async () => {
  const h = { 'content-type': 'application/json', 'cache-control': 'public, max-age=600' };
  if (cache.body && Date.now() - cache.t < 30 * 60000) return { statusCode: 200, headers: h, body: cache.body };
  try {
    const r = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json');
    if (!r.ok) throw new Error('feed ' + r.status);
    const d = await r.json();
    const events = d
      .filter((e) => /high|medium/i.test(e.impact))
      .map((e) => ({ t: Date.parse(e.date), c: String(e.country || e.currency || '').toUpperCase(), n: String(e.title || ''), i: /high/i.test(e.impact) ? 'High' : 'Medium' }))
      .filter((e) => !isNaN(e.t));
    const body = JSON.stringify({ ok: true, events });
    cache = { t: Date.now(), body };
    return { statusCode: 200, headers: h, body };
  } catch (e) {
    return { statusCode: 200, headers: h, body: cache.body || '{"ok":false}' };
  }
};

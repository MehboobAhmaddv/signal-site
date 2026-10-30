// Scheduled function: scans a few pairs every 5 minutes and posts new signals to your Telegram channel.
// Needs env vars: TD_KEY, TG_BOT_TOKEN, TG_CHAT_ID. Optional: ALERT_PAIRS, ALERT_INTERVAL, ALERT_MODE (1 Fast, 2 Relaxed, 3 Premium), ALERT_EXPIRY.
const E = require('../../engine.js');

const STEPS = { '1min': 60000, '5min': 300000, '15min': 900000 };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Modes: 1 = Fast (every candle), 2 = Relaxed (setup strength 4/7 or more), 3 = Premium (5/7 or more)
const params = (mode, step) => ({ min: mode === 3 ? 5 : mode === 2 ? 4 : 0, step });

exports.handler = async () => {
  const token = process.env.TG_BOT_TOKEN, chat = process.env.TG_CHAT_ID, key = process.env.TD_KEY;
  if (!token || !chat || !key) return { statusCode: 200, body: 'not configured' };

  const interval = STEPS[process.env.ALERT_INTERVAL] ? process.env.ALERT_INTERVAL : '5min';
  const step = STEPS[interval];
  const mode = [1, 2, 3].includes(+process.env.ALERT_MODE) ? +process.env.ALERT_MODE : 2;
  const ex = +(process.env.ALERT_EXPIRY || 3);
  const pairs = (process.env.ALERT_PAIRS || 'EUR/USD,GBP/USD,USD/JPY,AUD/USD,XAU/USD,BTC/USD')
    .split(',').map((s) => s.trim()).filter((s) => /^[A-Z0-9.\-]{1,12}\/[A-Z]{3,4}$/.test(s)).slice(0, 6);
  const P = params(mode, step);
  const sent = [];

  for (const sym of pairs) {
    try {
      const url = `https://api.twelvedata.com/time_series?symbol=${encodeURIComponent(sym)}&interval=${interval}` +
        `&outputsize=1000&order=ASC&timezone=UTC&apikey=${key}`;
      const d = await (await fetch(url)).json();
      if (!Array.isArray(d.values) || d.values.length < 400) continue;
      let cs = d.values.map((v) => ({ t: Date.parse(v.datetime.replace(' ', 'T') + 'Z'), o: +v.open, h: +v.high, l: +v.low, c: +v.close }));
      const now = Date.now(), lc = cs[cs.length - 1];
      if (now - lc.t > step * 3) continue;                 // market closed
      if (lc.t + step > now) cs = cs.slice(0, -1);         // drop the forming candle
      const last = cs[cs.length - 1];
      if (now - (last.t + step) > step) continue;          // only the candle that just closed
      const x = E.calc(cs), i = x.c.length - 1, r = E.evalAt(x, i, P);
      if (r.s) {
        const open = new Date(last.t + step).toISOString().slice(11, 16);
        const text = `🔔 MRK TRADER 🔥\n${r.s === 1 ? '📈 UP (CALL)' : '📉 DOWN (PUT)'} · ${sym}\n` +
          `Candle: ${interval} · Expiry: ${ex} candles\nSetup strength: ${E.strength(r.sc)}/7\n` +
          `Enter when the next candle opens (${open} UTC)\n⚠️ Educational signal, not financial advice.`;
        const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ chat_id: chat, text }),
        });
        if (res.ok) sent.push(sym);
      }
    } catch (e) { /* skip this pair */ }
    await sleep(2000);
  }
  return { statusCode: 200, body: JSON.stringify({ checked: pairs.length, sent }) };
};

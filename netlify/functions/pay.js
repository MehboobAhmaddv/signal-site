// Membership payments in USDT. "auto" = Binance Pay merchant API (confirmed by Binance). "manual" = you send USDT, the owner approves.
const crypto = require('crypto');
const A = require('../lib/auth');
const db = require('../lib/db');

const DAY = 864e5, OPEN = ['PENDING', 'AWAITING_PAYMENT', 'REVIEW'];
const autoOn = () => !!(process.env.BINANCE_PAY_KEY && process.env.BINANCE_PAY_SECRET);
// Owner's Binance details. Set BINANCE_PAY_ID / BINANCE_ADDRESS / BINANCE_NETWORK in Netlify to override them.
const manualCfg = () => ({
  payId: process.env.BINANCE_PAY_ID || '545851285',
  address: process.env.BINANCE_ADDRESS || 'TSLY32Nvz9f1VJ1o883TbG3y4wdb1rGDnQ',
  network: process.env.BINANCE_NETWORK || 'TRC20',
  qr: process.env.BINANCE_ADDRESS ? '' : 'images/usdt-qr.png',   // the QR matches the default address only
});
const origin = (e) => (process.env.URL || ('https://' + ((e.headers && (e.headers.host || e.headers.Host)) || ''))).replace(/\/$/, '');
const nonce = () => { const c = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; return Array.from(crypto.randomBytes(32), (x) => c[x % 52]).join(''); };

async function bpay(path, payload) {
  const body = JSON.stringify(payload), ts = String(Date.now()), n = nonce();
  const sig = crypto.createHmac('sha512', process.env.BINANCE_PAY_SECRET).update(`${ts}\n${n}\n${body}\n`).digest('hex').toUpperCase();
  const r = await fetch('https://bpay.binanceapi.com' + path, { method: 'POST', body, headers: {
    'content-type': 'application/json', 'BinancePay-Timestamp': ts, 'BinancePay-Nonce': n,
    'BinancePay-Certificate-SN': process.env.BINANCE_PAY_KEY, 'BinancePay-Signature': sig } });
  return r.json();
}

async function credit(users, user, days, orderId) {
  user.paidOrders = (user.paidOrders || []).slice(-50);
  if (orderId && user.paidOrders.includes(orderId)) return user;      // never credit one order twice
  user.until = Math.max(Date.now(), user.until || 0) + days * DAY;
  if (orderId) user.paidOrders.push(orderId);
  await users.set(user.email, user);
  return user;
}
exports.credit = credit;

// Ask Binance (never trust the webhook text) and activate the membership when the order is really paid.
async function syncOrder(o, users, orders) {
  if (o.method !== 'auto' || o.status !== 'PENDING' || !autoOn()) return o;
  const d = await bpay('/binancepay/openapi/v2/order/query', { merchantTradeNo: o.id });
  const data = d && d.data;
  if (!d || d.status !== 'SUCCESS' || !data) return o;
  o.bstatus = data.status;
  if (data.status === 'PAID') {
    const amountOk = data.orderAmount === undefined || Math.abs(+data.orderAmount - o.amount) < 0.01;
    const curOk = !data.currency || String(data.currency).toUpperCase() === 'USDT';
    if (amountOk && curOk && String(data.merchantTradeNo || o.id) === o.id) {
      const u = await users.get(o.email);
      if (u) await credit(users, u, o.days, o.id);
      o.status = 'PAID'; o.paid = Date.now();
    } else { o.status = 'ERROR'; }
  } else if (data.status === 'EXPIRED') o.status = 'EXPIRED';
  else if (data.status === 'CANCELED') o.status = 'CANCELED';
  else if (data.status === 'ERROR') o.status = 'ERROR';
  await orders.set(o.id, o);
  return o;
}
exports.syncOrder = syncOrder;

exports.handler = async (e) => {
  if (e.httpMethod !== 'POST') return A.json(405, { error: 'POST only' });
  const a = await A.authed(e);
  if (!a) return A.json(401, { error: 'Please log in again' });
  let b = {};
  try { b = JSON.parse(e.body || '{}'); } catch { return A.json(400, { error: 'Bad request' }); }
  const { user, users } = a;
  try {
    const orders = await db.open(e, 'orders');
    if (b.action === 'plans') return A.json(200, { plans: A.PLANS(), auto: autoOn(), manual: manualCfg(), user: A.pub(user) });

    if (b.action === 'mine') {
      const list = (await Promise.all((user.orders || []).slice(-30).map((id) => orders.get(id)))).filter(Boolean).sort((x, y) => y.created - x.created);
      return A.json(200, { orders: list });
    }
    if (b.action === 'create') {
      const plan = A.PLANS().find((p) => p.id === String(b.plan));
      if (!plan) return A.json(400, { error: 'Unknown plan' });
      const method = b.method === 'auto' ? 'auto' : 'manual';
      if (method === 'auto' && !autoOn()) return A.json(503, { error: 'Binance Pay is not set up yet. Use manual payment.' });
      if (method === 'manual' && !manualCfg()) return A.json(503, { error: 'Payments are not set up yet. Please contact the site owner.' });
      const mine = (await Promise.all((user.orders || []).slice(-30).map((id) => orders.get(id)))).filter(Boolean);
      if (mine.filter((o) => OPEN.includes(o.status)).length >= 5) return A.json(429, { error: 'You have too many unfinished orders. Finish or wait for them first.' });
      const id = 'MS' + crypto.randomBytes(8).toString('hex').toUpperCase();
      const o = { id, email: user.email, plan: plan.id, days: plan.days, amount: plan.price, method, status: method === 'auto' ? 'PENDING' : 'AWAITING_PAYMENT', created: Date.now() };
      if (method === 'auto') {
        const o2 = origin(e);
        const d = await bpay('/binancepay/openapi/v2/order', { env: { terminalType: 'WEB' }, merchantTradeNo: id, orderAmount: plan.price, currency: 'USDT',
          goods: { goodsType: '02', goodsCategory: 'Z000', referenceGoodsId: plan.id, goodsName: `Membership ${plan.days} days` },
          returnUrl: `${o2}/membership.html?order=${id}`, cancelUrl: `${o2}/membership.html`, webhookUrl: `${o2}/.netlify/functions/binance-webhook` });
        if (!d || d.status !== 'SUCCESS' || !d.data || !d.data.checkoutUrl)
          return A.json(502, { error: 'Could not start Binance Pay. Please try again, or use manual payment.' });
        o.checkoutUrl = d.data.checkoutUrl; o.prepayId = d.data.prepayId;
      }
      await orders.set(id, o);
      user.orders = (user.orders || []).concat(id).slice(-50);
      await users.set(user.email, user);
      return A.json(200, { order: o, manual: method === 'manual' ? manualCfg() : null });
    }
    if (b.action === 'txid') {
      const o = await orders.get(String(b.orderId || '').replace(/[^A-Za-z0-9]/g, ''));
      if (!o || o.email !== user.email || o.method !== 'manual') return A.json(404, { error: 'Order not found' });
      if (o.status !== 'AWAITING_PAYMENT') return A.json(400, { error: 'This order was already submitted' });
      const txid = String(b.txid || '').trim();
      if (!/^[A-Za-z0-9_\-:.]{8,100}$/.test(txid)) return A.json(400, { error: 'Enter the transaction ID or Binance order number (8 to 100 letters and numbers)' });
      const h = crypto.createHash('sha256').update(txid.toLowerCase()).digest('hex').slice(0, 40);
      const refs = await db.open(e, 'txids');
      if (await refs.get(h)) return A.json(409, { error: 'This transaction ID was already used' });
      await refs.set(h, { order: o.id });
      Object.assign(o, { txid, txhash: h, status: 'REVIEW', submitted: Date.now() });
      await orders.set(o.id, o);
      return A.json(200, { ok: true, order: o });
    }
    if (b.action === 'check') {
      let o = await orders.get(String(b.orderId || '').replace(/[^A-Za-z0-9]/g, ''));
      if (!o || o.email !== user.email) return A.json(404, { error: 'Order not found' });
      o = await syncOrder(o, users, orders);
      const fresh = (await users.get(user.email)) || user;
      return A.json(200, { order: o, user: A.pub(fresh) });
    }
    return A.json(400, { error: 'Unknown action' });
  } catch (err) {
    return A.json(503, { error: 'Payment service unavailable. Please try again.' });
  }
};

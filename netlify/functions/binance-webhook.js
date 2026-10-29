// Binance Pay calls this when an order changes. We ignore what the message claims and re-check the order with Binance.
const db = require('../lib/db');
const P = require('./pay');

exports.handler = async (event) => {
  try {
    const b = JSON.parse(event.body || '{}');
    let data = b.data;
    if (typeof data === 'string') data = JSON.parse(data);
    const id = String((data && data.merchantTradeNo) || '').replace(/[^A-Za-z0-9]/g, '');
    if (id) {
      const orders = await db.open(event, 'orders'), users = await db.open(event, 'users');
      const o = await orders.get(id);
      if (o) await P.syncOrder(o, users, orders);
    }
  } catch (e) { /* always acknowledge */ }
  return { statusCode: 200, headers: { 'content-type': 'application/json' }, body: JSON.stringify({ returnCode: 'SUCCESS', returnMessage: null }) };
};

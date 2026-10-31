const crypto = require('crypto');
const A = require('../lib/auth');
const db = require('../lib/db');
const P = require('./pay');

exports.handler = async (e) => {
  if (e.httpMethod !== 'POST') return A.json(405, { error: 'POST only' });
  const a = await A.authed(e);
  if (!a) return A.json(401, { error: 'Please log in again' });
  if (!A.isAdmin(a.user.email)) return A.json(403, { error: 'Admin only' });
  let b = {};
  try { b = JSON.parse(e.body || '{}'); } catch { return A.json(400, { error: 'Bad request' }); }
  const { users } = a;
  const target = async () => { const u = await users.get(A.key(b.email)); return u && !A.isAdmin(u.email) ? u : null; };
  try {
    const orders = await db.open(e, 'orders');
    if (b.action === 'stats') {
      const us = await users.all(), os = await orders.all(), now = Date.now();
      return A.json(200, { users: us.length, members: us.filter((u) => !A.isAdmin(u.email) && (u.until || 0) > now).length,
        revenue: os.filter((o) => o.status === 'PAID').reduce((s, o) => s + (+o.amount || 0), 0),
        review: os.filter((o) => o.status === 'REVIEW').length, banned: us.filter((u) => u.banned).length });
    }
    if (b.action === 'users') {
      const q = String(b.q || '').toLowerCase().trim();
      const list = (await users.all()).filter((u) => !q || u.email.includes(q) || String(u.name || '').toLowerCase().includes(q))
        .sort((x, y) => y.created - x.created).slice(0, 200)
        .map((u) => ({ name: u.name, email: u.email, banned: !!u.banned, admin: A.isAdmin(u.email), member: A.isMember(u), until: u.until || 0 }));
      return A.json(200, { users: list });
    }
    if (b.action === 'orders') return A.json(200, { orders: (await orders.all()).sort((x, y) => y.created - x.created).slice(0, 200) });

    if (b.action === 'grant') {
      const days = Math.floor(+b.days), u = await target();
      if (!(days >= 1 && days <= 3650)) return A.json(400, { error: 'Days must be between 1 and 3650' });
      if (!u) return A.json(404, { error: 'User not found' });
      await P.credit(users, u, days); return A.json(200, { ok: true, until: u.until });
    }
    if (b.action === 'revoke') { const u = await target(); if (!u) return A.json(404, { error: 'User not found' }); u.until = 0; await users.set(u.email, u); return A.json(200, { ok: true }); }
    if (b.action === 'ban') { const u = await target(); if (!u) return A.json(404, { error: 'User not found' }); u.banned = !!b.banned; await users.set(u.email, u); return A.json(200, { ok: true }); }
    if (b.action === 'resetpw') {
      const u = await target(), pw = String(b.password || '');
      if (!u) return A.json(404, { error: 'User not found' });
      if (pw.length < 8 || pw.length > 128) return A.json(400, { error: 'Password must be 8 to 128 characters' });
      Object.assign(u, A.hash(pw), { fails: 0, lock: 0 }); await users.set(u.email, u); return A.json(200, { ok: true });
    }
    if (b.action === 'delete') { const u = await target(); if (!u) return A.json(404, { error: 'User not found' }); await users.del(u.email); return A.json(200, { ok: true }); }

    if (b.action === 'approve' || b.action === 'reject') {
      const o = await orders.get(String(b.orderId || '').replace(/[^A-Za-z0-9]/g, ''));
      if (!o || o.method !== 'manual' || o.status !== 'REVIEW') return A.json(400, { error: 'Only manual orders under review can be changed' });
      if (b.action === 'approve') {
        const u = await users.get(o.email);
        if (!u) return A.json(404, { error: 'User no longer exists' });
        await P.credit(users, u, o.days, o.id); o.status = 'PAID'; o.paid = Date.now();
      } else {
        o.status = 'REJECTED';
        if (o.txhash) await (await db.open(e, 'txids')).del(o.txhash);
      }
      await orders.set(o.id, o);
      return A.json(200, { ok: true });
    }
    return A.json(400, { error: 'Unknown action' });
  } catch (err) {
    return A.json(503, { error: 'Admin service unavailable. Please try again.' });
  }
};

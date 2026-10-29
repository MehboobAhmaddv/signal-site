const crypto = require('crypto');
const A = require('../lib/auth');
const db = require('../lib/db');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const same = (a, b) => { a = Buffer.from(String(a)); b = Buffer.from(String(b)); return a.length === b.length && crypto.timingSafeEqual(a, b); };

exports.handler = async (e) => {
  if (e.httpMethod !== 'POST') return A.json(405, { error: 'POST only' });
  if (!process.env.AUTH_SECRET) return A.json(500, { error: 'AUTH_SECRET is not set on the server' });
  let b = {};
  try { b = JSON.parse(e.body || '{}'); } catch { return A.json(400, { error: 'Bad request' }); }
  try {
    if (b.action === 'me') {
      const a = await A.authed(e);
      return a ? A.json(200, { user: A.pub(a.user) }) : A.json(401, { error: 'Please log in again' });
    }
    const users = await db.open(e, 'users');
    const email = A.key(b.email), pw = String(b.password || '');
    if (!A.EMAIL.test(email)) return A.json(400, { error: 'Enter a valid email address' });

    if (b.action === 'register') {
      const name = String(b.name || '').trim().slice(0, 60) || email.split('@')[0];
      if (pw.length < 8 || pw.length > 128) return A.json(400, { error: 'Password must be 8 to 128 characters' });
      if (A.isAdmin(email) && !(process.env.ADMIN_PASSWORD && same(pw, process.env.ADMIN_PASSWORD)))
        return A.json(403, { error: 'This email is reserved for the site owner.' });
      if (await users.get(email)) return A.json(409, { error: 'An account with this email already exists' });
      const { salt, hash } = A.hash(pw);
      const u = { email, name, salt, hash, created: Date.now(), until: 0, banned: false, orders: [], fails: 0, lock: 0 };
      await users.set(email, u);
      return A.json(200, { token: A.sign(email), user: A.pub(u) });
    }
    if (b.action === 'login') {
      const u = await users.get(email);
      if (u && u.lock > Date.now()) return A.json(429, { error: 'Too many attempts. Try again in a few minutes.' });
      if (!u || !A.checkPw(pw, u.salt, u.hash)) {
        if (u) { u.fails = (u.fails || 0) + 1; if (u.fails >= 5) { u.lock = Date.now() + 15 * 60000; u.fails = 0; } await users.set(email, u); }
        await sleep(800);
        return A.json(401, { error: 'Invalid email or password' });
      }
      if (u.banned) return A.json(403, { error: 'This account is blocked. Contact the site owner.' });
      if (u.fails) { u.fails = 0; await users.set(email, u); }
      return A.json(200, { token: A.sign(email), user: A.pub(u) });
    }
    return A.json(400, { error: 'Unknown action' });
  } catch (err) {
    return A.json(503, { error: 'Account service unavailable. Please try again.' });
  }
};

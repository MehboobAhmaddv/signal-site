const crypto = require('crypto');
const db = require('./db');

const b64 = (s) => Buffer.from(s).toString('base64url');
const mac = (p) => crypto.createHmac('sha256', process.env.AUTH_SECRET || '').update(p).digest('base64url');

exports.EMAIL = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
exports.key = (e) => String(e || '').trim().toLowerCase();
exports.json = (code, obj) => ({ statusCode: code, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' }, body: JSON.stringify(obj) });
exports.sign = (email) => { const p = b64(JSON.stringify({ e: email, exp: Date.now() + 7 * 864e5 })); return p + '.' + mac(p); };

function verify(token) {
  try {
    if (!process.env.AUTH_SECRET) return null;
    const [p, s] = String(token).split('.');
    const e = mac(p);
    if (!s || s.length !== e.length || !crypto.timingSafeEqual(Buffer.from(s), Buffer.from(e))) return null;
    const d = JSON.parse(Buffer.from(p, 'base64url').toString());
    return d.exp > Date.now() ? d : null;
  } catch { return null; }
}

exports.hash = (pw, salt) => { salt = salt || crypto.randomBytes(16).toString('hex'); return { salt, hash: crypto.scryptSync(pw, salt, 64).toString('hex') }; };
exports.checkPw = (pw, salt, hash) => {
  const a = Buffer.from(crypto.scryptSync(String(pw), salt, 64).toString('hex')), b = Buffer.from(String(hash));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};
exports.isAdmin = (e) => !!process.env.ADMIN_EMAIL && exports.key(e) === exports.key(process.env.ADMIN_EMAIL);
exports.isMember = (u) => exports.isAdmin(u.email) || (u.until || 0) > Date.now();
exports.freeSymbols = () => (process.env.FREE_SYMBOLS || 'BTC/USD,EUR/USD').split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
exports.canUse = (u, sym) => exports.isMember(u) || exports.freeSymbols().includes(String(sym || '').split('@')[0].toUpperCase());
exports.PLANS = () => [
  { id: '30', days: 30, price: +process.env.PRICE_30 || 15 },
  { id: '90', days: 90, price: +process.env.PRICE_90 || 40 },
  { id: '365', days: 365, price: +process.env.PRICE_365 || 120 },
];
exports.pub = (u) => ({ email: u.email, name: u.name, member: exports.isMember(u), plan: exports.isMember(u) ? 'member' : 'free', until: u.until || 0, admin: exports.isAdmin(u.email), freeSymbols: exports.freeSymbols() });

// Returns { user, users } for a valid, non-banned session; otherwise null.
exports.authed = async (event) => {
  const h = event.headers || {};
  const tok = String(h.authorization || h.Authorization || '').replace(/^Bearer\s+/i, '');
  const d = verify(tok);
  if (!d) return null;
  const users = await db.open(event, 'users');
  const user = await users.get(exports.key(d.e));
  return !user || user.banned ? null : { user, users };
};

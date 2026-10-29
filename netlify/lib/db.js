// Small key-value store. Production: Netlify Blobs. Local testing: plain files when MS_FILE_DB is set.
// Usage: const users = await db.open(event, 'users');  users.get(key) / set(key, val) / del(key) / all()
const fs = require('fs'), path = require('path');

function fileStore(dir, name) {
  const base = path.join(dir, name), f = (k) => path.join(base, encodeURIComponent(k) + '.json');
  const keys = () => { try { return fs.readdirSync(base).map((n) => decodeURIComponent(n.replace(/\.json$/, ''))); } catch { return []; } };
  const get = async (k) => { try { return JSON.parse(fs.readFileSync(f(k), 'utf8')); } catch { return null; } };
  return {
    get,
    async set(k, v) { fs.mkdirSync(base, { recursive: true }); fs.writeFileSync(f(k), JSON.stringify(v)); },
    async del(k) { try { fs.unlinkSync(f(k)); } catch { /* already gone */ } },
    async all() { return (await Promise.all(keys().map(get))).filter(Boolean); },
  };
}

exports.open = async (event, name) => {
  if (process.env.MS_FILE_DB) return fileStore(process.env.MS_FILE_DB, name);
  const B = require('@netlify/blobs');
  B.connectLambda(event);
  const st = B.getStore('ms-' + name);
  const get = async (k) => await st.get(k, { type: 'json' });
  return {
    get,
    async set(k, v) { await st.setJSON(k, v); },
    async del(k) { await st.delete(k); },
    async all() { const r = await st.list(); return (await Promise.all(r.blobs.map((b) => get(b.key)))).filter(Boolean); },
  };
};

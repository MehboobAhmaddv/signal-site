# MONSTER TRADER™
Deploy on Netlify: push to GitHub, then Add new site > Import from Git (publish directory `.`, no build command).
Storage uses Netlify Blobs, which is built in. Nothing else to connect.

Site settings > Environment variables (required):
- AUTH_SECRET  (long random text, 32+ chars)
- ADMIN_EMAIL, ADMIN_PASSWORD  (your owner account; register once on the login page with this email + password)
- TD_KEY  (Twelve Data key for live prices; without it the site uses a Demo feed)
Optional: FREE_SYMBOLS (default BTC/USD,EUR/USD), PRICE_30, PRICE_90, PRICE_365, BINANCE_ADDRESS, BINANCE_NETWORK, BINANCE_PAY_ID, BINANCE_PAY_KEY, BINANCE_PAY_SECRET
Binance Pay webhook URL: https://YOUR-SITE/.netlify/functions/binance-webhook
Admin panel: /admin.html

## Shared data cache
All users share one cache of candles on the server, so Twelve Data is called only when the cache is stale (about every 20 s per watched pair for live signals, every 10 min for the pair-list win rates).
The server keeps under the free plan limits (7 calls/min, 770/day) for everyone combined. If the limit is hit, the pair list keeps showing its last values and live signals fall back to Demo until the next minute.

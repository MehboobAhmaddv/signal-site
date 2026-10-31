# MRK TRADER™ Signals
Deploy: push to GitHub, connect to Netlify (publish dir `.`). Netlify installs @netlify/blobs automatically.

Netlify > Site settings > Environment variables (required):
- AUTH_SECRET  (long random text, 32+ chars)
- ADMIN_EMAIL, ADMIN_PASSWORD  (your owner account; register once on the login page with this email + password)
- TD_KEY  (Twelve Data key for live prices; without it the site uses a Demo feed)
Manual USDT payments use the built-in Binance ID, TRC20 address and QR. Set BINANCE_ADDRESS / BINANCE_PAY_ID / BINANCE_NETWORK to override.
Optional: FREE_SYMBOLS (default BTC/USD,EUR/USD), PRICE_30, PRICE_90, PRICE_365, BINANCE_ADDRESS, BINANCE_NETWORK, BINANCE_PAY_ID, BINANCE_PAY_KEY, BINANCE_PAY_SECRET
Free users get only FREE_SYMBOLS; members and admin get all pairs. Admin panel: /admin.html

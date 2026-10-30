# MRK TRADER: what changed + what to set in Netlify

## New environment variables (Netlify > Site settings > Environment variables)
- RESEND_API_KEY  : free key from resend.com. Needed for the "someone bought membership" EMAIL.
- NOTIFY_EMAIL    : (optional) where those emails go. Defaults to ADMIN_EMAIL.
- MAIL_FROM       : (optional) e.g. "MRK TRADER <alerts@yourdomain.com>". Default works for testing.
- FREE_SYMBOLS    : (optional) free pairs. Default: EUR/USD,GBP/USD,BTC/USD,ETH/USD
- ALERT_MODE      : Telegram alert mode is now 1 = Fast, 2 = Relaxed, 3 = Premium (default 2)
If TG_BOT_TOKEN and TG_CHAT_ID are already set, you also get a Telegram message for each purchase.

## Modes
Fast = every candle. Relaxed = setup strength 4/7 or more. Premium = 5/7 or more (paid only).
Free accounts: Fast + Relaxed on their free pairs. (Premium lock is in the page, not the server.)

## Indicators used in the score (max 7.0)
EMA 20/50 (1.2) + EMA 60/150 (1.2) + RSI (1.0) + Bollinger (1.0) + Stochastic (0.4) + MACD (0.4)
+ candle patterns (0.5) + CCI (0.5, new) + Parabolic SAR (0.5, new) + ADX trend strength (0.3, new).

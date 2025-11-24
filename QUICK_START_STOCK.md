# 🚀 Quick Start - Stock Deep Dive Page

## Test the Page (3 Steps)

### 1. Start Development Server
```bash
npm run dev
```

### 2. Open Stock Page
Visit in browser:
```
http://localhost:3000/stock/AAPL
```

### 3. Test Features
- ✅ See live price for Apple stock
- ✅ Click timeframe buttons (1D, 1W, 1M, etc.)
- ✅ Wait 5 seconds to see price update
- ✅ Click "Watchlist" dropdown
- ✅ Switch between tabs
- ✅ Scroll to see AI Quick Take

---

## Try Other Stocks

```
/stock/MSFT    → Microsoft
/stock/TSLA    → Tesla
/stock/GOOGL   → Google
/stock/AMZN    → Amazon
/stock/NVDA    → NVIDIA
```

---

## What You'll See

### Live Header
```
AAPL                  $178.50 ▲ +2.1%
Apple Inc.            [🔴 LIVE]
```

### Key Metrics (Left)
- Market Cap: $2.8T
- P/E Ratio: 28.5
- EPS: $6.25
- Dividend Yield: 0.52%
- 52W Range: $124.17 - $198.23
- Volume: 45.1M
- Avg Volume: 52.0M
- Beta: 1.2

### Chart (Right)
Interactive candlestick chart with timeframe controls

### AI Quick Take (Bottom)
```
📈 BULLISH
Apple shows strong momentum with solid iPhone sales. 
Market conditions remain favorable for continued growth.

Confidence: 85%
[Deep Dive into FRA →]
```

---

## Navigation

### Tabs
- **Overview** ✅ (Active - shows everything above)
- **FRA** 🚧 (Coming Soon)
- **Sentiment** 🚧 (Coming Soon)
- **News** 🚧 (Coming Soon)
- **Learn** 🚧 (Coming Soon)

### Header Buttons
- **← Back** - Returns to previous page
- **Watchlist ▼** - Add to watchlist (dropdown)

---

## Expected Behavior

### Real-Time Updates
- Price updates **every 5 seconds**
- Small scale animation on price change
- Green ▲ for positive change
- Red ▼ for negative change

### Chart Interactions
- Click timeframe buttons to change period
- 1D chart refreshes every 30 seconds
- Other timeframes are cached for 30s
- Candlesticks: Green = up day, Red = down day

### Performance
- Initial page load: **< 2s**
- Price update: **< 100ms**
- Chart switch: **< 500ms**
- Tab switch: **instant**

---

## Troubleshooting

### "Cannot find module" errors
```bash
npm install
```

### Chart not showing
Check browser console - should see chart data loading

### Price stuck at loading
Check Redis connection in `.env`:
```env
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

### AI Quick Take not loading
Check OpenRouter API key:
```env
OPENROUTER_API_KEY=sk-or-v1-...
```

---

## Mobile Testing

Open Chrome DevTools (F12) and:
1. Click device toolbar icon (Ctrl+Shift+M)
2. Select "iPhone 12 Pro" or "Pixel 5"
3. Refresh page
4. Should stack vertically with mobile-friendly layout

---

## What's Next?

### To Add News Tab
1. Get API key from NewsAPI.org
2. Create `/api/stock/[ticker]/news/route.ts`
3. Update `overview-tab.tsx` with real news

### To Add FRA Tab
1. Fetch financial statements from Yahoo Finance
2. Calculate risk metrics
3. Build FRA visualization components

### To Deploy
```bash
npm run build
npm start
```

Or deploy to Vercel:
```bash
vercel
```

---

## Key Files to Know

```
src/
├── app/stock/[ticker]/page.tsx       ← Main page
├── components/stock/
│   ├── stock-header.tsx              ← Price header
│   ├── overview-tab.tsx              ← Overview layout
│   └── stock-chart.tsx               ← Chart component
└── api/stock/[ticker]/
    ├── route.ts                      ← Quote data
    ├── chart/route.ts                ← Chart data
    └── ai-quick-take/route.ts        ← AI summary
```

---

## Need Help?

1. Check `STOCK_DEEP_DIVE.md` for full documentation
2. Check `STOCK_PAGE_COMPLETE.md` for implementation details
3. Check browser console for errors
4. Check terminal for server logs

---

**You're all set! 🎉**

Start the server and navigate to `/stock/AAPL` to see your new stock page in action!

# Market Heatmap - Real-Time Data

## 📊 Overview

Market Heatmap نمایش گرافیکی بازار سهام است که با استفاده از **Yahoo Finance API** داده‌های لحظه‌ای دریافت می‌کند.

## 🎯 Features

### 1. Full Heatmap Page (`/dashboard/markets/heatmap`)
- نمایش کامل تمام سهام (100+ stock)
- گروه‌بندی بر اساس Sector و Industry
- اندازه هر مربع = Market Cap
- رنگ = درصد تغییر قیمت
  - 🟢 سبز = رشد مثبت
  - 🔴 قرمز = کاهش منفی
- Tooltip با جزئیات کامل
- به‌روزرسانی خودکار هر 30 ثانیه

### 2. Compact Heatmap (در صفحه اصلی Markets)
- نمایش خلاصه 6 سکتور برتر
- میانگین تغییرات هر سکتور
- لینک مستقیم به صفحه کامل
- طراحی فشرده و مدرن

## 📁 Files Structure

```
src/
├── app/
│   ├── api/
│   │   └── markets/
│   │       └── heatmap/
│   │           └── route.ts          # API endpoint for fetching real data
│   └── dashboard/
│       └── markets/
│           └── heatmap/
│               └── page.tsx           # Full heatmap page
└── components/
    └── markets/
        ├── market-treemap.tsx         # Main treemap component
        └── compact-heatmap.tsx        # Compact version for dashboard
```

## 🔌 API Endpoint

### `GET /api/markets/heatmap`

**Response:**
```json
{
  "data": [
    {
      "symbol": "AAPL",
      "name": "Apple Inc.",
      "sector": "Technology",
      "industry": "Consumer Electronics",
      "marketCap": 2800000000000,
      "changePercent": 1.25,
      "price": 182.50,
      "change": 2.30,
      "volume": 45000000
    }
    // ... more stocks
  ],
  "timestamp": "2025-11-24T10:30:00.000Z"
}
```

## 📊 Covered Sectors

1. **Technology** (10 stocks)
   - AAPL, MSFT, GOOGL, NVDA, META, AVGO, ORCL, AMD, CRM, ADBE

2. **Consumer Cyclical** (8 stocks)
   - AMZN, TSLA, HD, NKE, MCD, SBUX, TGT, LOW

3. **Financial Services** (8 stocks)
   - JPM, V, MA, BAC, WFC, GS, MS, AXP

4. **Healthcare** (8 stocks)
   - LLY, UNH, JNJ, MRK, ABBV, TMO, PFE, DHR

5. **Consumer Defensive** (8 stocks)
   - WMT, PG, KO, PEP, COST, PM, MDLZ, CL

6. **Energy** (8 stocks)
   - XOM, CVX, COP, SLB, EOG, MPC, PSX, VLO

7. **Communication Services** (6 stocks)
   - DIS, CMCSA, NFLX, T, VZ, TMUS

8. **Industrials** (8 stocks)
   - UPS, BA, HON, UNP, CAT, GE, RTX, LMT

9. **Basic Materials** (7 stocks)
   - LIN, APD, SHW, FCX, NEM, DD, DOW

10. **Real Estate** (7 stocks)
    - AMT, PLD, CCI, EQIX, PSA, SPG, O

11. **Utilities** (7 stocks)
    - NEE, DUK, SO, D, AEP, EXC, SRE

**Total: 85+ stocks covering all major sectors**

## 🎨 Color Scheme

```typescript
// Positive (Green)
rgba(16, 185, 129, intensity) // emerald-500 with opacity

// Negative (Red)
rgba(244, 63, 94, intensity)  // rose-500 with opacity

// Intensity = Math.min(Math.abs(changePercent) / 2, 1)
// 0% = 10% opacity
// 1% = 20% opacity
// 2%+ = 40% opacity (max)
```

## 🔄 Auto-Refresh

- **API**: Uses Yahoo Finance service with 30-second cache
- **Frontend**: Refreshes every 30 seconds automatically
- **Badge**: Shows "LIVE DATA" indicator

## 💡 Usage Examples

### 1. در صفحه کامل:
```bash
# Navigate to
http://localhost:3000/dashboard/markets/heatmap
```

### 2. در صفحه اصلی Markets:
```tsx
import { CompactHeatmap } from '@/components/markets/compact-heatmap';

<CompactHeatmap />
```

### 3. با داده دستی:
```tsx
import { MarketTreemap } from '@/components/markets/market-treemap';

const data = [
  {
    symbol: 'AAPL',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    marketCap: 2800000000000,
    changePercent: 1.25,
    name: 'Apple Inc.'
  }
];

<MarketTreemap data={data} />
```

## 🚀 Performance

- **Batch API calls**: Fetches all quotes in parallel
- **Client-side caching**: 30s TTL
- **Server-side caching**: 30s TTL in Yahoo service
- **Optimized rendering**: Uses Recharts Treemap
- **Lazy loading**: Data loads on demand

## 📱 Responsive Design

- **Desktop**: 3-level hierarchy (Market → Sector → Stock)
- **Tablet**: Auto-adjusts layout
- **Mobile**: Stacked compact view
- **Tooltips**: Touch-friendly on mobile

## 🎯 Future Enhancements

- [ ] Add filters (by sector, market cap, change %)
- [ ] Add time period selector (1D, 1W, 1M, YTD)
- [ ] Add comparison mode
- [ ] Add alerts for sector movements
- [ ] Export as image
- [ ] Add custom stock lists

## 🐛 Troubleshooting

### No data showing?
```bash
# Check if Yahoo Finance API is accessible
curl https://query1.finance.yahoo.com/v8/finance/chart/AAPL

# Check Next.js logs
npm run dev
```

### Slow loading?
- Yahoo Finance API has rate limits
- Reduce number of stocks in SECTOR_STOCKS
- Increase cache TTL

### Colors not showing?
- Check if changePercent values are correct
- Verify CSS is loading properly
- Check browser console for errors

## 📚 Related Documentation

- [Yahoo Finance Service](../lib/yahoo-finance-service.ts)
- [Market Types](../types/market.ts)
- [Recharts Documentation](https://recharts.org/)

---

**Last Updated**: November 24, 2025
**Data Source**: Yahoo Finance API (Free, No API Key Required)
**Update Frequency**: 30 seconds

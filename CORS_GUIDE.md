# راهنمای مشکل CORS و Yahoo Finance

## 🚨 مشکل CORS

Yahoo Finance از browser قابل دسترسی نیست به دلیل محدودیت‌های CORS (Cross-Origin Resource Sharing). این یک محدودیت امنیتی است که توسط Yahoo تنظیم شده.

### خطای رایج:
```
Fetch API cannot load https://query1.finance.yahoo.com/v8/finance/chart/AAPL 
due to access control checks.
Origin http://localhost:3001 is not allowed by Access-Control-Allow-Origin.
```

## ✅ راه حل

**همیشه از API routes در Next.js استفاده کن** - این درخواست‌ها از server اجرا می‌شن و مشکل CORS ندارن.

### ❌ غلط (Client-Side):
```typescript
// این کار نمی‌کنه!
const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/AAPL');
```

### ✅ درست (Server-Side):
```typescript
// در component
const response = await fetch('/api/markets/test-yahoo?symbol=AAPL');

// در API route
export async function GET(request: NextRequest) {
  const quote = await YahooFinanceService.getQuote('AAPL');
  return NextResponse.json(quote);
}
```

## 📁 ساختار درست

### Client Components:
```typescript
'use client';

export default function MyComponent() {
  useEffect(() => {
    // استفاده از API routes داخلی
    fetch('/api/markets/indices')
      .then(res => res.json())
      .then(data => setData(data));
  }, []);
}
```

### Server Components/API Routes:
```typescript
import { YahooFinanceService } from '@/lib/yahoo-finance-service';

export async function GET() {
  // مستقیم از Yahoo می‌گیره، CORS مشکل نداره
  const data = await YahooFinanceService.getQuote('AAPL');
  return NextResponse.json(data);
}
```

## 🎯 API Endpoints موجود

### 1. تست مستقیم Yahoo Finance
```
GET /api/markets/test-yahoo?symbol=AAPL
```

### 2. اندیس‌های بازار
```
GET /api/markets/indices
```

### 3. برترین سهم‌ها
```
GET /api/markets/movers?type=gainers|losers|active
```

### 4. جستجو
```
GET /api/market/search?q=AAPL
```

### 5. قیمت سهم
```
GET /api/market/quote?symbol=AAPL
```

## 🔧 نکات مهم

1. **همیشه از API routes استفاده کن** برای درخواست‌های خارجی
2. **Yahoo Finance** نیازی به API key نداره
3. **Finnhub و Alpha Vantage** به عنوان fallback وجود دارن
4. **Caching** فعال هست (30s برای Yahoo)
5. **Rate limiting** خودکار است

## 🧪 تست کردن

برای تست یکپارچگی Yahoo Finance:

```bash
# Development server رو اجرا کن
npm run dev

# صفحه تست رو باز کن
http://localhost:3000/test-yahoo
```

Console browser رو چک کن ببین داده‌ها دارن از server میان.

## 📊 Provider Hierarchy

1. **Yahoo Finance** (Primary) - بدون API key، rate limit بالا
2. **Finnhub** (Fallback 1) - WebSocket real-time
3. **Alpha Vantage** (Fallback 2) - REST polling

اگر Yahoo fail بشه، سیستم خودکار به Finnhub سوییچ می‌کنه.

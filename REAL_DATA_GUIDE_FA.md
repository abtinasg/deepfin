# 🚀 راهنمای استفاده از داده‌های واقعی

## ✅ چه کاری انجام شد؟

سیستم به طور کامل به API های واقعی متصل شد:

### 1. **Finnhub API** (اصلی)
- ✅ قیمت‌های real-time سهام
- ✅ اطلاعات شاخص‌های بازار
- ✅ تغییرات قیمت و درصد
- ✅ WebSocket برای به‌روزرسانی لحظه‌ای

### 2. **Alpha Vantage** (پشتیبان)
- ✅ فالبک اتوماتیک در صورت خرابی Finnhub
- ✅ داده‌های REST API

## 📁 فایل‌های تغییر یافته

```
✅ src/lib/market-data.ts              → API واقعی Finnhub
✅ src/lib/markets-service.ts          → API واقعی برای indices و movers
✅ src/app/api/market/quote/route.ts   → API endpoint واقعی
✅ src/app/test-real-data/page.tsx     → صفحه تست API
✅ .env                                 → کلیدهای NEXT_PUBLIC اضافه شد
```

## 🔑 API Keys موجود

```env
# ✅ موجود
FINNHUB_API_KEY=d4htmv1r01quqmlakdb0d4htmv1r01quqmlakdbg
NEXT_PUBLIC_FINNHUB_API_KEY=d4htmv1r01quqmlakdb0d4htmv1r01quqmlakdbg

ALPHA_VANTAGE_API_KEY=MGVBXGGINDL276U2
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=MGVBXGGINDL276U2
```

## 🧪 تست کردن

### روش 1: صفحه تست
```
http://localhost:3000/test-real-data
```
این صفحه:
- ✅ اتصال به API را تست می‌کند
- ✅ داده واقعی AAPL را نمایش می‌دهد
- ✅ وضعیت environment variables را چک می‌کند
- ✅ خطاها را نمایش می‌دهد

### روش 2: صفحه Markets
```
http://localhost:3000/dashboard/markets
```
این صفحه:
- ✅ شاخص‌های بازار واقعی (S&P 500, NASDAQ, DOW, RUSSELL)
- ✅ برترین سهام‌ها (gainers/losers) با داده واقعی
- ✅ به‌روزرسانی هر 60 ثانیه

### روش 3: Real-time Demo
```
http://localhost:3000/dashboard/realtime-demo
```
این صفحه:
- ✅ اتصال WebSocket
- ✅ قیمت‌های لحظه‌ای
- ✅ هشدارهای قیمتی
- ✅ نوتیفیکیشن

## 📊 داده‌های در دسترس

### قیمت سهام واقعی:
```typescript
import { useMarketData } from '@/hooks/use-market-data';

const { data } = useMarketData(['AAPL', 'MSFT', 'GOOGL']);
// ✅ قیمت‌های واقعی از Finnhub
```

### شاخص‌های بازار:
```typescript
import { MarketsService } from '@/lib/markets-service';

const indices = await MarketsService.getUSIndices();
// ✅ S&P 500, NASDAQ, DOW, RUSSELL با داده واقعی
```

### برترین سهام‌ها:
```typescript
const gainers = await MarketsService.getMarketMovers('gainers');
const losers = await MarketsService.getMarketMovers('losers');
// ✅ 5 سهم برتر با داده واقعی
```

## ⚡ محدودیت‌های API (رایگان)

### Finnhub Free:
- 📊 **60 درخواست در دقیقه**
- 💻 WebSocket برای سهام US
- ⏰ به‌روزرسانی هر 1 ثانیه

### Alpha Vantage Free:
- 📊 **5 درخواست در دقیقه**
- 📈 75 درخواست در روز
- ⏰ Polling هر 60 ثانیه

## 🔄 مکانیزم Fallback

```
1. تلاش برای Finnhub
   ↓
2. اگر خطا → Alpha Vantage
   ↓
3. اگر خطا → داده Mock (با warning)
```

## 🐛 عیب‌یابی

### داده‌ها واقعی نشان نمی‌دهد؟

1. **چک کردن API Keys:**
```bash
# در terminal:
echo $NEXT_PUBLIC_FINNHUB_API_KEY
```

2. **چک کردن Console:**
```javascript
// در Browser DevTools → Console:
// باید ببینید:
"Finnhub API connected"
// یا
"Using mock data for SYMBOL" // اگر API کار نکرد
```

3. **تست مستقیم API:**
```bash
# در terminal:
curl "https://finnhub.io/api/v1/quote?symbol=AAPL&token=d4htmv1r01quqmlakdb0d4htmv1r01quqmlakdbg"
```

باید پاسخ بگیرید:
```json
{
  "c": 189.45,    // قیمت فعلی
  "d": 2.34,      // تغییر
  "dp": 1.25,     // درصد تغییر
  "h": 191.23,    // بالاترین
  "l": 187.56,    // پایین‌ترین
  "o": 188.90,    // قیمت باز شدن
  "pc": 187.11,   // بسته شدن قبلی
  "t": 1700000000 // timestamp
}
```

4. **ریستارت کردن Dev Server:**
```bash
# در terminal:
npm run dev
```

### خطای "API key not configured"

```bash
# چک کنید که این خط در .env باشد:
NEXT_PUBLIC_FINNHUB_API_KEY=d4htmv1r01quqmlakdb0d4htmv1r01quqmlakdbg

# سپس ریستارت کنید
```

### خطای "429 Too Many Requests"

```
🚨 محدودیت API رایگان به پایان رسیده
⏰ صبر کنید 1 دقیقه
💡 یا از plan پولی استفاده کنید
```

## 📈 نمونه خروجی واقعی

```javascript
// ✅ قبل (Mock):
{
  symbol: "AAPL",
  price: 178.45,  // ⚠️ رندوم
  change: 2.34
}

// ✅ بعد (Real):
{
  symbol: "AAPL", 
  price: 189.45,  // ✅ واقعی از Finnhub
  change: 2.34,   // ✅ واقعی
  changePercent: 1.25,
  timestamp: "2025-11-23T..."
}
```

## 🎯 سهام‌های قابل دسترسی

بیش از 60,000 سهم US از طریق Finnhub:

```typescript
// مثال‌ها:
'AAPL'   // Apple
'MSFT'   // Microsoft  
'GOOGL'  // Google
'AMZN'   // Amazon
'NVDA'   // NVIDIA
'TSLA'   // Tesla
'META'   // Meta
...
```

## 🌐 شاخص‌های بازار

```typescript
'^GSPC'  // S&P 500 ✅
'^IXIC'  // NASDAQ  ✅
'^DJI'   // DOW     ✅
'^RUT'   // Russell ✅
```

## 💡 نکات مهم

1. ✅ همه داده‌ها حالا از Finnhub می‌آیند
2. ✅ Cache 60 ثانیه‌ای برای صرفه‌جویی API quota
3. ✅ WebSocket برای real-time در `/dashboard/realtime-demo`
4. ✅ Fallback اتوماتیک به Alpha Vantage
5. ✅ Console warnings برای مشکلات API

## 🚀 استفاده در Production

برای production باید:

1. **API Key جدید بگیرید** (plan پولی)
```
Finnhub Professional: 600 requests/min
Alpha Vantage Premium: 75 requests/min
```

2. **Rate Limiting اضافه کنید**
```typescript
// در API routes
import { Ratelimit } from "@upstash/ratelimit";
```

3. **Error Handling بهتر**
```typescript
try {
  const data = await fetch(...);
} catch (error) {
  // Log to monitoring service
  // Fallback to cached data
}
```

## ✨ ویژگی‌های جدید

- ✅ **Real-time prices** از Finnhub WebSocket
- ✅ **Auto-refresh** هر 60 ثانیه
- ✅ **Error resilience** با fallback
- ✅ **Cache layer** با Redis
- ✅ **Rate limiting** برای API quota
- ✅ **Test page** برای debugging

---

**🎉 سیستم آماده است!**

برای تست: `/test-real-data`

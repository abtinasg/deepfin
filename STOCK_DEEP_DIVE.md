# Stock Deep Dive Page - Implementation Guide

## Overview
A comprehensive stock analysis page with Apple-style design, featuring real-time price updates, interactive charts, AI insights, and multi-tab navigation.

## Route
```
/stock/[ticker]
```

Example: `/stock/AAPL`, `/stock/TSLA`, `/stock/GOOGL`

## Features Implemented

### 1. **Stock Header** (`stock-header.tsx`)
- Live price updates every 5 seconds
- Company name and ticker
- Price change indicator (▲/▼)
- Back navigation
- Watchlist button (placeholder)
- Live market indicator

### 2. **Tab Navigation** (`tab-navigation.tsx`)
- 5 tabs: Overview, FRA, Sentiment, News, Learn
- Smooth animated underline transition
- Active state management
- Framer Motion animations

### 3. **Overview Tab** (`overview-tab.tsx`)
Contains:
- **Key Metrics** (left column)
  - Market Cap
  - P/E Ratio
  - EPS
  - Dividend Yield
  - 52-Week Range
  - Volume & Avg Volume
  - Beta

- **Price Chart** (right column)
  - TradingView Lightweight Charts
  - Candlestick display
  - Timeframes: 1D, 1W, 1M, 3M, 1Y, ALL
  - Real-time updates for 1D view

- **AI Quick Take**
  - 2-sentence AI-generated summary
  - Sentiment badge (Bullish/Bearish/Neutral)
  - Confidence score
  - CTA to FRA analysis

- **Recent News**
  - Placeholder for news integration
  - Styled cards with hover effects

## Tech Stack

- **Next.js 14** - App Router with TypeScript
- **React Query** - Data fetching with 5s cache
- **Framer Motion** - Smooth animations
- **TradingView Lightweight Charts** - Professional charts
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## API Routes

### GET `/api/stock/[ticker]`
Returns basic stock data:
```typescript
{
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  isLive: boolean;
  lastUpdate: number;
}
```
**Cache:** 5 seconds (Redis)

### GET `/api/stock/[ticker]/chart?timeframe=1Y`
Returns historical price data:
```typescript
[
  {
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }
]
```
**Cache:** 60 seconds (Redis)

### GET `/api/stock/[ticker]/ai-quick-take`
Returns AI analysis:
```typescript
{
  ticker: string;
  summary: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  lastUpdate: number;
}
```
**Cache:** 5 minutes

## Design Principles

### Apple-Style Design
- **Generous spacing** - Ample padding and margins
- **Clean typography** - Inter for text, JetBrains Mono for numbers
- **Subtle animations** - Framer Motion for smooth transitions
- **White background** - Clean, professional look
- **Rounded corners** - Border-radius: 16px (rounded-2xl)
- **Minimal borders** - Subtle gray borders

### Color Scheme
- **Background:** `bg-gray-50`
- **Cards:** `bg-white` with `border`
- **Green (up):** `text-green-600`
- **Red (down):** `text-red-600`
- **Primary:** `bg-blue-600`
- **Text:** `text-gray-900`, `text-gray-600`

## Performance Optimizations

1. **React Query Caching**
   - 5-second stale time for price data
   - 60-second cache for chart data
   - 5-minute cache for AI insights

2. **Redis Caching**
   - Stock quotes: 5s TTL
   - Chart data: 60s TTL
   - Reduces API calls to Yahoo Finance

3. **Conditional Refetching**
   - Only 1D chart refetches every 5 seconds
   - Other timeframes don't auto-refresh

4. **Suspense Loading**
   - Skeleton screens for better UX
   - Progressive loading

## Mobile Responsiveness

- Stack layout on mobile (`grid-cols-1`)
- Full-width components
- Simplified chart view
- Touch-friendly buttons

## Usage Example

```typescript
// Link to stock page
<Link href="/stock/AAPL">
  View Apple Stock
</Link>

// Direct navigation
router.push('/stock/TSLA');
```

## Future Enhancements

### FRA Tab (Fundamental Risk Analysis)
- Financial statements
- Ratios analysis
- Risk metrics
- AI-powered insights

### Sentiment Tab
- Social media sentiment
- News sentiment analysis
- Institutional investor activity

### News Tab
- Real-time news feed
- Filtered by ticker
- News sentiment

### Learn Tab
- Educational content
- Company overview
- Industry analysis
- Investment strategies

## Data Sources

- **Yahoo Finance** - Primary data source
- **OpenRouter AI** - AI quick takes
- **Redis** - Caching layer

## File Structure

```
src/
├── app/
│   └── stock/
│       └── [ticker]/
│           └── page.tsx
├── components/
│   └── stock/
│       ├── stock-deep-dive.tsx
│       ├── stock-deep-dive-skeleton.tsx
│       ├── stock-page-client.tsx
│       ├── stock-header.tsx
│       ├── tab-navigation.tsx
│       ├── overview-tab.tsx
│       ├── key-metrics.tsx
│       ├── stock-chart.tsx (or price-chart.tsx)
│       ├── ai-quick-take.tsx
│       └── recent-news.tsx
└── types/
    └── stock.ts
```

## Testing

1. Visit `/stock/AAPL`
2. Verify live price updates (every 5 seconds)
3. Switch between timeframes
4. Check chart responsiveness
5. Test tab navigation
6. Verify mobile layout

## Notes

- All numbers are formatted with proper suffixes (K, M, B, T)
- Prices update in real-time during market hours
- Fallback to "N/A" for missing data
- Error boundaries for failed API calls
- Accessible keyboard navigation

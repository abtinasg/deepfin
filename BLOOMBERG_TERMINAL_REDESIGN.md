# Bloomberg-Style Terminal Redesign Blueprint
## DeepFin Financial Terminal - Complete Architectural Specification

**Version:** 1.0
**Date:** November 24, 2025
**Status:** Design Complete - Ready for Implementation

---

## 🎯 Executive Summary

Transform DeepFin into a **Bloomberg Terminal-inspired** financial platform that combines:
- **Ultra-dense information architecture** (Bloomberg-style compact layouts)
- **Existing dark neon aesthetic** (maintain current theme identity)
- **Yahoo Finance as sole data source** (unified, reliable market data)
- **Always-visible AI Copilot** (permanent right sidebar, 350-420px)
- **Professional terminal UX** (keyboard shortcuts, instant search, rapid navigation)

### Core Design Principles

1. **Information Density First** - Every pixel serves a purpose
2. **Dark Neon Identity** - Keep rounded corners, glows, gradient accents
3. **Bloomberg-Inspired Grid** - Multi-panel, scannable layouts
4. **Yahoo Finance Only** - Single source of truth for all market data
5. **AI-Powered Intelligence** - Persistent copilot for analysis

---

## 📐 Layout Architecture

### 1. Three-Column Grid System

```
┌─────────────────────────────────────────────────────────────────┐
│                    TERMINAL TOP BAR (48px)                      │
├──────────────┬─────────────────────────┬────────────────────────┤
│              │                         │                        │
│   LEFT COL   │      CENTER COL        │   AI COPILOT (FIXED)  │
│   ~30%       │       ~40%             │        350-420px       │
│              │                         │                        │
│  • Indices   │  • Main Chart          │  • Chat Interface     │
│  • Sectors   │  • Performance View    │  • Context Panel      │
│  • Movers    │  • Multi-ticker        │  • Quick Actions      │
│  • Futures   │  • Normalized          │  • Sentiment          │
│  • Bonds     │                         │  • AI Insights        │
│  • FX        │                         │                        │
│  • Comm      │                         │  (Never scrolls away) │
│              │                         │                        │
└──────────────┴─────────────────────────┴────────────────────────┘
```

### 2. Grid Breakpoints

```typescript
// Terminal Grid System
const TERMINAL_GRID = {
  // Desktop (1920px+) - Full Bloomberg layout
  xl: {
    leftCol: '30%',      // 576px @ 1920px
    centerCol: '40%',    // 768px @ 1920px
    aiPanel: '400px',    // Fixed width
    gap: '16px'
  },

  // Large Desktop (1440px-1919px)
  lg: {
    leftCol: '32%',      // 461px @ 1440px
    centerCol: '40%',    // 576px @ 1440px
    aiPanel: '360px',    // Fixed width
    gap: '12px'
  },

  // Medium Desktop (1280px-1439px)
  md: {
    leftCol: '35%',      // 448px @ 1280px
    centerCol: '40%',    // 512px @ 1280px
    aiPanel: '320px',    // Fixed width (collapsible)
    gap: '12px'
  },

  // Small Desktop/Tablet (1024px-1279px)
  sm: {
    // Two-column: Left + Center (AI panel as overlay)
    leftCol: '40%',
    centerCol: '60%',
    aiPanel: '360px',    // Slide-over overlay
    gap: '12px'
  },

  // Mobile (<1024px)
  mobile: {
    // Single column stack
    // AI panel as bottom drawer or full-screen modal
  }
};
```

### 3. Vertical Section Heights

Bloomberg-style uses **fixed module heights** for perfect alignment:

```typescript
const MODULE_HEIGHTS = {
  // Micro modules (single metric)
  micro: '60px',           // Single line stat

  // Compact modules (small tables, mini charts)
  compact: '240px',        // 3-5 rows of data

  // Standard modules (most common)
  standard: '320px',       // 6-8 rows, small chart

  // Large modules (main content)
  large: '480px',          // Full chart, 10+ rows

  // Extra large (primary focus)
  xlarge: '640px',         // Main terminal chart

  // AI Copilot (full height)
  copilot: 'calc(100vh - 48px)' // Full viewport minus top bar
};
```

---

## 🏗️ Component Architecture

### Terminal Top Bar (48px height)

```typescript
// Location: src/components/terminal/TerminalTopBar.tsx

<TerminalTopBar>
  <LeftSection>
    - DeepFin Logo (compact, 32px)
    - Global Market Status Indicator
    - Current Time + Market Hours
  </LeftSection>

  <CenterSection>
    - Global Search (Cmd+K) - Bloomberg-style ticker search
    - Quick Symbol Entry
    - Recent/Favorites ticker chips
  </CenterSection>

  <RightSection>
    - Notifications (minimal badge)
    - Settings (gear icon)
    - User Profile (compact)
  </RightSection>
</TerminalTopBar>
```

**Styling:**
```css
.terminal-top-bar {
  height: 48px;
  background: rgba(2, 6, 23, 0.95);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 1px 0 0 rgba(124, 58, 237, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}
```

### Left Column Modules

```typescript
// Location: src/components/terminal/left-column/

<LeftColumn className="w-[30%] space-y-3 pr-3">
  {/* Micro: Market Status Banner */}
  <MarketStatusBanner height="60px" />

  {/* Compact: Major Indices */}
  <IndicesGrid
    height="240px"
    symbols={['^GSPC', '^IXIC', '^DJI', '^RUT', '^VIX']}
    layout="dense-4x2"
  />

  {/* Compact: Sector Performance */}
  <SectorHeatmap
    height="240px"
    symbols={['XLK', 'XLF', 'XLE', 'XLV', 'XLY', 'XLP', 'XLI', 'XLB', 'XLRE', 'XLU', 'XLC']}
    layout="compact-grid"
  />

  {/* Standard: Market Movers */}
  <MarketMoversTable
    height="320px"
    tabs={['Gainers', 'Losers', 'Active', 'Unusual Vol']}
  />

  {/* Compact: Futures & Commodities */}
  <FuturesTicker
    height="240px"
    symbols={['GC=F', 'CL=F', 'SI=F', 'NG=F', 'BTC-USD', 'ETH-USD']}
  />

  {/* Compact: Currency Pairs */}
  <ForexGrid
    height="180px"
    pairs={['EURUSD=X', 'GBPUSD=X', 'USDJPY=X', 'DX-Y.NYB']}
  />

  {/* Compact: Bond Yields */}
  <BondYields
    height="180px"
    symbols={['^TNX', '^TYX', '^FVX', '^IRX']}
  />

  {/* Standard: Economic Calendar */}
  <EconomicCalendar
    height="320px"
    source="yahoo-finance-news" // or external API
  />
</LeftColumn>
```

### Center Column Modules

```typescript
// Location: src/components/terminal/center-column/

<CenterColumn className="w-[40%] space-y-3 px-3">
  {/* Micro: Quick Stats Bar */}
  <QuickStatsBar
    height="60px"
    metrics={['avgIndexMove', 'topGainer', 'leadingSector', 'vixLevel']}
  />

  {/* XLarge: Main Terminal Chart */}
  <NormalizedPerformanceChart
    height="640px"
    defaultTickers={['^GSPC', '^IXIC', '^DJI']}
    timeRanges={['1D', '5D', '1M', '3M', '6M', 'YTD', '1Y', '5Y', 'MAX']}
    defaultRange="5D"
    overlayIndicators={true}
    yahooDataSource={true}
  />

  {/* Standard: Sector Rotation Map */}
  <SectorRotationMap
    height="320px"
    data="yahoo-sector-etfs"
    layout="quadrant-chart"
  />

  {/* Large: Advanced Heatmap */}
  <MarketHeatmap
    height="480px"
    universe="SP500" // Use Yahoo Finance screener data
    colorBy="changePercent"
    sizeBy="marketCap"
  />

  {/* Standard: Market Breadth */}
  <MarketBreadthIndicators
    height="320px"
    metrics={['advanceDecline', 'newHighsLows', 'upDownVolume']}
    source="yahoo-market-data"
  />
</CenterColumn>
```

### AI Copilot Panel (Fixed Right)

```typescript
// Location: src/components/terminal/ai-copilot/TerminalCopilot.tsx

<AICopilotPanel className="w-[400px] fixed right-0 top-[48px] h-[calc(100vh-48px)]">
  <CopilotHeader className="h-12 border-b border-white/5">
    - "Ask Alpha" branding
    - Minimize/Expand controls
    - Quick action buttons
  </CopilotHeader>

  <CopilotBody className="flex-1 overflow-y-auto">
    {/* Active Chat Interface */}
    <ChatMessages />

    {/* Context Panel (collapsible) */}
    <ContextPanel>
      - Current watchlist
      - Active positions
      - Recent searches
      - Market sentiment summary
    </ContextPanel>

    {/* Suggested Prompts */}
    <QuickPrompts
      prompts={[
        "Analyze current sector rotation",
        "What's driving today's moves?",
        "Compare tech leaders performance",
        "Alert me when VIX > 20"
      ]}
    />
  </CopilotBody>

  <CopilotInput className="h-16 border-t border-white/5">
    - Text input with @ mentions (for tickers)
    - Voice input button
    - Attachment button (for charts)
    - Send button
  </CopilotInput>
</AICopilotPanel>
```

**Fixed Positioning:**
```css
.ai-copilot-panel {
  position: fixed;
  right: 0;
  top: 48px; /* Below top bar */
  width: 400px;
  height: calc(100vh - 48px);
  background: rgba(11, 17, 33, 0.98);
  backdrop-filter: blur(16px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.3);
  z-index: 90;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
```

---

## 🎨 Bloomberg-Style Design Tokens

### Density & Spacing System

```typescript
// Location: tailwind.config.ts extensions

export const TERMINAL_DENSITY = {
  spacing: {
    // Tighter than current - Bloomberg-style
    'terminal-0': '0px',
    'terminal-1': '2px',    // Micro gaps
    'terminal-2': '4px',    // Tiny spacing
    'terminal-3': '6px',    // Small spacing
    'terminal-4': '8px',    // Standard cell padding
    'terminal-6': '12px',   // Module gaps
    'terminal-8': '16px',   // Section gaps
    'terminal-12': '24px',  // Major sections
  },

  fontSize: {
    // Smaller, denser text
    'terminal-xs': '10px',   // Labels, timestamps
    'terminal-sm': '11px',   // Table data
    'terminal-base': '12px', // Primary text
    'terminal-md': '13px',   // Emphasis
    'terminal-lg': '14px',   // Headers
    'terminal-xl': '16px',   // Section titles
  },

  lineHeight: {
    'terminal-tight': '1.2',    // Data rows
    'terminal-snug': '1.35',    // Tables
    'terminal-normal': '1.5',   // Body text
  },

  padding: {
    // Component internal spacing
    'cell': '6px 8px',          // Table cell
    'card': '12px 14px',        // Card padding (reduced from current)
    'module': '14px 16px',      // Module container
  }
};
```

### Color Enhancements

```typescript
// Add to existing color system in globals.css

:root {
  /* Terminal-specific colors (add to existing) */
  --terminal-bg: 228 35% 2%;          /* Deeper black */
  --terminal-surface: 222 33% 8%;     /* Card backgrounds */
  --terminal-border: 220 25% 15%;     /* Borders */
  --terminal-text-primary: 0 0% 98%;  /* Bright white */
  --terminal-text-secondary: 220 20% 70%; /* Muted */
  --terminal-text-tertiary: 220 15% 50%;  /* Deemphasized */

  /* Semantic colors (keep existing, add these) */
  --positive-glow: 148 59% 56%;       /* Green glow */
  --negative-glow: 0 84% 68%;         /* Red glow */
  --neutral-glow: 219 100% 65%;       /* Blue glow */

  /* Bloomberg-inspired accents */
  --terminal-orange: 25 95% 58%;      /* Bloomberg signature */
  --terminal-blue: 210 100% 56%;      /* Info/neutral */
  --terminal-cyan: 184 80% 56%;       /* Tech/data */
}
```

### Typography System

```css
/* Add to globals.css */

.terminal-mono {
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum" 1;
  letter-spacing: -0.01em;
}

.terminal-metric {
  @apply terminal-mono font-medium;
  font-size: 13px;
}

.terminal-label {
  @apply text-terminal-xs uppercase tracking-wider;
  color: hsl(var(--terminal-text-tertiary));
  font-weight: 500;
}

.terminal-value {
  @apply terminal-mono text-terminal-md font-semibold;
  color: hsl(var(--terminal-text-primary));
}
```

---

## 📊 Yahoo Finance Data Mapping

### Complete Yahoo Finance Integration

All market data flows through Yahoo Finance API endpoints.

#### 1. Major Indices

**Yahoo Symbols:**
```typescript
const US_INDICES = [
  '^GSPC',    // S&P 500
  '^IXIC',    // NASDAQ Composite
  '^DJI',     // Dow Jones Industrial Average
  '^RUT',     // Russell 2000
  '^VIX',     // CBOE Volatility Index
];

// Yahoo Finance endpoint:
// GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d
// Returns: regularMarketPrice, regularMarketChange, regularMarketChangePercent
```

**Component:** `IndicesGrid`
**Update Frequency:** Every 15 seconds (market hours), 5 minutes (after hours)
**Display:** Price, Change, Change%, Mini sparkline (5D)

#### 2. Sector Performance

**Yahoo Symbols (Sector ETFs):**
```typescript
const SECTOR_ETFS = [
  'XLK',   // Technology
  'XLF',   // Financials
  'XLE',   // Energy
  'XLV',   // Healthcare
  'XLY',   // Consumer Discretionary
  'XLP',   // Consumer Staples
  'XLI',   // Industrials
  'XLB',   // Materials
  'XLRE',  // Real Estate
  'XLU',   // Utilities
  'XLC',   // Communication Services
];

// Endpoint: Same as indices
// Calculate relative performance vs S&P 500
```

**Component:** `SectorHeatmap`
**Update Frequency:** Every 30 seconds
**Display:** Heatmap tiles colored by % change, sized by volume

#### 3. Market Movers (Gainers, Losers, Active)

**Yahoo Finance Screener API:**
```typescript
// Option 1: Use Yahoo Finance Screener (unofficial)
// GET https://query1.finance.yahoo.com/v1/finance/screener
// Payload: { "size": 25, "sortField": "percentchange", "sortType": "DESC" }

// Option 2: Fetch predefined list and sort client-side
const TOP_100_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', ...]; // Top 100 by market cap
// Batch fetch via chart API, sort by changePercent

// Option 3: Use existing /api/markets/movers endpoint (already implemented)
// Expand to include more symbols
```

**Component:** `MarketMoversTable`
**Update Frequency:** Every 60 seconds
**Display:** Tabbed table (Gainers | Losers | Active), 10-15 rows each

#### 4. Futures & Commodities

**Yahoo Symbols:**
```typescript
const FUTURES = [
  'GC=F',     // Gold Futures
  'SI=F',     // Silver Futures
  'CL=F',     // Crude Oil WTI Futures
  'NG=F',     // Natural Gas Futures
  'ZC=F',     // Corn Futures
  'ZW=F',     // Wheat Futures
  'BTC-USD',  // Bitcoin
  'ETH-USD',  // Ethereum
];
```

**Component:** `FuturesTicker`
**Update Frequency:** Every 30 seconds
**Display:** Scrolling ticker or compact grid

#### 5. Currency Pairs (Forex)

**Yahoo Symbols:**
```typescript
const FOREX_PAIRS = [
  'EURUSD=X',  // Euro to USD
  'GBPUSD=X',  // British Pound to USD
  'USDJPY=X',  // USD to Japanese Yen
  'USDCAD=X',  // USD to Canadian Dollar
  'AUDUSD=X',  // Australian Dollar to USD
  'DX-Y.NYB',  // US Dollar Index
];
```

**Component:** `ForexGrid`
**Update Frequency:** Every 60 seconds
**Display:** Compact 2x3 grid

#### 6. Bond Yields

**Yahoo Symbols:**
```typescript
const BOND_YIELDS = [
  '^IRX',   // 13 Week Treasury Yield
  '^FVX',   // 5 Year Treasury Yield
  '^TNX',   // 10 Year Treasury Yield
  '^TYX',   // 30 Year Treasury Yield
];
```

**Component:** `BondYields`
**Update Frequency:** Every 5 minutes
**Display:** Vertical list with current yield + change

#### 7. Global Indices

**Yahoo Symbols:**
```typescript
const GLOBAL_INDICES = [
  '^FTSE',    // FTSE 100 (UK)
  '^GDAXI',   // DAX (Germany)
  '^FCHI',    // CAC 40 (France)
  '^N225',    // Nikkei 225 (Japan)
  '^HSI',     // Hang Seng (Hong Kong)
  '000001.SS',// Shanghai Composite
  '^AXJO',    // ASX 200 (Australia)
];
```

**Component:** `GlobalMarketsPanel`
**Update Frequency:** Every 2 minutes
**Display:** List with flag emoji, name, price, change%

#### 8. Normalized Performance Chart (Center Panel Main Chart)

**Data Source:**
```typescript
// Fetch historical data for multiple tickers
// GET https://query1.finance.yahoo.com/v8/finance/chart/{symbol}
// ?interval=5m&range=5d (for 5-day view)
// ?interval=1d&range=1mo (for 1-month view)

// Normalize to 100 at start of period:
// normalized[i] = (price[i] / price[0]) * 100
```

**Component:** `NormalizedPerformanceChart`
**Default Tickers:** `['^GSPC', '^IXIC', '^DJI']`
**User Selectable:** Up to 10 tickers
**Time Ranges:** 1D, 5D, 1M, 3M, 6M, YTD, 1Y, 5Y, MAX
**Update Frequency:** Every 60 seconds (5m intervals for intraday)

#### 9. Market Breadth (Advanced)

```typescript
// Fetch all S&P 500 or custom watchlist symbols
// Calculate:
// - Advance/Decline Ratio: (# stocks up) / (# stocks down)
// - New Highs/Lows: Stocks at 52-week high vs low
// - Up/Down Volume: Total volume of advancing vs declining stocks

// Data source: Batch fetch S&P 500 constituents
const SP500_SYMBOLS = [...]; // 503 symbols
// Use Yahoo chart API in batches of 50-100 symbols
```

**Component:** `MarketBreadthIndicators`
**Update Frequency:** Every 5 minutes
**Display:** Gauge charts + historical trend

#### 10. Market Heatmap

```typescript
// Fetch top 100-500 stocks by market cap
// GET chart data for all symbols
// Display in treemap:
// - Size: Market cap or volume
// - Color: % change (red to green gradient)
// - Group by: Sector

const HEATMAP_UNIVERSE = {
  'SP500': [...],      // S&P 500 constituents
  'NASDAQ100': [...],  // NASDAQ 100
  'DOW30': [...],      // Dow 30
  'CUSTOM': [...],     // User watchlist
};
```

**Component:** `MarketHeatmap`
**Update Frequency:** Every 2 minutes
**Display:** Interactive treemap (using Recharts or custom D3)

#### 11. News Feed

**Yahoo Finance News API:**
```typescript
// Unofficial endpoint (subject to change):
// GET https://query1.finance.yahoo.com/v1/finance/search
// ?q={symbol}&newsCount=10

// Or use RSS feeds:
// https://feeds.finance.yahoo.com/rss/2.0/headline

// Alternative: Integrate Finnhub or Alpha Vantage news if needed
```

**Component:** `NewsTickerPanel`
**Update Frequency:** Every 10 minutes
**Display:** Scrolling headline ticker or compact list

---

## 🔧 Technical Implementation Specifications

### 1. Layout Container Component

```typescript
// Location: src/components/terminal/TerminalLayout.tsx

'use client';

import { ReactNode, useState } from 'react';
import { TerminalTopBar } from './TerminalTopBar';
import { AICopilotPanel } from './ai-copilot/AICopilotPanel';
import { cn } from '@/lib/utils';

interface TerminalLayoutProps {
  leftColumn: ReactNode;
  centerColumn: ReactNode;
  showCopilot?: boolean;
}

export function TerminalLayout({
  leftColumn,
  centerColumn,
  showCopilot = true,
}: TerminalLayoutProps) {
  const [copilotExpanded, setCopilotExpanded] = useState(true);

  return (
    <div className="h-screen overflow-hidden bg-[#020617]">
      {/* Fixed Top Bar */}
      <TerminalTopBar />

      {/* Main Terminal Grid */}
      <div className="flex h-[calc(100vh-48px)] overflow-hidden">

        {/* Left Column - Scrollable */}
        <div className={cn(
          "flex-shrink-0 overflow-y-auto",
          copilotExpanded ? "w-[30%]" : "w-[35%]",
          "terminal-scrollbar" // Custom scrollbar style
        )}>
          <div className="p-terminal-6 space-y-terminal-6">
            {leftColumn}
          </div>
        </div>

        {/* Center Column - Scrollable */}
        <div className={cn(
          "flex-1 overflow-y-auto",
          "terminal-scrollbar"
        )}>
          <div className="p-terminal-6 space-y-terminal-6">
            {centerColumn}
          </div>
        </div>

        {/* AI Copilot - Fixed, No Scroll */}
        {showCopilot && (
          <AICopilotPanel
            expanded={copilotExpanded}
            onToggle={() => setCopilotExpanded(!copilotExpanded)}
          />
        )}
      </div>
    </div>
  );
}
```

### 2. Terminal Module Card Component

```typescript
// Location: src/components/terminal/TerminalModule.tsx

'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TerminalModuleProps {
  title: string;
  subtitle?: string;
  height?: string;
  className?: string;
  children: ReactNode;
  actions?: ReactNode;
  isLive?: boolean;
}

export function TerminalModule({
  title,
  subtitle,
  height = 'auto',
  className,
  children,
  actions,
  isLive = false,
}: TerminalModuleProps) {
  return (
    <div
      className={cn(
        // Bloomberg-style card
        "rounded-lg border border-white/[0.06] bg-[#0B1121]/80",
        "backdrop-blur-sm shadow-soft",
        "overflow-hidden",
        className
      )}
      style={{ height }}
    >
      {/* Module Header */}
      <div className="flex items-center justify-between px-terminal-4 py-terminal-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          )}
          <h3 className="text-terminal-lg font-semibold text-white">
            {title}
          </h3>
          {subtitle && (
            <span className="text-terminal-xs text-slate-500 ml-2">
              {subtitle}
            </span>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>

      {/* Module Body */}
      <div className="p-terminal-4">
        {children}
      </div>
    </div>
  );
}
```

### 3. Yahoo Finance Data Hook

```typescript
// Location: src/hooks/use-yahoo-realtime.ts

'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

interface YahooQuote {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketTime: number;
}

export function useYahooRealtime(symbols: string[], interval = 15000) {
  return useQuery({
    queryKey: ['yahoo-realtime', symbols.join(',')],
    queryFn: async () => {
      const res = await fetch(`/api/yahoo-proxy/quotes?symbols=${symbols.join(',')}`);
      if (!res.ok) throw new Error('Failed to fetch quotes');
      return res.json() as Promise<YahooQuote[]>;
    },
    refetchInterval: interval,
    staleTime: interval - 1000,
  });
}

export function useYahooChart(
  symbol: string,
  interval: '1m' | '5m' | '15m' | '1d' = '5m',
  range: string = '5d'
) {
  return useQuery({
    queryKey: ['yahoo-chart', symbol, interval, range],
    queryFn: async () => {
      const res = await fetch(
        `/api/yahoo-proxy/chart?symbol=${symbol}&interval=${interval}&range=${range}`
      );
      if (!res.ok) throw new Error('Failed to fetch chart data');
      return res.json();
    },
    staleTime: 60000, // 1 minute
  });
}
```

### 4. Custom Scrollbar Styles

```css
/* Add to globals.css */

.terminal-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(100, 116, 139, 0.3) transparent;
}

.terminal-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.terminal-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.terminal-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(100, 116, 139, 0.3);
  border-radius: 3px;
  transition: background-color 0.2s;
}

.terminal-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(100, 116, 139, 0.5);
}
```

### 5. Responsive Behavior

```typescript
// Location: src/hooks/use-terminal-layout.ts

'use client';

import { useEffect, useState } from 'react';

export type TerminalLayoutMode = 'desktop' | 'compact' | 'mobile';

export function useTerminalLayout() {
  const [mode, setMode] = useState<TerminalLayoutMode>('desktop');
  const [copilotVisible, setCopilotVisible] = useState(true);

  useEffect(() => {
    const updateLayout = () => {
      const width = window.innerWidth;

      if (width >= 1280) {
        setMode('desktop');
        setCopilotVisible(true);
      } else if (width >= 1024) {
        setMode('compact');
        setCopilotVisible(false); // Copilot becomes overlay
      } else {
        setMode('mobile');
        setCopilotVisible(false); // Copilot becomes drawer
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => window.removeEventListener('resize', updateLayout);
  }, []);

  return { mode, copilotVisible, setCopilotVisible };
}
```

---

## 📱 Responsive Behavior Specifications

### Desktop (1280px+)

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP BAR                                 │
├────────────────┬────────────────────────┬───────────────────────┤
│ LEFT (30%)     │ CENTER (40%)           │ AI COPILOT (400px)   │
│ Scrollable     │ Scrollable             │ Fixed, always visible│
└────────────────┴────────────────────────┴───────────────────────┘
```

- Full 3-column layout
- AI Copilot permanently visible on right
- All modules at full size

### Compact Desktop (1024px-1279px)

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP BAR                                 │
├──────────────────────┬──────────────────────────────────────────┤
│ LEFT (40%)           │ CENTER (60%)                             │
│ Scrollable           │ Scrollable                               │
└──────────────────────┴──────────────────────────────────────────┘
                                                  [AI Overlay Button]
```

- 2-column layout (Left + Center)
- AI Copilot becomes slide-over overlay (triggered by button)
- Slightly larger left column to compensate

### Tablet (768px-1023px)

```
┌─────────────────────────────────────────────────────────────────┐
│                         TOP BAR                                 │
├─────────────────────────────────────────────────────────────────┤
│                    SINGLE COLUMN                                │
│                    Scrollable                                   │
│                                                                 │
│  [Tab Bar: Markets | Charts | AI | Portfolio | Screener]       │
│                                                                 │
│  Content for selected tab                                      │
└─────────────────────────────────────────────────────────────────┘
```

- Single column stack
- Horizontal tab navigation
- AI Copilot becomes full tab

### Mobile (<768px)

```
┌──────────────────────────┐
│       TOP BAR            │
├──────────────────────────┤
│                          │
│   Bottom Nav Tabs        │
│                          │
│   Content Stack          │
│   (Vertical scroll)      │
│                          │
│                          │
└──────────────────────────┘
```

- Full vertical stack
- Bottom navigation bar (mobile-first)
- AI Copilot as bottom drawer or full-screen modal
- Simplified modules (collapse to essential info only)

---

## 🎯 Component Development Priority

### Phase 1: Foundation (Week 1)
1. ✅ Terminal layout grid system
2. ✅ TerminalTopBar component
3. ✅ TerminalModule card component
4. ✅ AI Copilot fixed panel structure
5. ✅ Yahoo Finance data hooks
6. ✅ Responsive layout logic

### Phase 2: Left Column (Week 2)
1. IndicesGrid (live Yahoo data)
2. SectorHeatmap (sector ETFs)
3. MarketMoversTable (gainers/losers/active)
4. FuturesTicker (commodities + crypto)
5. ForexGrid (currency pairs)
6. BondYields (treasury yields)

### Phase 3: Center Column (Week 3)
1. NormalizedPerformanceChart (main terminal chart)
2. SectorRotationMap (quadrant visualization)
3. MarketHeatmap (treemap)
4. MarketBreadthIndicators
5. QuickStatsBar

### Phase 4: AI Copilot (Week 4)
1. Chat interface refinement
2. Context panel integration
3. Quick prompts + shortcuts
4. Voice input (optional)
5. Chart snapshot attachments

### Phase 5: Refinement (Week 5)
1. Keyboard shortcuts (Bloomberg-style)
2. Global search (Cmd+K)
3. Theme polish + micro-interactions
4. Performance optimization
5. Mobile responsive polish

---

## ⌨️ Keyboard Shortcuts (Bloomberg-Inspired)

```typescript
// Location: src/hooks/use-terminal-shortcuts.ts

export const TERMINAL_SHORTCUTS = {
  // Navigation
  'CMD+K': 'Open global search',
  'CMD+/': 'Toggle AI Copilot',
  'CMD+1': 'Go to Markets',
  'CMD+2': 'Go to Charts',
  'CMD+3': 'Go to Portfolio',
  'CMD+4': 'Go to Screener',

  // Actions
  'CMD+N': 'New watchlist',
  'CMD+L': 'Add ticker to chart',
  'CMD+W': 'Close current ticker',
  'CMD+F': 'Full screen current module',

  // AI
  'CMD+J': 'Focus AI input',
  'CMD+ENTER': 'Send AI message',
  'ESC': 'Close AI / Cancel',

  // Data
  'CMD+R': 'Refresh all data',
  'CMD+E': 'Export current view',

  // View
  'CMD+B': 'Toggle breadth indicators',
  'CMD+H': 'Toggle heatmap',
};
```

---

## 📦 File Structure

```
src/
├── components/
│   ├── terminal/
│   │   ├── TerminalLayout.tsx          # Main 3-column layout
│   │   ├── TerminalTopBar.tsx          # Fixed top navigation
│   │   ├── TerminalModule.tsx          # Reusable card wrapper
│   │   │
│   │   ├── left-column/
│   │   │   ├── IndicesGrid.tsx
│   │   │   ├── SectorHeatmap.tsx
│   │   │   ├── MarketMoversTable.tsx
│   │   │   ├── FuturesTicker.tsx
│   │   │   ├── ForexGrid.tsx
│   │   │   ├── BondYields.tsx
│   │   │   └── EconomicCalendar.tsx
│   │   │
│   │   ├── center-column/
│   │   │   ├── NormalizedPerformanceChart.tsx
│   │   │   ├── SectorRotationMap.tsx
│   │   │   ├── MarketHeatmap.tsx
│   │   │   ├── MarketBreadthIndicators.tsx
│   │   │   └── QuickStatsBar.tsx
│   │   │
│   │   └── ai-copilot/
│   │       ├── AICopilotPanel.tsx      # Fixed right panel
│   │       ├── ChatMessages.tsx
│   │       ├── ContextPanel.tsx
│   │       ├── QuickPrompts.tsx
│   │       └── CopilotInput.tsx
│   │
│   └── ui/                             # Existing shadcn components
│
├── hooks/
│   ├── use-yahoo-realtime.ts           # Yahoo Finance data hooks
│   ├── use-yahoo-chart.ts
│   ├── use-terminal-layout.ts          # Responsive layout
│   └── use-terminal-shortcuts.ts       # Keyboard shortcuts
│
├── lib/
│   ├── yahoo-finance/
│   │   ├── client.ts                   # Yahoo API client
│   │   ├── types.ts                    # Yahoo data types
│   │   ├── normalize.ts                # Data normalization
│   │   └── cache.ts                    # Caching strategy
│   │
│   └── terminal/
│       ├── config.ts                   # Terminal configuration
│       └── utils.ts                    # Terminal utilities
│
├── app/
│   └── dashboard/
│       └── page.tsx                    # Use TerminalLayout here
│
└── styles/
    └── terminal.css                    # Terminal-specific styles
```

---

## 🎨 Final Visual Identity

### Bloomberg-Style + DeepFin Neon Theme

**Core Characteristics:**
1. **Dense, Information-Rich** - Every pixel shows data
2. **Dark Neon Aesthetic** - Maintains existing brand
3. **Rounded, Glowing Cards** - Softer than Bloomberg's sharp edges
4. **Monospace Numbers** - Professional, tabular data
5. **Subtle Glows** - Neon accents on interactive elements
6. **Micro-Animations** - Smooth, performant transitions

**Color Application:**
- **Background Layers:** `#020617` (deepest) → `#0B1121` (cards)
- **Borders:** `rgba(255, 255, 255, 0.06)` ultra-subtle
- **Positive Data:** Emerald glow (`#10B981` with soft shadow)
- **Negative Data:** Rose glow (`#EF4444` with soft shadow)
- **Neutral/Info:** Indigo glow (`#818CF8`)
- **Accents:** Violet (`#A78BFA`), Cyan (`#06B6D4`)

**Glow Effects:**
```css
/* Positive glow */
.glow-positive {
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

/* Negative glow */
.glow-negative {
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.2);
}

/* Interactive glow */
.glow-interactive:hover {
  box-shadow: 0 0 16px rgba(129, 140, 248, 0.3);
}
```

---

## ✅ Implementation Checklist

### Pre-Development
- [ ] Review and approve this design document
- [ ] Set up Yahoo Finance API proxy endpoints
- [ ] Configure Redis caching for Yahoo data
- [ ] Update Tailwind config with terminal tokens
- [ ] Create base terminal components

### Development Phases
- [ ] **Phase 1:** Layout foundation (3-column grid, top bar, AI panel)
- [ ] **Phase 2:** Left column modules (indices, sectors, movers, etc.)
- [ ] **Phase 3:** Center column modules (chart, heatmap, breadth)
- [ ] **Phase 4:** AI Copilot integration
- [ ] **Phase 5:** Refinement (shortcuts, search, polish)

### Testing
- [ ] Test with live Yahoo Finance data
- [ ] Verify real-time updates (15s intervals)
- [ ] Test responsive behavior (desktop → mobile)
- [ ] Keyboard shortcut functionality
- [ ] Performance profiling (60fps, low memory)
- [ ] Cross-browser compatibility

### Deployment
- [ ] Optimize bundle size
- [ ] Set up CDN for static assets
- [ ] Configure rate limiting for Yahoo API
- [ ] Monitor API usage and costs
- [ ] User feedback and iteration

---

## 📚 Additional Resources

### Yahoo Finance API Documentation
- **Unofficial API Guide:** https://github.com/ranaroussi/yfinance
- **Chart Endpoint:** `https://query1.finance.yahoo.com/v8/finance/chart/{symbol}`
- **Quote Endpoint:** `https://query1.finance.yahoo.com/v6/finance/quote?symbols={symbols}`
- **Screener Endpoint:** `https://query1.finance.yahoo.com/v1/finance/screener`

### Bloomberg Terminal UX References
- **Layout Density:** 12-14px grid, minimal padding
- **Typography:** Monospace for numbers, sans-serif for labels
- **Color:** Orange accents, dark background, high contrast
- **Interaction:** Keyboard-first, rapid navigation

### Design Inspiration
- **Bloomberg Terminal** - Information density
- **Koyfin** - Modern dark theme, clean charts
- **FactSet** - Professional data tables
- **TradingView** - Interactive charting

---

## 🚀 Next Steps

1. **Review this document** with the team
2. **Approve the design direction**
3. **Set up development environment** (Yahoo API, caching)
4. **Begin Phase 1 implementation** (layout foundation)
5. **Iterate based on feedback**

---

**End of Blueprint**

*This document is a living specification. Update as implementation progresses.*

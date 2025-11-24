# Portfolio Management System

A comprehensive portfolio management system with real-time tracking, performance analytics, and advanced visualization.

## Features

### 1. Portfolio Management
- **Multiple Portfolios**: Create and manage multiple portfolios separately
- **Real-time Tracking**: Live price updates for all holdings
- **Transaction History**: Complete buy/sell transaction tracking
- **Cost Basis Calculation**: Automatic weighted average cost basis

### 2. Holdings Dashboard
- Individual holding performance
- Current market value vs cost basis
- Unrealized gain/loss tracking
- Day change monitoring
- Allocation percentage by holding

### 3. Performance Analytics
- **Returns**:
  - Total return ($ and %)
  - Annualized return
  - Time-weighted return
  - Money-weighted return
  
- **Risk Metrics**:
  - Sharpe Ratio
  - Maximum Drawdown
  - Volatility (standard deviation)
  - Win Rate
  - Best/Worst Day
  
- **Benchmark Comparison**:
  - S&P 500 comparison
  - Relative performance
  - Correlation analysis

### 4. Allocation Analysis
- **By Sector**: Technology, Healthcare, Finance, etc.
- **Concentration Metrics**:
  - Top 5 holdings concentration
  - Top 10 holdings concentration
  - Herfindahl Index (diversification)

### 5. Historical Performance
- Interactive line charts
- Portfolio value over time
- Benchmark comparison overlay
- Date range selection
- Cumulative returns

### 6. Snapshot System
- Daily portfolio snapshots
- Historical value tracking
- Performance trend analysis

## Architecture

### Database Schema

```sql
-- Core portfolio table
portfolios (
  id, user_id, name, description, created_at, updated_at
)

-- Holdings with cost basis
holdings (
  id, portfolio_id, ticker, shares, cost_basis, purchase_date, notes
)

-- Transaction log
transactions (
  id, portfolio_id, ticker, type, shares, price, fees, transaction_date, notes
)

-- Daily snapshots for historical tracking
portfolio_snapshots (
  id, portfolio_id, total_value, total_gain_loss, snapshot_date, holdings
)
```

### API Routes

#### Portfolio Management
- `GET /api/portfolio` - List all portfolios
- `POST /api/portfolio` - Create new portfolio
- `GET /api/portfolio/[id]` - Get portfolio details with real-time values
- `PATCH /api/portfolio/[id]` - Update portfolio
- `DELETE /api/portfolio/[id]` - Delete portfolio

#### Transactions
- `GET /api/portfolio/[id]/transactions` - List transactions
- `POST /api/portfolio/[id]/transactions` - Add transaction (buy/sell)

#### Analytics
- `GET /api/portfolio/[id]/performance` - Get performance metrics
- `GET /api/portfolio/[id]/allocation` - Get allocation breakdown

### Components

#### Core Components
- `PortfolioDashboard` - Main portfolio view
- `HoldingsTable` - Detailed holdings table
- `AllocationChart` - Sector allocation pie chart
- `PerformanceChart` - Historical performance line chart

#### Hooks
- `usePortfolio(id)` - Fetch single portfolio
- `usePortfolios()` - Fetch all portfolios
- `usePortfolioRealtime(id)` - Real-time price updates
- `usePortfolioPerformance(id, startDate, endDate)` - Performance data
- `usePortfolioTransactions(id)` - Transaction management

### Service Layer

`PortfolioManager` class provides:
- `calculatePortfolioValue()` - Real-time valuation
- `calculateAllocation()` - Sector/asset allocation
- `calculatePerformance()` - Performance metrics
- `getHistoricalPerformance()` - Chart data
- `addTransaction()` - Transaction processing
- `getRealizedGains()` - Closed position gains
- `createSnapshot()` - Daily snapshot creation

## Usage

### Creating a Portfolio

```typescript
const { createPortfolio } = usePortfolios();

await createPortfolio("Growth Portfolio", "Long-term tech investments");
```

### Adding Transactions

```typescript
const { addTransaction } = usePortfolioTransactions(portfolioId);

await addTransaction({
  ticker: "AAPL",
  type: "buy",
  shares: 100,
  price: 178.50,
  fees: 0,
  transactionDate: new Date().toISOString(),
  notes: "Q4 accumulation"
});
```

### Real-time Updates

```typescript
// Automatically subscribes to price updates for all holdings
const { portfolio } = usePortfolioRealtime(portfolioId);

// Portfolio values update in real-time as market prices change
console.log(portfolio.totalValue); // Updates automatically
```

### Performance Analysis

```typescript
const { chartData, metrics, allocation } = usePortfolioPerformance(
  portfolioId,
  new Date('2024-01-01'),
  new Date()
);

console.log(metrics.sharpeRatio); // 1.45
console.log(metrics.annualizedReturn); // 15.3%
console.log(allocation.bySector); // [{name: "Tech", value: 45000, percentage: 45}]
```

## Calculations

### Sharpe Ratio
```typescript
sharpeRatio = (avgReturn - riskFreeRate) / standardDeviation
```

### Maximum Drawdown
```typescript
maxDrawdown = max((peak - value) / peak)
```

### CAGR (Compound Annual Growth Rate)
```typescript
CAGR = (endValue / startValue) ^ (1 / years) - 1
```

### Herfindahl Index (Concentration)
```typescript
H = sum(allocation_i ^ 2)
// Higher = more concentrated, Lower = more diversified
```

## Real-time Data Flow

1. **WebSocket Connection**: Subscribe to market data for all tickers in portfolio
2. **Price Updates**: Receive real-time price changes
3. **Recalculation**: Automatically recalculate portfolio metrics
4. **UI Update**: React state updates trigger re-render

```typescript
marketData.subscribe(tickers, (updates) => {
  const updatedPortfolio = recalculatePortfolio(portfolio, updates);
  setPortfolio(updatedPortfolio);
});
```

## Performance Optimizations

- **Parallel Fetching**: Fetch all ticker quotes simultaneously
- **Caching**: Cache portfolio snapshots for historical data
- **Incremental Updates**: Only recalculate changed holdings
- **Lazy Loading**: Load performance data only when needed

## Future Enhancements

- [ ] CSV import for bulk transactions
- [ ] Broker integration (Interactive Brokers, TD Ameritrade)
- [ ] Tax lot tracking (FIFO, LIFO, Specific ID)
- [ ] Dividend tracking
- [ ] Options/crypto support
- [ ] Portfolio rebalancing suggestions
- [ ] Risk analysis (VaR, CVaR, Beta, Alpha)
- [ ] Goal tracking (retirement, savings)
- [ ] Multi-currency support
- [ ] Export to Excel/PDF

## Dashboard Navigation

```
/dashboard/portfolio
├── Portfolio Selector (top bar)
├── Summary Cards
│   ├── Total Value
│   ├── Total Gain/Loss
│   ├── Day Change
│   └── Holdings Count
├── Charts Row
│   ├── Allocation Chart (Pie)
│   └── Performance Chart (Line)
└── Holdings Table
    └── Detailed position data
```

## Data Flow

```
User Action → API Route → PortfolioManager → Prisma → Database
                                    ↓
                              Yahoo Finance
                                    ↓
                           Real-time Prices
                                    ↓
                            Update Holdings
                                    ↓
                          Recalculate Metrics
                                    ↓
                             Update UI
```

## Error Handling

- **Missing Data**: Graceful fallbacks for unavailable prices
- **API Failures**: Retry logic with exponential backoff
- **Invalid Transactions**: Validation before database insertion
- **Negative Holdings**: Prevent selling more shares than owned

## Testing

Create test portfolios with:
```typescript
// Test data generation
const testHoldings = [
  { ticker: "AAPL", shares: 100, costBasis: 150 },
  { ticker: "MSFT", shares: 50, costBasis: 300 },
  { ticker: "GOOGL", shares: 25, costBasis: 120 },
];
```

Monitor performance:
```typescript
// Performance benchmarks
- Portfolio calculation: < 100ms for 50 holdings
- Real-time update: < 50ms per ticker
- Historical data load: < 500ms for 1 year
```

## Support

For issues or feature requests, please contact the development team or create an issue in the repository.

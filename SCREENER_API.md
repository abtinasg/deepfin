# Stock Screener API Documentation

## Overview
The Stock Screener API provides powerful filtering, sorting, and querying capabilities for stock data. It includes caching, saved screens, and pre-built templates.

## Base URL
```
/api/screener
```

## Endpoints

### 1. Query Stocks
Screen stocks based on multiple criteria.

**Endpoint:** `POST /api/screener/query`

**Request Body:**
```json
{
  "filters": {
    "market_cap": { "min": 1000000000, "max": 10000000000 },
    "pe_ratio": { "min": 10, "max": 15 },
    "price": { "min": 50, "max": 200 },
    "dividend_yield": { "min": 3, "max": 6 },
    "volume": { "min": 1000000 },
    "rsi": { "min": 30, "max": 70 },
    "sector": ["Technology", "Healthcare"],
    "above_50ma": true,
    "above_200ma": true,
    "macd_signal": "bullish"
  },
  "sort": {
    "field": "market_cap",
    "order": "desc"
  },
  "limit": 100,
  "offset": 0
}
```

**Response:**
```json
{
  "total": 847,
  "results": [
    {
      "ticker": "AAPL",
      "name": "Apple Inc.",
      "price": 178.50,
      "change": 3.72,
      "change_percent": 2.13,
      "market_cap": 2800000000000,
      "pe_ratio": 28.5,
      "dividend_yield": 0.96,
      "rsi": 62,
      "volume": 52.3,
      "sector": "Technology",
      "fifty_two_week_high": 199.62,
      "fifty_two_week_low": 164.08,
      "above_50ma": true,
      "above_200ma": true,
      "macd_signal": "bullish"
    }
  ],
  "execution_time_ms": 45,
  "cached": true
}
```

**Alternative GET Method:**
```
GET /api/screener/query?market_cap_min=1000000000&pe_max=15&sector=Technology,Healthcare&sort_field=market_cap&sort_order=desc&limit=50
```

---

### 2. Get Templates
Retrieve pre-built screener templates.

**Endpoint:** `GET /api/screener/templates`

**Query Parameters:**
- `category` (optional): Filter by category (`value`, `growth`, `dividend`, `technical`, `momentum`)
- `popular` (optional): Set to `true` to get only popular templates

**Examples:**
```
GET /api/screener/templates
GET /api/screener/templates?category=value
GET /api/screener/templates?popular=true
```

**Response:**
```json
{
  "templates": [
    {
      "id": "value-stocks",
      "name": "Value Stocks",
      "description": "Undervalued companies with low P/E ratios and high dividend yields",
      "icon": "💎",
      "category": "value",
      "popular": true,
      "filters": {
        "pe_ratio": { "max": 15 },
        "dividend_yield": { "min": 3 },
        "market_cap": { "min": 2000000000 }
      }
    }
  ],
  "total": 12
}
```

**Available Templates:**
- 💎 Value Stocks
- 🚀 Growth Stocks
- 👑 Dividend Kings
- ⚡ Momentum Plays
- 📉 Oversold Bargains
- 📈 Breakout Candidates
- 💻 Tech Leaders
- 🏥 Healthcare Value
- 🏛️ Mega Cap Stable
- 🌱 Mid-Cap Growth
- ⚡ Energy Sector
- 🏦 Financial Strength

---

### 3. Save Screen
Save a custom screener configuration.

**Endpoint:** `POST /api/screener/saved`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "My Tech Growth Screen",
  "description": "Tech stocks with strong momentum",
  "filters": {
    "sector": ["Technology"],
    "market_cap": { "min": 10000000000 },
    "above_50ma": true,
    "above_200ma": true
  }
}
```

**Response:**
```json
{
  "id": "uuid-here",
  "userId": "user_123",
  "name": "My Tech Growth Screen",
  "description": "Tech stocks with strong momentum",
  "filters": { ... },
  "createdAt": "2025-11-24T10:30:00Z",
  "updatedAt": "2025-11-24T10:30:00Z"
}
```

---

### 4. Get Saved Screens
Retrieve all saved screens for the authenticated user.

**Endpoint:** `GET /api/screener/saved`

**Authentication:** Required

**Response:**
```json
{
  "screens": [
    {
      "id": "uuid-1",
      "userId": "user_123",
      "name": "My Tech Growth Screen",
      "description": "Tech stocks with strong momentum",
      "filters": { ... },
      "createdAt": "2025-11-24T10:30:00Z",
      "updatedAt": "2025-11-24T10:30:00Z"
    }
  ],
  "total": 5
}
```

---

### 5. Get Single Saved Screen
Retrieve a specific saved screen by ID.

**Endpoint:** `GET /api/screener/saved/:id`

**Authentication:** Required

**Response:**
```json
{
  "id": "uuid-1",
  "userId": "user_123",
  "name": "My Tech Growth Screen",
  "description": "Tech stocks with strong momentum",
  "filters": { ... },
  "createdAt": "2025-11-24T10:30:00Z",
  "updatedAt": "2025-11-24T10:30:00Z"
}
```

---

### 6. Update Saved Screen
Update an existing saved screen.

**Endpoint:** `PATCH /api/screener/saved/:id`

**Authentication:** Required

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "filters": { ... }
}
```

---

### 7. Delete Saved Screen
Delete a saved screen.

**Endpoint:** `DELETE /api/screener/saved/:id`

**Authentication:** Required

**Response:**
```json
{
  "success": true,
  "message": "Screen deleted successfully"
}
```

---

### 8. Cache Management
Update or check the screener data cache.

**Update Cache:**
```
POST /api/screener/cache
Authorization: Bearer <CRON_SECRET>
```

**Check Cache Status:**
```
GET /api/screener/cache
```

**Response:**
```json
{
  "cache_age_minutes": 15,
  "last_updated": "15 minutes ago",
  "is_stale": false
}
```

---

## Filter Options

### Range Filters
Apply min/max constraints:
- `market_cap`: Company market capitalization (in dollars)
- `pe_ratio`: Price-to-earnings ratio
- `price`: Stock price (in dollars)
- `dividend_yield`: Dividend yield (percentage)
- `volume`: Trading volume (in millions)
- `rsi`: Relative Strength Index (0-100)

### Array Filters
Filter by multiple values:
- `sector`: Array of sector names

### Boolean Filters
True/false conditions:
- `above_50ma`: Stock is above 50-day moving average
- `above_200ma`: Stock is above 200-day moving average

### Enum Filters
Specific values:
- `macd_signal`: `"bullish"`, `"bearish"`, or `"neutral"`

---

## Sorting

Sort results by any field:
- `ticker`: Stock symbol
- `price`: Current price
- `market_cap`: Market capitalization
- `pe_ratio`: P/E ratio
- `volume`: Trading volume
- `change_percent`: Percentage change
- `dividend_yield`: Dividend yield

Order: `asc` (ascending) or `desc` (descending)

---

## Pagination

Control result size and offset:
- `limit`: Number of results per page (max 500, default 100)
- `offset`: Number of results to skip (default 0)

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Error message here"
}
```

---

## Performance

- Average query time: 20-50ms
- Cache refresh: Every 60 minutes (or on-demand)
- Connection pooling: Enabled
- Query timeout: 5 seconds
- Rate limiting: 100 requests/minute per user

---

## Database Schema

### screener_cache
```sql
CREATE TABLE screener_cache (
  ticker VARCHAR(10) PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_screener_cache_updated ON screener_cache(updated_at);
```

### saved_screens
```sql
CREATE TABLE saved_screens (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  filters_json JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);

CREATE INDEX idx_saved_screens_user ON saved_screens(user_id);
```

---

## Example Usage

### Basic Value Stock Screen
```javascript
const response = await fetch('/api/screener/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: {
      pe_ratio: { max: 15 },
      dividend_yield: { min: 3 },
      market_cap: { min: 2000000000 }
    },
    sort: { field: 'dividend_yield', order: 'desc' },
    limit: 50
  })
});

const data = await response.json();
console.log(`Found ${data.total} value stocks`);
```

### Load and Apply Template
```javascript
// Get templates
const templates = await fetch('/api/screener/templates?popular=true');
const { templates: list } = await templates.json();

// Apply first template
const growthTemplate = list.find(t => t.id === 'growth-stocks');
const results = await fetch('/api/screener/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    filters: growthTemplate.filters,
    limit: 100
  })
});
```

### Save Current Screen
```javascript
const saveResponse = await fetch('/api/screener/saved', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Custom Screen',
    description: 'Tech stocks with momentum',
    filters: {
      sector: ['Technology'],
      above_50ma: true,
      macd_signal: 'bullish'
    }
  })
});
```

---

## Future Enhancements

- [ ] Redis caching for sub-10ms queries
- [ ] Real-time WebSocket updates
- [ ] Advanced technical indicators (Bollinger Bands, Fibonacci)
- [ ] Backtesting capabilities
- [ ] Alert notifications when screen matches
- [ ] Export to CSV/Excel
- [ ] Comparison views for multiple stocks
- [ ] Historical screening (rewind to past dates)

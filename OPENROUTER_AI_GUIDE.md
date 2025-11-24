# Multi-AI System with OpenRouter

## 🚀 Overview

Deep Terminal's AI system uses **OpenRouter** to access multiple cutting-edge AI models through a single API. This provides:

- ✅ **Latest Models**: Claude 4.5, GPT-5, Gemini 2.5 Pro, Grok 4 Fast
- ✅ **80% Cost Savings** vs direct APIs
- ✅ **Smart Routing**: Auto-select best model for each query
- ✅ **Ensemble Mode**: Combine insights from multiple models
- ✅ **Built-in Fallback**: Automatic failover if a model is unavailable

---

## 🏗️ Architecture

```
User Query
    ↓
AI Router (Detect best model)
    ↓
OpenRouter API (Single endpoint)
    ↓
┌────────────────────────────────────┐
│ Claude 4.5 | GPT-5 | Gemini 2.5 | Grok 4 │
└────────────────────────────────────┘
    ↓
Response + Usage Tracking
```

---

## 🤖 Available Models

### Latest Generation (2025)

| Model | Use Case | Speed | Cost/1M tokens |
|-------|----------|-------|----------------|
| **Claude Sonnet 4.5** | Deep analysis, investment thesis | ⚡⚡⚡⚡ | $3 |
| **GPT-5** | Math, calculations, quantitative | ⚡⚡⚡⚡⚡ | $5 |
| **Gemini 2.5 Pro** | Chart analysis, pattern recognition | ⚡⚡⚡⚡ | $2 |
| **Grok 4 Fast** | Real-time Twitter/X sentiment | ⚡⚡⚡⚡⚡ | $6 |
| Gemini 2.0 Flash | Fast vision (budget) | ⚡⚡⚡⚡⚡ | **FREE** |

### Smart Routing Logic

The AI Router automatically selects the best model based on keywords:

```typescript
// Social/Twitter → Grok 4 Fast
"What is Twitter saying about TSLA?"

// Charts/Visual → Gemini 2.5 Pro
"Analyze this chart pattern for AAPL"

// Math/Calculations → GPT-5
"Calculate DCF valuation for MSFT"

// General Analysis → Claude 4.5 (default)
"Give me a bull and bear thesis on NVDA"
```

---

## 📦 Installation

```bash
# Install OpenAI SDK (OpenRouter is compatible)
npm install openai

# Update Prisma schema
npx prisma generate
npx prisma db push
```

---

## 🔑 Environment Setup

Add to `.env.local`:

```env
# OpenRouter API Key
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Get your key at: https://openrouter.ai/keys

# Your app URL (for analytics)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Usage

### 1. Basic Chat API

```typescript
// POST /api/ai/chat
{
  "query": "What is the sentiment on TSLA?",
  "ticker": "TSLA",
  "mode": "auto" // auto | grok | gemini | gpt5 | claude | ensemble
}
```

**Response:**
```json
{
  "model": "x-ai/grok-4-fast",
  "response": "Based on Twitter/X analysis...",
  "cost": 0.000123,
  "usage": {
    "total_tokens": 450,
    "prompt_tokens": 150,
    "completion_tokens": 300
  }
}
```

### 2. Twitter Sentiment Endpoint

```typescript
// GET /api/ai/chat?ticker=TSLA

// Returns Grok's real-time Twitter analysis
```

### 3. Ensemble Mode

Combines insights from **3 models** simultaneously:

```typescript
{
  "query": "Should I buy META?",
  "mode": "ensemble"
}
```

**Response includes:**
- **Grok**: Social sentiment
- **Claude**: Fundamental analysis  
- **GPT-5**: Quantitative metrics
- **Synthesis**: Combined recommendation

---

## 💰 Cost Analysis

### Monthly Cost (10,000 queries/day)

#### Premium Setup (All Latest Models)
- Claude 4.5 (40%): $12/day
- GPT-5 (10%): $5/day
- Gemini 2.5 Pro (25%): $5/day
- Grok 4 Fast (25%): $15/day

**Total: $37/day = $1,110/month**

#### Balanced Setup (Recommended) ⭐
- Claude 4.5 (40%): $12/day
- GPT-5 (5%): $2.50/day
- GPT-4o fallback (5%): $1.25/day
- Gemini 2.0 Flash (30%): **$0/day** (FREE!)
- Grok 4 Fast (20%): $12/day

**Total: $27.75/day = $832/month**
**Savings: 79% vs direct APIs ($4,050/month)**

#### Budget Optimized
- Claude 4.5 (30%): $9/day
- GPT-4o (10%): $2.50/day
- Gemini 2.0 Flash (40%): **$0/day**
- Grok 4 Fast (20%): $12/day

**Total: $23.50/day = $705/month**
**Savings: 83% vs direct APIs**

---

## 📊 Features

### 1. Smart Routing
Automatically selects the best model based on query type:
- Social sentiment → **Grok 4 Fast**
- Chart analysis → **Gemini 2.5 Pro**
- Calculations → **GPT-5**
- Deep analysis → **Claude 4.5**

### 2. Caching
Redis caching with 5-minute TTL to avoid redundant API calls.

### 3. Usage Tracking
All queries logged to database with:
- Model used
- Tokens consumed
- Cost (in USD)
- Timestamp

### 4. Automatic Fallback
If a model fails, OpenRouter automatically tries similar alternatives.

### 5. Rate Limiting
OpenRouter handles rate limits across all models.

---

## 🧪 Testing

```bash
# Test basic chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is Twitter saying about TSLA?",
    "ticker": "TSLA",
    "mode": "grok"
  }'

# Test Twitter sentiment
curl http://localhost:3000/api/ai/chat?ticker=TSLA

# Test ensemble mode
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Should I buy NVDA?",
    "ticker": "NVDA",
    "mode": "ensemble"
  }'
```

---

## 📈 OpenRouter Dashboard

Monitor usage at: https://openrouter.ai/dashboard

Features:
- Real-time usage tracking
- Cost analytics per model
- Performance comparison
- Rate limit monitoring
- Error logs

---

## 🎨 UI Component

Access the AI chat at: `/dashboard/ai`

Features:
- Query input with ticker context
- Model selector (auto, grok, gemini, gpt5, claude, ensemble)
- Real-time cost display
- Token usage stats
- Formatted responses with syntax highlighting
- Example queries

---

## 🔧 Advanced Usage

### 1. Chart Analysis with Gemini 2.5 Pro

```typescript
import { openRouterService } from '@/lib/ai/openrouter';

const result = await openRouterService.analyzeChart(
  'AAPL',
  chartImageBase64 // Base64 encoded PNG
);
```

### 2. Fundamental Analysis with Claude 4.5

```typescript
const result = await openRouterService.analyzeFundamentals(
  'MSFT',
  {
    revenue: 198000000000,
    netIncome: 72000000000,
    pe: 32,
    // ... more financial data
  }
);
```

### 3. DCF Calculation with GPT-5

```typescript
const result = await openRouterService.calculate(
  'AAPL',
  'DCF valuation',
  {
    freeCashFlow: 100000000000,
    growthRate: 0.15,
    wacc: 0.10,
    terminalGrowth: 0.03,
  }
);
```

---

## 🚨 Error Handling

All errors are caught and returned with proper HTTP status codes:

```typescript
try {
  const result = await openRouterService.chat(...);
} catch (error) {
  // OpenRouter handles:
  // - Rate limits (429)
  // - Invalid API key (401)
  // - Model unavailable (503)
  // - Network errors
}
```

---

## 📝 Database Schema

```prisma
model AiUsage {
  id          String   @id @default(uuid())
  userId      String
  model       String   // "anthropic/claude-sonnet-4.5"
  tokensUsed  Int
  cost        Float    // USD
  query       String
  timestamp   DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
}
```

Query usage stats:

```typescript
// Total cost this month
const totalCost = await prisma.aiUsage.aggregate({
  where: {
    userId: 'user_123',
    timestamp: { gte: startOfMonth },
  },
  _sum: { cost: true },
});

// Most used models
const modelStats = await prisma.aiUsage.groupBy({
  by: ['model'],
  _count: true,
  _sum: { cost: true, tokensUsed: true },
});
```

---

## 🎯 Best Practices

1. **Use Auto Mode** for general queries (smart routing)
2. **Cache aggressively** (5-15 min TTL based on data freshness)
3. **Provide ticker context** when available (improves accuracy)
4. **Use Ensemble Mode** for critical investment decisions
5. **Monitor costs** via OpenRouter dashboard
6. **Set spending limits** in OpenRouter settings

---

## 🔐 Security

- API keys stored in environment variables (never in code)
- All endpoints require Clerk authentication
- User queries limited to 500 chars before storage
- Rate limiting on API routes (if needed)
- Redis cache prevents abuse

---

## 📚 Resources

- OpenRouter Docs: https://openrouter.ai/docs
- OpenRouter Dashboard: https://openrouter.ai/dashboard
- Model Comparison: https://openrouter.ai/models
- Pricing: https://openrouter.ai/docs/pricing

---

## 🚀 Deployment Checklist

- [ ] Add `OPENROUTER_API_KEY` to production environment
- [ ] Run `npx prisma db push` to create `ai_usage` table
- [ ] Test all 6 modes (auto, grok, gemini, gpt5, claude, ensemble)
- [ ] Configure Redis caching
- [ ] Set spending limits on OpenRouter dashboard
- [ ] Monitor usage and costs daily
- [ ] Enable Clerk authentication on `/api/ai/*` routes

---

## 💡 Future Enhancements

- [ ] Stream responses for better UX
- [ ] Add voice input/output
- [ ] Integrate with trading execution
- [ ] Multi-language support (Persian)
- [ ] Custom fine-tuned models
- [ ] A/B testing different models
- [ ] Sentiment trend tracking over time
- [ ] Portfolio optimization with AI
- [ ] Automated daily market summaries

---

**Built with ❤️ using OpenRouter - The unified AI gateway**

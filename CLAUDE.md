# CLAUDE.md - AI Assistant Guide for DeepFin

> Comprehensive guide for AI assistants working with the DeepFin codebase

## 🎯 Project Overview

**DeepFin** is a professional market analysis platform combining Bloomberg Terminal-style functionality with AI-powered insights. It's a Next.js 16 application using the App Router architecture with TypeScript, Prisma ORM, and modern React patterns.

**Key Capabilities:**
- Real-time market data tracking and visualization
- AI-powered financial analysis using multiple LLM models (Claude, GPT, Grok, Gemini)
- Portfolio management and tracking
- Advanced stock screening
- Interactive charting with technical indicators
- Watchlists and price alerts
- Chat-based financial assistant

---

## 🏗️ Architecture & Tech Stack

### Core Framework
- **Next.js 16** (App Router) - React framework with server components
- **React 19.2** - Latest React with concurrent features
- **TypeScript 5** - Strict type checking enabled

### Authentication & Authorization
- **Clerk** - Complete auth solution with webhook support
- User profiles stored in Postgres, linked via `clerkUserId`
- Middleware-based route protection

### Database & ORM
- **Neon** - Serverless Postgres database
- **Prisma 6.7** - Type-safe ORM with migrations
- Schema uses snake_case for columns, mapped to camelCase in TypeScript

### State Management
- **TanStack Query (React Query)** - Server state management
- **Zustand** - Client state for market data and UI state
- **React Context** - For AI chat and provider wrappers

### Styling & UI
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Radix-based component library
- **Framer Motion** - Animations and transitions
- Custom design system with HSL color variables

### Data Visualization
- **Lightweight Charts** - TradingView-style financial charts
- **Recharts** - General purpose charts and graphs
- Custom indicator library for technical analysis

### Caching & Performance
- **Upstash Redis** - Fast caching layer with REST API
- Graceful degradation when Redis is unavailable
- Cache-first strategies with TTL

### AI Integration
- **OpenRouter** - Multi-model AI routing
- **Multiple LLMs:**
  - Claude Sonnet 4.5 (deep analysis)
  - GPT-5 (quantitative)
  - GPT-4o (general financial)
  - Grok 4 Fast (Twitter/X sentiment)
  - Gemini 2.5 Pro (technical analysis)
- Usage tracking and cost management

### Market Data
- **Yahoo Finance** - Primary real-time data source
- **Alpha Vantage** - Historical data (optional)
- **Finnhub** - Alternative data source (optional)
- WebSocket manager for real-time updates

---

## 📁 Directory Structure

```
/home/user/deepfin/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── sign-in/             # Sign-in page
│   │   │   ├── sign-up/             # Sign-up page
│   │   │   └── onboarding/          # Post-signup onboarding
│   │   ├── dashboard/                # Protected dashboard routes
│   │   │   ├── ai/                  # AI chat interface
│   │   │   ├── charts/              # Charting tools
│   │   │   ├── markets/             # Market overview
│   │   │   ├── portfolio/           # Portfolio management
│   │   │   └── screener/            # Stock screener
│   │   ├── stock/[ticker]/          # Dynamic stock detail pages
│   │   ├── api/                     # API Routes (see below)
│   │   ├── layout.tsx               # Root layout with ClerkProvider
│   │   └── page.tsx                 # Landing page
│   │
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── ai/                      # AI chat components
│   │   ├── charts/                  # Chart components
│   │   ├── dashboard/               # Dashboard-specific components
│   │   │   └── modules/             # Dashboard module components
│   │   ├── landing/                 # Landing page components
│   │   ├── markets/                 # Market data components
│   │   ├── portfolio/               # Portfolio components
│   │   ├── providers/               # React context providers
│   │   ├── screener/                # Screener components
│   │   ├── shared/                  # Shared/common components
│   │   └── stock/                   # Stock detail components
│   │
│   ├── hooks/                       # Custom React hooks
│   │   ├── use-ai-context.ts        # AI chat context
│   │   ├── use-alerts.ts            # Price alerts
│   │   ├── use-market-data.ts       # Market data fetching
│   │   ├── use-portfolio.ts         # Portfolio operations
│   │   └── use-watchlist.ts         # Watchlist management
│   │
│   ├── lib/                         # Utility libraries
│   │   ├── ai/                      # AI service layer
│   │   │   ├── router.ts            # AI model routing logic
│   │   │   ├── openrouter.ts        # OpenRouter API client
│   │   │   ├── examples.ts          # Example prompts
│   │   │   └── yahoo-data-formatter.ts  # Format data for AI
│   │   ├── indicators/              # Technical indicators
│   │   │   ├── base.ts              # Base indicator class
│   │   │   ├── trend.ts             # Trend indicators
│   │   │   ├── momentum.ts          # Momentum indicators
│   │   │   ├── volatility.ts        # Volatility indicators
│   │   │   └── volume.ts            # Volume indicators
│   │   ├── market-data/             # Market data providers
│   │   │   ├── providers/           # Data provider implementations
│   │   │   ├── websocket-manager.ts # Real-time updates
│   │   │   ├── cache-service.ts     # Caching strategy
│   │   │   └── config.ts            # Data provider config
│   │   ├── prisma.ts                # Prisma client singleton
│   │   ├── redis.ts                 # Redis client & helpers
│   │   └── utils.ts                 # General utilities
│   │
│   ├── stores/                      # Zustand stores
│   │   └── market-store.ts          # Market data global state
│   │
│   ├── types/                       # TypeScript type definitions
│   │   ├── chart.ts                 # Chart-related types
│   │   ├── indicators.ts            # Indicator types
│   │   ├── market-data.ts           # Market data types
│   │   ├── portfolio.ts             # Portfolio types
│   │   └── screener.ts              # Screener types
│   │
│   └── middleware.ts                # Clerk auth middleware
│
├── prisma/
│   └── schema.prisma                # Database schema
│
├── public/                          # Static assets
├── scripts/                         # Utility scripts
│
├── .env.example                     # Environment variable template
├── .husky/                          # Git hooks (pre-commit)
├── .prettierrc                      # Prettier configuration
├── eslint.config.mjs                # ESLint configuration
├── tailwind.config.ts               # Tailwind configuration
├── tsconfig.json                    # TypeScript configuration
└── [FEATURE].md                     # Feature-specific docs
```

### API Routes Structure

```
src/app/api/
├── ai/
│   ├── chat/route.ts                # POST: AI chat completions
│   ├── sessions/route.ts            # GET/POST: Chat sessions
│   └── sessions/[sessionId]/route.ts # GET/DELETE: Session operations
│
├── alerts/                          # Alert management
├── chart/                           # Chart data endpoints
│
├── market/
│   └── [various]/route.ts           # Market data endpoints
│
├── markets/
│   ├── gainers/route.ts             # Top gainers
│   ├── losers/route.ts              # Top losers
│   ├── indices/route.ts             # Market indices
│   └── heatmap/route.ts             # Market heatmap data
│
├── portfolio/
│   ├── route.ts                     # GET/POST: List/create portfolios
│   └── [id]/                        # Portfolio-specific operations
│
├── public/                          # Public (unauthenticated) endpoints
│   └── ticker/route.ts              # Public ticker data
│
├── screener/
│   ├── route.ts                     # GET/POST: Screen stocks
│   ├── cache/route.ts               # Cache management
│   └── saved/route.ts               # Saved screens
│
├── stock/                           # Stock-specific data
│
├── user/
│   └── profile/route.ts             # User profile operations
│
├── watchlist/                       # Watchlist CRUD operations
│
├── webhooks/
│   └── clerk/route.ts               # Clerk webhooks (user.created, etc.)
│
└── yahoo-proxy/                     # Yahoo Finance proxy endpoints
```

---

## 🎨 Key Conventions & Patterns

### TypeScript Conventions

1. **Strict Mode Enabled**
   - All TypeScript strict checks are on
   - No implicit `any` types
   - Null/undefined checks required

2. **Import Aliases**
   - Use `@/*` for src imports
   - Example: `import { prisma } from '@/lib/prisma'`

3. **Type Definitions**
   - Keep types in `/src/types/` directory
   - Export interfaces and types, not classes
   - Use Zod for runtime validation schemas

4. **Naming Conventions**
   - **Files:** kebab-case (`use-market-data.ts`)
   - **Components:** PascalCase (`StockChart.tsx`)
   - **Functions:** camelCase (`fetchMarketData`)
   - **Constants:** UPPER_SNAKE_CASE (`MAX_RETRIES`)
   - **Types/Interfaces:** PascalCase (`PortfolioData`)

### Component Patterns

1. **Server vs Client Components**
   ```typescript
   // Server Component (default)
   // - Can use async/await directly
   // - Can access database/APIs directly
   // - Cannot use hooks or browser APIs

   export default async function StockPage({ params }: { params: { ticker: string } }) {
     const data = await prisma.stock.findUnique({ where: { ticker: params.ticker } });
     return <StockDetail data={data} />;
   }

   // Client Component (add 'use client')
   // - Can use hooks, state, effects
   // - Can use browser APIs
   // - Cannot do direct server-side operations

   'use client';

   export default function StockChart() {
     const [data, setData] = useState<ChartData | null>(null);
     // ... use hooks, event handlers
   }
   ```

2. **Component File Structure**
   ```typescript
   'use client'; // if needed

   import { ... } from '...';

   // Types (local to file)
   interface ComponentProps {
     // ...
   }

   // Main component
   export default function Component({ prop }: ComponentProps) {
     // Hooks at top
     const [state, setState] = useState();
     const queryResult = useQuery(...);

     // Event handlers
     const handleClick = () => { /* ... */ };

     // Render
     return (
       <div>
         {/* JSX */}
       </div>
     );
   }

   // Helper components (if small and local)
   function HelperComponent() {
     // ...
   }
   ```

3. **shadcn/ui Components**
   - Located in `src/components/ui/`
   - Built on Radix UI primitives
   - Styled with Tailwind CSS
   - Use `cn()` utility for className merging
   ```typescript
   import { cn } from '@/lib/utils';

   <Button className={cn('base-classes', conditionalClass && 'extra-class')} />
   ```

### API Route Patterns

1. **Standard Structure**
   ```typescript
   import { auth } from '@clerk/nextjs/server';
   import { NextResponse } from 'next/server';
   import { prisma } from '@/lib/prisma';

   export async function GET(request: Request) {
     try {
       // 1. Authenticate
       const { userId } = await auth();
       if (!userId) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }

       // 2. Parse query params
       const { searchParams } = new URL(request.url);
       const param = searchParams.get('param');

       // 3. Validate input
       if (!param) {
         return NextResponse.json({ error: 'Param required' }, { status: 400 });
       }

       // 4. Fetch data
       const data = await prisma.model.findMany({ where: { userId } });

       // 5. Return response
       return NextResponse.json(data);
     } catch (error) {
       console.error('Error:', error);
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }

   export async function POST(request: Request) {
     try {
       const { userId } = await auth();
       if (!userId) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
       }

       const body = await request.json();
       // ... validate and process

       const result = await prisma.model.create({ data: { userId, ...body } });
       return NextResponse.json(result);
     } catch (error) {
       console.error('Error:', error);
       return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
     }
   }
   ```

2. **Authentication**
   - All protected routes must use `await auth()` from Clerk
   - Public routes should be in `api/public/` or explicitly allowed in middleware
   - Store `clerkUserId` not the internal Clerk session ID

3. **Error Handling**
   - Always use try-catch blocks
   - Log errors with `console.error`
   - Return appropriate HTTP status codes
   - Provide user-friendly error messages

4. **Caching Strategy**
   ```typescript
   import { redis } from '@/lib/redis';

   const cacheKey = `namespace:${id}`;
   const cached = redis ? await redis.get(cacheKey) : null;

   if (cached) {
     return NextResponse.json(JSON.parse(cached as string));
   }

   // Fetch fresh data
   const data = await fetchData();

   // Cache with TTL (in seconds)
   if (redis) {
     await redis.set(cacheKey, JSON.stringify(data), { ex: 300 });
   }

   return NextResponse.json(data);
   ```

### Database Patterns

1. **Prisma Client Usage**
   ```typescript
   import { prisma } from '@/lib/prisma';

   // Always import from the singleton, never create new instance
   ```

2. **Schema Naming**
   - **Table names:** snake_case plural (`user_profiles`, `chat_messages`)
   - **Column names:** snake_case (`clerk_user_id`, `created_at`)
   - **Mapped to camelCase in TypeScript** via `@map()` and `@@map()`
   ```prisma
   model UserProfile {
     clerkUserId String @map("clerk_user_id")
     createdAt   DateTime @default(now()) @map("created_at")

     @@map("user_profiles")
   }
   ```

3. **Relations**
   - Use `onDelete: Cascade` for owned resources
   - Always include indexes for foreign keys
   - Use `include` for eager loading related data
   ```typescript
   const portfolio = await prisma.portfolio.findUnique({
     where: { id },
     include: {
       holdings: true,
       transactions: { orderBy: { transactionDate: 'desc' } },
     },
   });
   ```

4. **Transactions**
   ```typescript
   await prisma.$transaction([
     prisma.holding.create({ data: holdingData }),
     prisma.transaction.create({ data: txData }),
   ]);
   ```

### State Management Patterns

1. **React Query (TanStack Query)**
   - Use for server state (API data)
   - Automatic caching, refetching, and invalidation
   ```typescript
   const { data, isLoading, error } = useQuery({
     queryKey: ['portfolio', portfolioId],
     queryFn: () => fetch(`/api/portfolio/${portfolioId}`).then(r => r.json()),
     staleTime: 60000, // 1 minute
   });
   ```

2. **Zustand Store**
   - Use for client-side global state
   - Example: Market store for real-time data
   ```typescript
   import { create } from 'zustand';

   interface MarketStore {
     prices: Record<string, number>;
     updatePrice: (ticker: string, price: number) => void;
   }

   export const useMarketStore = create<MarketStore>((set) => ({
     prices: {},
     updatePrice: (ticker, price) =>
       set((state) => ({
         prices: { ...state.prices, [ticker]: price },
       })),
   }));
   ```

3. **React Context**
   - Use for component tree state (like AI chat)
   - Wrap in provider component
   ```typescript
   'use client';

   const AiContext = createContext<AiContextType | undefined>(undefined);

   export function AiProvider({ children }: { children: React.ReactNode }) {
     const [messages, setMessages] = useState<Message[]>([]);

     return (
       <AiContext.Provider value={{ messages, setMessages }}>
         {children}
       </AiContext.Provider>
     );
   }

   export function useAiContext() {
     const context = useContext(AiContext);
     if (!context) throw new Error('useAiContext must be used within AiProvider');
     return context;
   }
   ```

### Styling Patterns

1. **Tailwind Utilities**
   - Prefer utility classes over custom CSS
   - Use design system tokens (defined in `tailwind.config.ts`)
   ```typescript
   <div className="bg-surface-1 p-space-4 rounded-lg shadow-soft">
     <h2 className="text-textTone-primary font-semibold text-xl">Title</h2>
     <p className="text-textTone-secondary text-sm">Description</p>
   </div>
   ```

2. **Color System**
   - **Positive/Bull:** `text-positive` or `text-bull`
   - **Negative/Bear:** `text-negative` or `text-bear`
   - **Layers:** `bg-layer-0` through `bg-layer-3` (depth)
   - **Surfaces:** `bg-surface-1` through `bg-surface-3`
   - **Text:** `text-textTone-primary`, `text-textTone-secondary`, `text-textTone-muted`

3. **Responsive Design**
   - Mobile-first approach
   - Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`, `xl:`
   ```typescript
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
   ```

4. **Dark Mode**
   - Using `class` strategy
   - Dark mode variants: `dark:bg-gray-800`
   - Theme toggle managed in root layout

### Custom Hooks Patterns

1. **Data Fetching Hooks**
   ```typescript
   export function useMarketData(ticker: string) {
     return useQuery({
       queryKey: ['market', ticker],
       queryFn: async () => {
         const res = await fetch(`/api/market/${ticker}`);
         if (!res.ok) throw new Error('Failed to fetch');
         return res.json();
       },
       staleTime: 60000, // 1 minute
       refetchInterval: 60000, // refetch every minute
     });
   }
   ```

2. **Mutation Hooks**
   ```typescript
   export function useCreatePortfolio() {
     const queryClient = useQueryClient();

     return useMutation({
       mutationFn: async (data: CreatePortfolioData) => {
         const res = await fetch('/api/portfolio', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(data),
         });
         if (!res.ok) throw new Error('Failed to create');
         return res.json();
       },
       onSuccess: () => {
         // Invalidate and refetch
         queryClient.invalidateQueries({ queryKey: ['portfolios'] });
       },
     });
   }
   ```

---

## 🔧 Development Workflows

### Getting Started

1. **Environment Setup**
   ```bash
   # Copy environment template
   cp .env.example .env.local

   # Fill in required credentials:
   # - Clerk: NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
   # - Database: DATABASE_URL (Neon Postgres)
   # - Redis: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
   # - AI: ANTHROPIC_API_KEY, OPENAI_API_KEY (optional)
   # - Market Data: ALPHA_VANTAGE_API_KEY, FINNHUB_API_KEY (optional)
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Or run migrations (when they exist)
   npx prisma migrate dev

   # Open Prisma Studio to view/edit data
   npm run db:studio
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # Opens at http://localhost:3000
   ```

### Common Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint errors automatically
npm run format           # Format code with Prettier
npm run format:check     # Check if code is formatted
npm run type-check       # Run TypeScript type checking

# Database
npm run db:generate      # Generate Prisma client after schema changes
npm run db:push          # Push schema to database (no migration files)
npm run db:studio        # Open Prisma Studio GUI

# Testing
npm run test:ai          # Test OpenRouter AI integration (./scripts/test-openrouter.sh)
```

### Git Workflow & Commit Conventions

1. **Husky Pre-commit Hooks**
   - Automatically runs on `git commit`
   - Runs `lint-staged` which:
     - Lints and fixes TypeScript files
     - Formats all staged files with Prettier

2. **Commit Message Format**
   - Use conventional commits style:
   ```
   feat: add portfolio performance chart
   fix: resolve WebSocket connection leak
   docs: update API documentation
   refactor: simplify market data caching
   style: format with prettier
   test: add tests for screener API
   chore: update dependencies
   ```

3. **Making Changes**
   ```bash
   # Create feature branch
   git checkout -b feature/your-feature-name

   # Make changes, stage, and commit
   git add .
   git commit -m "feat: your feature description"

   # Pre-commit hook runs automatically (lint + format)

   # Push to remote
   git push origin feature/your-feature-name
   ```

### Adding New Features

1. **New API Endpoint**
   ```typescript
   // 1. Create route file: src/app/api/your-endpoint/route.ts

   import { auth } from '@clerk/nextjs/server';
   import { NextResponse } from 'next/server';
   import { prisma } from '@/lib/prisma';

   export async function GET(request: Request) {
     const { userId } = await auth();
     if (!userId) {
       return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
     }

     // Implementation...

     return NextResponse.json(data);
   }

   // 2. Add types if needed: src/types/your-feature.ts

   // 3. Create custom hook: src/hooks/use-your-feature.ts

   // 4. Use in component
   ```

2. **New Page**
   ```typescript
   // 1. Create page file: src/app/your-route/page.tsx

   export default function YourPage() {
     return <div>Your page content</div>;
   }

   // 2. Add to navigation if needed

   // 3. Update middleware if auth required
   ```

3. **New Component**
   ```typescript
   // 1. Create component: src/components/category/your-component.tsx

   'use client'; // if client component

   interface YourComponentProps {
     // props
   }

   export function YourComponent({ }: YourComponentProps) {
     return <div>Component content</div>;
   }

   // 2. Export from index if you have barrel exports
   ```

4. **New Database Model**
   ```prisma
   // 1. Edit prisma/schema.prisma

   model YourModel {
     id        String   @id @default(uuid())
     userId    String   @map("user_id")
     data      String
     createdAt DateTime @default(now()) @map("created_at")

     user UserProfile @relation(fields: [userId], references: [clerkUserId])

     @@map("your_models")
   }

   // 2. Add relation to UserProfile if needed

   // 3. Run migration
   npm run db:push
   # Or create migration: npx prisma migrate dev --name add_your_model

   // 4. Regenerate client
   npm run db:generate
   ```

### Testing AI Integration

The project includes a test script for the OpenRouter AI integration:

```bash
# Test AI chat with different models
npm run test:ai

# Or directly:
./scripts/test-openrouter.sh
```

This tests:
- API connectivity
- Model routing (auto, grok, claude, etc.)
- Yahoo Finance data integration
- Response formatting

---

## 🤖 AI Assistant Guidelines

### When Working with This Codebase

1. **Always Check Authentication**
   - Verify routes requiring auth use `await auth()` from Clerk
   - Check middleware.ts for protected route patterns
   - Use `clerkUserId` for user references, not internal IDs

2. **Database Operations**
   - Always use the singleton Prisma client from `@/lib/prisma`
   - Follow the snake_case → camelCase mapping pattern
   - Include proper error handling and logging
   - Add indexes for foreign keys and frequently queried fields

3. **API Route Development**
   - Follow the standard structure (see API Route Patterns above)
   - Always validate input before processing
   - Use proper HTTP status codes
   - Implement caching where appropriate (Redis)
   - Return consistent error response format

4. **Type Safety**
   - Define types in `/src/types/` for reusable types
   - Use Zod for runtime validation of external data
   - Don't use `any` unless absolutely necessary
   - Leverage Prisma's generated types for database models

5. **Component Development**
   - Mark client components with `'use client'` when needed
   - Use server components by default for better performance
   - Keep components small and focused
   - Extract shared logic into custom hooks
   - Use TanStack Query for data fetching in client components

6. **Styling**
   - Use Tailwind utility classes
   - Follow the design system (colors, spacing, typography)
   - Use `cn()` utility for conditional classes
   - Ensure responsive design (mobile-first)

7. **Performance Considerations**
   - Implement caching for expensive operations
   - Use Redis for frequently accessed data
   - Leverage React Server Components
   - Optimize database queries with proper includes/selects
   - Use pagination for large datasets

8. **Error Handling**
   - Always wrap async operations in try-catch
   - Log errors with context using console.error
   - Provide user-friendly error messages
   - Handle loading and error states in UI

9. **Real-time Data**
   - Use WebSocket manager for live market data
   - Implement proper connection handling and cleanup
   - Consider polling intervals for less critical data
   - Cache real-time data appropriately (short TTL)

10. **AI Integration Best Practices**
    - Use appropriate model for the task (see OPENROUTER_COMPARISON.md)
    - Always include Yahoo Finance data for stock analysis
    - Format prompts using YahooDataFormatter
    - Track usage and costs in the database
    - Cache AI responses with reasonable TTL
    - Handle rate limits and API errors gracefully

### Common Mistakes to Avoid

❌ **Don't:**
- Create new Prisma client instances (use the singleton)
- Forget to await `auth()` in API routes
- Use client-side hooks in server components
- Access environment variables in client components (use NEXT_PUBLIC_ prefix)
- Commit sensitive data or API keys
- Skip error handling in async operations
- Forget to invalidate queries after mutations
- Use blocking operations without proper loading states

✅ **Do:**
- Use TypeScript strict mode features
- Follow the established patterns in the codebase
- Write descriptive variable and function names
- Add comments for complex logic
- Test with different data scenarios
- Consider edge cases and error states
- Keep components modular and reusable
- Use proper semantic HTML elements

### Code Review Checklist

Before submitting changes, verify:

- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] No console.log statements (use console.error for errors)
- [ ] Proper error handling in place
- [ ] Loading states handled in UI
- [ ] Authentication checked for protected routes
- [ ] Database queries are optimized
- [ ] Types are properly defined
- [ ] Comments added for complex logic
- [ ] Responsive design works on mobile
- [ ] No hardcoded values (use env variables or constants)

---

## 📚 Additional Documentation

The repository includes detailed feature-specific documentation:

- **AUTHENTICATION.md** - Clerk authentication implementation
- **OPENROUTER_AI_GUIDE.md** - AI integration with OpenRouter
- **CHARTING_MODULE.md** - Chart implementation details
- **INDICATORS_LIBRARY.md** - Technical indicators
- **PORTFOLIO_SYSTEM.md** - Portfolio management
- **SCREENER_API.md** - Stock screener functionality
- **REALTIME_MARKET_DATA.md** - WebSocket and real-time data

Refer to these documents for in-depth information about specific features.

---

## 🔐 Security Considerations

1. **Environment Variables**
   - Never commit `.env` or `.env.local`
   - Use `NEXT_PUBLIC_` prefix only for client-safe variables
   - Rotate API keys regularly
   - Use webhook secrets for webhook verification

2. **Authentication**
   - All user data access must verify userId
   - Use Clerk's session management
   - Implement proper RBAC if needed
   - Validate webhook signatures

3. **API Routes**
   - Validate all input data
   - Sanitize user-provided content
   - Use parameterized queries (Prisma handles this)
   - Implement rate limiting where appropriate
   - Never expose internal error details to users

4. **Database**
   - Use Prisma's built-in SQL injection protection
   - Implement proper cascade delete rules
   - Backup database regularly
   - Use transactions for critical operations

---

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Link GitHub repository to Vercel
   - Vercel auto-detects Next.js configuration

2. **Environment Variables**
   - Add all variables from `.env.example` in Vercel dashboard
   - Ensure database URL is for production database
   - Set NODE_ENV=production

3. **Build Settings**
   - Build command: `npm run build`
   - Output directory: `.next`
   - Install command: `npm install`

4. **Database Setup**
   - Run migrations before first deploy
   - Set up Neon production database
   - Configure connection pooling

5. **Deploy**
   - Push to main branch triggers deployment
   - Monitor build logs for errors
   - Test all features in production

---

## 📞 Getting Help

- Check existing documentation files (*.md)
- Review similar implementations in the codebase
- Check Next.js, Prisma, or library-specific docs
- Review commit history for context on changes

---

**Version:** 1.0.0
**Last Updated:** November 24, 2025
**Maintained by:** DeepFin Development Team

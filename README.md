# Deep Terminal

Professional market analysis platform - Bloomberg Terminal meets AI.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Authentication**: Clerk
- **Database**: Neon (Serverless Postgres)
- **ORM**: Prisma
- **Caching**: Upstash Redis
- **Charts**: Lightweight Charts + Recharts
- **State Management**: TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Neon database account
- Clerk account
- Upstash account

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-repo/deepfin.git
cd deepfin
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

4. Update `.env.local` with your credentials:

- Clerk publishable and secret keys
- Neon database URL
- Upstash Redis credentials

5. Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Dashboard pages
│   ├── api/              # API routes
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   └── shared/           # Shared components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
│   ├── prisma.ts         # Prisma client
│   ├── redis.ts          # Redis client
│   ├── market-data.ts    # Market data utilities
│   └── utils.ts          # General utilities
└── middleware.ts         # Clerk middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Prisma Studio

## Features

- **Real-time Market Data**: Live stock quotes and market indices
- **AI-Powered Insights**: Claude AI analysis and recommendations
- **Stock Screener**: Filter stocks by various criteria
- **Advanced Charts**: Technical analysis with TradingView Lightweight Charts
- **Portfolio Tracking**: Manage and track your investments
- **Alerts**: Set price and volume alerts
- **Watchlists**: Create and manage watchlists

## Environment Variables

See `.env.example` for required environment variables.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

## License

MIT

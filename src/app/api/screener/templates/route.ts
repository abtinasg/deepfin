import { NextRequest, NextResponse } from 'next/server';
import { ScreenerTemplate } from '@/types/screener-api';

export const dynamic = 'force-dynamic';

const SCREENER_TEMPLATES: ScreenerTemplate[] = [
  {
    id: 'value-stocks',
    name: 'Value Stocks',
    description: 'Undervalued companies with low P/E ratios and high dividend yields',
    icon: '💎',
    category: 'value',
    popular: true,
    filters: {
      pe_ratio: { max: 15 },
      dividend_yield: { min: 3 },
      market_cap: { min: 2_000_000_000 }, // Mid cap and above
    },
  },
  {
    id: 'growth-stocks',
    name: 'Growth Stocks',
    description: 'High-growth companies with strong momentum',
    icon: '🚀',
    category: 'growth',
    popular: true,
    filters: {
      market_cap: { min: 10_000_000_000 }, // Large cap
      pe_ratio: { min: 20 },
      above_50ma: true,
      above_200ma: true,
    },
  },
  {
    id: 'dividend-kings',
    name: 'Dividend Kings',
    description: 'Reliable dividend payers with consistent payouts',
    icon: '👑',
    category: 'dividend',
    popular: true,
    filters: {
      dividend_yield: { min: 2 },
      market_cap: { min: 10_000_000_000 },
    },
  },
  {
    id: 'momentum-plays',
    name: 'Momentum Plays',
    description: 'Stocks with strong upward price action and technical signals',
    icon: '⚡',
    category: 'momentum',
    popular: true,
    filters: {
      above_50ma: true,
      above_200ma: true,
      macd_signal: 'bullish',
      rsi: { min: 50, max: 70 },
    },
  },
  {
    id: 'oversold-bargains',
    name: 'Oversold Bargains',
    description: 'Potentially undervalued stocks with low RSI',
    icon: '📉',
    category: 'technical',
    popular: false,
    filters: {
      rsi: { max: 30 },
      market_cap: { min: 1_000_000_000 },
    },
  },
  {
    id: 'breakout-candidates',
    name: 'Breakout Candidates',
    description: 'Stocks approaching 52-week highs with high volume',
    icon: '📈',
    category: 'technical',
    popular: false,
    filters: {
      above_200ma: true,
      volume: { min: 30 },
    },
  },
  {
    id: 'tech-leaders',
    name: 'Tech Leaders',
    description: 'Leading technology companies with strong fundamentals',
    icon: '💻',
    category: 'growth',
    popular: true,
    filters: {
      sector: ['Technology'],
      market_cap: { min: 10_000_000_000 },
      above_200ma: true,
    },
  },
  {
    id: 'healthcare-value',
    name: 'Healthcare Value',
    description: 'Undervalued healthcare stocks with dividends',
    icon: '🏥',
    category: 'value',
    popular: false,
    filters: {
      sector: ['Healthcare'],
      pe_ratio: { max: 20 },
      dividend_yield: { min: 1 },
    },
  },
  {
    id: 'mega-cap-stable',
    name: 'Mega Cap Stable',
    description: 'Largest, most stable companies in the market',
    icon: '🏛️',
    category: 'value',
    popular: false,
    filters: {
      market_cap: { min: 200_000_000_000 }, // Mega cap
      dividend_yield: { min: 0.5 },
    },
  },
  {
    id: 'mid-cap-growth',
    name: 'Mid-Cap Growth',
    description: 'Medium-sized companies with high growth potential',
    icon: '🌱',
    category: 'growth',
    popular: false,
    filters: {
      market_cap: { min: 2_000_000_000, max: 10_000_000_000 },
      above_50ma: true,
      macd_signal: 'bullish',
    },
  },
  {
    id: 'energy-sector',
    name: 'Energy Sector',
    description: 'Energy companies with attractive valuations',
    icon: '⚡',
    category: 'value',
    popular: false,
    filters: {
      sector: ['Energy'],
      pe_ratio: { max: 15 },
    },
  },
  {
    id: 'financial-strength',
    name: 'Financial Strength',
    description: 'Strong financial institutions with good dividends',
    icon: '🏦',
    category: 'dividend',
    popular: false,
    filters: {
      sector: ['Finance'],
      dividend_yield: { min: 2 },
      pe_ratio: { max: 15 },
    },
  },
];

// GET - Fetch all screener templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Optional filters
    const category = searchParams.get('category') as ScreenerTemplate['category'] | null;
    const popularOnly = searchParams.get('popular') === 'true';

    let templates = [...SCREENER_TEMPLATES];

    // Filter by category
    if (category) {
      templates = templates.filter((t) => t.category === category);
    }

    // Filter by popularity
    if (popularOnly) {
      templates = templates.filter((t) => t.popular);
    }

    return NextResponse.json({
      templates,
      total: templates.length,
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

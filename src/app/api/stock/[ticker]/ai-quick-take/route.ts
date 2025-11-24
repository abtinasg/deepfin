import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import OpenAI from 'openai';

// Initialize Redis with error handling
let redis: Redis | null = null;
try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    if (url.startsWith('https://') && url.includes('upstash.io')) {
      redis = Redis.fromEnv();
    }
  }
} catch (error) {
  console.warn('Redis initialization failed:', error);
}

const CACHE_TTL = 3600; // 1 hour for AI summaries

const openai = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function GET(
  request: Request,
  context: { params: Promise<{ ticker: string }> }
) {
  try {
    const { ticker: tickerParam } = await context.params;
    const ticker = tickerParam.toUpperCase();
    const cacheKey = `stock:ai:${ticker}`;

    // Try cache first (if Redis is available)
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached);
      }
    }

    // Fetch stock data for context
    const stockResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/stock/${ticker}`
    );
    const stockData = await stockResponse.json();

    // Generate AI summary
    const completion = await openai.chat.completions.create({
      model: 'anthropic/claude-3.5-haiku',
      messages: [
        {
          role: 'user',
          content: `Provide a 2-sentence market summary for ${ticker} (${stockData.name}). Current price: $${stockData.price}, Change: ${stockData.changePercent.toFixed(2)}%. Respond in JSON format: { "summary": "...", "sentiment": "bullish|bearish|neutral", "confidence": 0-100 }`,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || '{}');

    const response = {
      ticker,
      summary: aiResponse.summary || 'Analysis unavailable.',
      sentiment: aiResponse.sentiment || 'neutral',
      confidence: aiResponse.confidence || 50,
      lastUpdate: Date.now(),
    };

    // Cache AI summary for 1 hour (if Redis is available)
    if (redis) {
      await redis.setex(cacheKey, CACHE_TTL, response);
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error generating AI quick take:', error);
    return NextResponse.json(
      { error: 'Failed to generate AI summary' },
      { status: 500 }
    );
  }
}

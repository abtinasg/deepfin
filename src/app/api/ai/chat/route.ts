import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { aiRouter } from '@/lib/ai/router';
import { openRouterService, MODELS } from '@/lib/ai/openrouter';
import { redis } from '@/lib/redis';
import { prisma } from '@/lib/prisma';
import { YahooFinanceService } from '@/lib/yahoo-finance-service';
import { YahooDataFormatter } from '@/lib/ai/yahoo-data-formatter';

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      query, 
      ticker,
      mode = 'auto', // auto | grok | gemini | gpt5 | gpt4 | claude | ensemble
      includeHistorical = false,
      historicalPeriod = '1mo', // 1d, 5d, 1mo, 3mo, 6mo, 1y
      sessionId, // NEW: session ID for storing messages
      context: userContext, // NEW: contextual information from UI
    } = await req.json();

    if (!query) {
      return NextResponse.json({ error: 'Query required' }, { status: 400 });
    }

    // Check cache (skip if we're using session for persistence)
    const cacheKey = `ai:${mode}:${ticker || 'general'}:${includeHistorical}:${query.substring(0, 100)}`;
    const cached = !sessionId && redis ? await redis.get(cacheKey) : null;
    
    if (cached) {
      console.log('Cache hit');
      return NextResponse.json(JSON.parse(cached as string));
    }

    // Prepare prompt with user context if provided
    let finalPrompt = query;
    if (userContext) {
      finalPrompt = `${userContext}\n\nUser Question: ${query}`;
    }
    
    // Prepare Yahoo Finance context
    let yahooContext = undefined;

    if (ticker) {
      try {
        console.log(`📊 Fetching Yahoo Finance data for ${ticker}...`);
        
        // Fetch live Yahoo Finance data
        const yahooQuote = await YahooFinanceService.getQuote(ticker);
        
        // Fetch historical data if requested
        let historical = undefined;
        if (includeHistorical) {
          try {
            historical = await YahooFinanceService.getHistoricalData(ticker, historicalPeriod);
            console.log(`📈 Fetched ${historical?.length || 0} historical data points`);
          } catch (error) {
            console.error('Failed to fetch historical data:', error);
          }
        }

        // Format data into comprehensive prompt
        finalPrompt = YahooDataFormatter.createComprehensivePrompt({
          symbol: ticker,
          quote: {
            symbol: yahooQuote.symbol,
            regularMarketPrice: yahooQuote.regularMarketPrice,
            regularMarketChange: yahooQuote.regularMarketChange,
            regularMarketChangePercent: yahooQuote.regularMarketChangePercent,
            regularMarketVolume: yahooQuote.regularMarketVolume,
            regularMarketOpen: yahooQuote.regularMarketOpen,
            regularMarketDayHigh: yahooQuote.regularMarketDayHigh,
            regularMarketDayLow: yahooQuote.regularMarketDayLow,
            regularMarketPreviousClose: yahooQuote.regularMarketPreviousClose,
          },
          historical,
          historicalPeriod,
          userQuery: query,
        });

        console.log(`✅ Yahoo Finance data formatted (${finalPrompt.length} chars)`);

        // Also set context for routing (backward compatibility)
        yahooContext = {
          ticker,
          price: yahooQuote.regularMarketPrice,
          change: yahooQuote.regularMarketChangePercent,
          marketCap: 0,
        };
      } catch (error) {
        console.error('Failed to fetch Yahoo Finance data:', error);
        // Continue without Yahoo data
      }
    }

    // Save user message to session if sessionId provided
    // TODO: Uncomment after running prisma migrate
    // if (sessionId) {
    //   try {
    //     await prisma.chatMessage.create({
    //       data: {
    //         sessionId,
    //         role: 'user',
    //         content: query,
    //       },
    //     });

    //     // Update session timestamp
    //     await prisma.chatSession.update({
    //       where: { id: sessionId },
    //       data: { updatedAt: new Date() },
    //     });
    //   } catch (error) {
    //     console.error('Failed to save user message:', error);
    //   }
    // }

    // Route to model
    let result;

    const systemPrompt = ticker 
      ? 'Use ONLY the live Yahoo Finance data provided in the user message. Do not use your own knowledge or outdated information. Base ALL analysis strictly on the data provided. If data is missing, state "Data not available" instead of guessing.'
      : 'You are a financial AI assistant. Be concise, accurate, and actionable. Provide specific insights based on the context provided.';

    switch(mode) {
      case 'grok':
        result = await openRouterService.chat(
          MODELS.GROK_4_FAST,
          [{
            role: 'system',
            content: `You are Grok with real-time Twitter/X access. ${systemPrompt}`
          }, {
            role: 'user',
            content: finalPrompt
          }]
        );
        break;

      case 'gemini':
        result = await openRouterService.chat(
          MODELS.GEMINI_2_5_PRO,
          [{
            role: 'system',
            content: `You are an expert technical analyst. ${systemPrompt}`
          }, {
            role: 'user',
            content: finalPrompt
          }]
        );
        break;

      case 'gpt5':
        result = await openRouterService.chat(
          MODELS.GPT5,
          [{
            role: 'system',
            content: `You are a quantitative analyst. ${systemPrompt} Provide precise calculations.`
          }, {
            role: 'user',
            content: finalPrompt
          }]
        );
        break;

      case 'gpt4':
        result = await openRouterService.chat(
          MODELS.GPT4O,
          [{
            role: 'system',
            content: `You are a financial analyst. ${systemPrompt}`
          }, {
            role: 'user',
            content: finalPrompt
          }]
        );
        break;

      case 'claude':
        result = await openRouterService.chat(
          MODELS.CLAUDE_SONNET_4_5,
          [{
            role: 'system',
            content: `You are an investment analyst. ${systemPrompt} Provide deep, reasoned analysis.`
          }, {
            role: 'user',
            content: finalPrompt
          }]
        );
        break;

      case 'ensemble':
        result = await aiRouter.ensemble(finalPrompt, yahooContext);
        break;

      case 'auto':
      default:
        result = await aiRouter.route(finalPrompt, yahooContext);
        break;
    }

    // Save assistant response to session if sessionId provided
    // TODO: Uncomment after running prisma migrate
    // if (sessionId) {
    //   try {
    //     await prisma.chatMessage.create({
    //       data: {
    //         sessionId,
    //         role: 'assistant',
    //         content: result.response || (result as any).synthesis || '',
    //         model: result.model,
    //         tokensUsed: result.usage?.total_tokens || 0,
    //         cost: result.cost || 0,
    //       },
    //     });
    //   } catch (error) {
    //     console.error('Failed to save assistant message:', error);
    //   }
    // }

    // Track usage in database
    try {
      await prisma.aiUsage.create({
        data: {
          userId,
          model: result.model,
          tokensUsed: result.usage?.total_tokens || 0,
          cost: result.cost || 0,
          query: query.substring(0, 500),
          timestamp: new Date(),
        },
      });
    } catch (dbError) {
      console.error('Failed to track usage:', dbError);
    }

    // Cache for 3 minutes (shorter since it's live data)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(result), { ex: 180 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI Chat error:', error);
    return NextResponse.json(
      { error: error?.message || 'AI request failed' },
      { status: 500 }
    );
  }
}

// Dedicated Twitter sentiment endpoint with Yahoo data
export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json({ error: 'Ticker required' }, { status: 400 });
  }

  try {
    // Check cache
    const cacheKey = `twitter:sentiment:${ticker}`;
    const cached = redis ? await redis.get(cacheKey) : null;
    
    if (cached) {
      return NextResponse.json(JSON.parse(cached as string));
    }

    // Fetch Yahoo Finance data for context
    let yahooData = '';
    try {
      const yahooQuote = await YahooFinanceService.getQuote(ticker);
      yahooData = YahooDataFormatter.formatQuoteData({
        symbol: yahooQuote.symbol,
        regularMarketPrice: yahooQuote.regularMarketPrice,
        regularMarketChange: yahooQuote.regularMarketChange,
        regularMarketChangePercent: yahooQuote.regularMarketChangePercent,
        regularMarketVolume: yahooQuote.regularMarketVolume,
        regularMarketOpen: yahooQuote.regularMarketOpen,
        regularMarketDayHigh: yahooQuote.regularMarketDayHigh,
        regularMarketDayLow: yahooQuote.regularMarketDayLow,
        regularMarketPreviousClose: yahooQuote.regularMarketPreviousClose,
      });
    } catch (error) {
      console.error('Failed to fetch Yahoo data:', error);
    }

    // Enhanced prompt with Yahoo data
    const enhancedPrompt = yahooData 
      ? `${yahooData}\n\n───────────────────────────────────────────────────────────\n\nAnalyze real-time Twitter/X sentiment for ${ticker} considering the live Yahoo Finance data above.`
      : `Analyze real-time Twitter/X sentiment for ${ticker}.`;

    const sentiment = await openRouterService.chat(
      MODELS.GROK_4_FAST,
      [{
        role: 'system',
        content: 'You are Grok with real-time Twitter/X access. If Yahoo Finance data is provided, use it as context. Provide comprehensive social sentiment analysis.'
      }, {
        role: 'user',
        content: enhancedPrompt
      }]
    );

    // Cache for 10 minutes (sentiment changes frequently)
    if (redis) {
      await redis.set(cacheKey, JSON.stringify(sentiment), { ex: 600 });
    }

    return NextResponse.json(sentiment);
  } catch (error: any) {
    console.error('Twitter sentiment error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch Twitter sentiment' },
      { status: 500 }
    );
  }
}

import OpenAI from 'openai';

const openrouter = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    'X-Title': 'Deep Terminal',
  },
});

// Available models on OpenRouter (Latest 2025!)
export const MODELS = {
  // ⭐ Claude Sonnet 4.5 (NEWEST - Best reasoning & analysis)
  CLAUDE_SONNET_4_5: 'anthropic/claude-sonnet-4.5',
  CLAUDE_SONNET_3_5: 'anthropic/claude-3.5-sonnet',
  CLAUDE_OPUS: 'anthropic/claude-3-opus',
  
  // ⭐ GPT-5 (NEWEST - Next generation!)
  GPT5: 'openai/gpt-5',
  GPT4O: 'openai/gpt-4o',
  GPT4_TURBO: 'openai/gpt-4-turbo',
  
  // ⭐ Gemini 2.5 Pro (NEWEST - Most advanced multimodal)
  GEMINI_2_5_PRO: 'google/gemini-2.5-pro',
  GEMINI_2_FLASH: 'google/gemini-2.0-flash-exp:free',
  GEMINI_FLASH_1_5: 'google/gemini-flash-1.5',
  
  // ⭐ Grok 4 Fast (NEWEST - Fastest Twitter/X access)
  GROK_4_FAST: 'x-ai/grok-4-fast',
  GROK_2: 'x-ai/grok-2-1212',
  
  // Budget options
  GPT35_TURBO: 'openai/gpt-3.5-turbo',
  LLAMA_3_70B: 'meta-llama/llama-3-70b-instruct',
  LLAMA_3_1_405B: 'meta-llama/llama-3.1-405b-instruct',
  MIXTRAL_8X7B: 'mistralai/mixtral-8x7b-instruct',
} as const;

export type ModelType = typeof MODELS[keyof typeof MODELS];

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | Array<{ type: string; text?: string; image_url?: any }>;
}

interface ChatOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  route?: 'fallback';
}

interface ChatResponse {
  model: string;
  response: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  cost: number;
}

export class OpenRouterService {
  /**
   * Chat with any model
   */
  async chat(
    model: ModelType,
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<ChatResponse> {
    try {
      const completion = await openrouter.chat.completions.create({
        model,
        messages: messages as any,
        temperature: options?.temperature ?? 0.7,
        max_tokens: options?.max_tokens ?? 2000,
        top_p: options?.top_p,
        route: options?.route,
      } as any);

      return {
        model,
        response: completion.choices[0]?.message?.content || '',
        usage: completion.usage as any,
        cost: this.calculateCost(model, completion.usage as any),
      };
    } catch (error: any) {
      console.error(`OpenRouter error with ${model}:`, error?.message || error);
      throw error;
    }
  }

  /**
   * Get Twitter sentiment with Grok 4 Fast (Fastest!)
   */
  async getTwitterSentiment(ticker: string): Promise<ChatResponse> {
    const prompt = `Analyze real-time Twitter/X sentiment for $${ticker}.

You have direct access to X platform data. Provide comprehensive analysis:

1. **Sentiment Score**: 0-10 (10=extremely bullish)
2. **Volume Metrics**: 
   - Mentions (24h)
   - % change vs 7-day avg
   - Peak mention times
3. **Sentiment Breakdown**:
   - Positive: X%
   - Neutral: Y%
   - Negative: Z%
4. **Top 5 Topics**: Trending hashtags/themes with context
5. **Notable Posts**: 3-5 high-engagement examples with metrics
6. **Retail Mood**: Detailed (FOMO/Fear/Neutral/Greed/Panic/Euphoria)
7. **Meme Stock Analysis**: 
   - Risk level (0-100%)
   - Key indicators
   - Comparison to GME/AMC patterns
8. **Influencer Activity**: Notable accounts discussing
9. **Key Insight**: Executive summary (2-3 sentences)

Format as structured JSON for parsing.`;

    return this.chat(MODELS.GROK_4_FAST, [
      {
        role: 'system',
        content: 'You are Grok 4 Fast with real-time X/Twitter access. Provide rapid, accurate social sentiment analysis for stocks. Focus on actionable insights.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]);
  }

  /**
   * Analyze chart with Gemini 2.5 Pro (Most advanced vision!)
   */
  async analyzeChart(ticker: string, chartImageBase64: string): Promise<ChatResponse> {
    const prompt = `Comprehensive technical analysis for ${ticker} chart.

Analyze in detail:

1. **Trend Analysis**:
   - Primary trend (bullish/bearish/sideways)
   - Secondary trends
   - Trend strength (1-10)

2. **Key Levels**:
   - Support levels (with prices)
   - Resistance levels (with prices)
   - Psychological levels

3. **Chart Patterns**:
   - Current patterns forming
   - Completed patterns
   - Confidence levels

4. **Volume Analysis**:
   - Volume trend
   - Volume-price divergence
   - Institutional vs retail signals

5. **Technical Indicators** (if visible):
   - RSI, MACD, Moving Averages
   - Interpretation

6. **Price Targets**:
   - Upside targets (with probabilities)
   - Downside targets (stop levels)
   - Timeframe estimates

7. **Trade Setup**:
   - Entry points
   - Stop loss levels
   - Risk/reward ratio

Be specific with exact price levels.`;

    return this.chat(MODELS.GEMINI_2_5_PRO, [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${chartImageBase64}`
            }
          }
        ] as any
      }
    ]);
  }

  /**
   * Deep fundamental analysis with Claude Sonnet 4.5 (Best reasoning!)
   */
  async analyzeFundamentals(ticker: string, data: any): Promise<ChatResponse> {
    const prompt = `Conduct comprehensive fundamental analysis for ${ticker}:

Financial Data:
${JSON.stringify(data, null, 2)}

Provide detailed analysis:

1. **Valuation Assessment**:
   - Current valuation (cheap/fair/expensive)
   - P/E analysis vs peers
   - DCF fair value estimate
   - Multiple-based valuation

2. **Business Quality** (0-10 scores):
   - Competitive moat
   - Management quality
   - Business model sustainability
   - Industry positioning

3. **Financial Health**:
   - Balance sheet strength
   - Cash flow quality
   - Debt management
   - Capital allocation

4. **Growth Prospects**:
   - Revenue growth drivers
   - Margin expansion potential
   - Market opportunity size
   - Competitive advantages

5. **Key Strengths** (Top 3 with evidence)

6. **Key Concerns** (Top 3 with evidence)

7. **Risk Factors**:
   - Business risks
   - Financial risks
   - Industry risks
   - Macro risks

8. **Investment Thesis**:
   - Bull case (3-4 sentences)
   - Bear case (3-4 sentences)
   - Base case (your view)

Be specific, data-driven, and balanced. DO NOT give buy/sell advice directly.`;

    return this.chat(MODELS.CLAUDE_SONNET_4_5, [
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.5,
      max_tokens: 3000,
    });
  }

  /**
   * Precise calculations with GPT-5 (Next generation!)
   */
  async calculate(ticker: string, calculation: string, data: any): Promise<ChatResponse> {
    const prompt = `Perform ${calculation} for ${ticker}:

Available Data:
${JSON.stringify(data, null, 2)}

Provide comprehensive calculation:

1. **Formula**:
   - Mathematical formula
   - Variable definitions
   - Assumptions stated

2. **Step-by-Step Calculation**:
   - Show each step
   - Intermediate results
   - Clear progression

3. **Final Result**:
   - Numerical answer
   - Units specified
   - Confidence level

4. **Sensitivity Analysis**:
   - Key variable impacts
   - Range of outcomes
   - Best/worst case scenarios

5. **Interpretation**:
   - What this means
   - Context vs peers
   - Actionable insights

6. **Limitations**:
   - Model limitations
   - Data quality issues
   - Alternative approaches

Be mathematically rigorous and precise.`;

    return this.chat(MODELS.GPT5, [
      {
        role: 'user',
        content: prompt
      }
    ], {
      temperature: 0.3,
    });
  }

  /**
   * Calculate cost based on usage (NEWEST MODELS 2025!)
   */
  private calculateCost(model: string, usage: any): number {
    if (!usage) return 0;

    // OpenRouter pricing (per 1M tokens) - Updated 2025
    const pricing: Record<string, { input: number; output: number }> = {
      // Claude 4.5 (Latest!)
      [MODELS.CLAUDE_SONNET_4_5]: { input: 3, output: 15 },
      [MODELS.CLAUDE_SONNET_3_5]: { input: 3, output: 15 },
      [MODELS.CLAUDE_OPUS]: { input: 15, output: 75 },
      
      // GPT-5 (Next Generation!)
      [MODELS.GPT5]: { input: 5, output: 15 },
      [MODELS.GPT4O]: { input: 2.5, output: 10 },
      [MODELS.GPT4_TURBO]: { input: 10, output: 30 },
      
      // Gemini 2.5 Pro (Latest!)
      [MODELS.GEMINI_2_5_PRO]: { input: 2, output: 6 },
      [MODELS.GEMINI_2_FLASH]: { input: 0, output: 0 }, // FREE!
      [MODELS.GEMINI_FLASH_1_5]: { input: 0.5, output: 1.5 },
      
      // Grok 4 Fast (Fastest!)
      [MODELS.GROK_4_FAST]: { input: 6, output: 18 },
      [MODELS.GROK_2]: { input: 5, output: 15 },
      
      // Budget options
      [MODELS.GPT35_TURBO]: { input: 0.5, output: 1.5 },
      [MODELS.LLAMA_3_70B]: { input: 0.7, output: 0.9 },
      [MODELS.LLAMA_3_1_405B]: { input: 3, output: 3 },
      [MODELS.MIXTRAL_8X7B]: { input: 0.3, output: 0.3 },
    };

    const price = pricing[model] || { input: 1, output: 3 };

    const inputCost = ((usage.prompt_tokens || 0) / 1_000_000) * price.input;
    const outputCost = ((usage.completion_tokens || 0) / 1_000_000) * price.output;

    return inputCost + outputCost;
  }
}

export const openRouterService = new OpenRouterService();

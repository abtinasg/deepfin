import { openRouterService, MODELS, ModelType } from './openrouter';

interface RouteContext {
  ticker?: string;
  price?: number;
  change?: number;
  pe?: number;
  marketCap?: number;
  recentNews?: string;
}

export class AIRouter {
  /**
   * Auto-route to best model based on query
   */
  async route(query: string, context?: RouteContext) {
    const model = this.selectModel(query);
    
    console.log(`🤖 Routing to: ${model}`);

    const messages = [
      {
        role: 'system' as const,
        content: this.getSystemPrompt(model)
      },
      {
        role: 'user' as const,
        content: this.buildPrompt(query, context)
      }
    ];

    return openRouterService.chat(model, messages);
  }

  /**
   * Select best model for query (USING ABSOLUTE LATEST MODELS!)
   */
  private selectModel(query: string): ModelType {
    const q = query.toLowerCase();

    // Grok 4 Fast: Social/Twitter keywords
    if (this.hasKeywords(q, [
      'twitter', 'social', 'sentiment', 'meme', 'reddit',
      'retail', 'wsb', 'buzz', 'trending', 'discussion',
      'x.com', 'tweet', 'viral', 'elon'
    ])) {
      return MODELS.GROK_4_FAST; // 🔥🔥 Latest Grok - Ultra Fast!
    }

    // Gemini 2.5 Pro: Visual/Chart keywords + Complex multimodal
    if (this.hasKeywords(q, [
      'chart', 'pattern', 'technical', 'image', 'graph',
      'support', 'resistance', 'breakout', 'visual', 'analyze image',
      'candlestick', 'trend line', 'fibonacci'
    ])) {
      return MODELS.GEMINI_2_5_PRO; // 🔥🔥 Latest Gemini - Most capable vision
    }

    // GPT-5: Math/Code/Complex reasoning keywords
    if (this.hasKeywords(q, [
      'calculate', 'compute', 'formula', 'dcf', 'intrinsic',
      'valuation', 'math', 'code', 'algorithm', 'optimize',
      'quantitative', 'statistical', 'model'
    ])) {
      return MODELS.GPT5; // 🔥🔥 Latest GPT - Next generation!
    }

    // Claude Sonnet 4.5: Default (reasoning, analysis, conversational)
    // Best for general investment analysis, explanations, thesis generation
    return MODELS.CLAUDE_SONNET_4_5; // 🔥 Latest Claude
  }

  private hasKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(kw => text.includes(kw));
  }

  private getSystemPrompt(model: string): string {
    if (model === MODELS.GROK_4_FAST || model === MODELS.GROK_2) {
      return 'You are Grok with real-time Twitter/X access. Analyze social sentiment for stocks with precision and wit.';
    }
    
    if (model === MODELS.GEMINI_2_5_PRO || model === MODELS.GEMINI_2_FLASH) {
      return 'You are an expert technical analyst specialized in reading charts and identifying patterns with precision.';
    }
    
    if (model === MODELS.GPT5 || model === MODELS.GPT4O || model === MODELS.GPT4_TURBO) {
      return 'You are a quantitative financial analyst specialized in precise calculations and data-driven analysis.';
    }
    
    // Claude (default)
    return 'You are a knowledgeable investment analyst with deep financial expertise. Provide thoughtful, balanced analysis with specific data points. Never give direct buy/sell advice.';
  }

  public buildPrompt(query: string, context?: RouteContext): string {
    if (!context || !context.ticker) return query;

    return `Context about ${context.ticker}:
- Current Price: $${context.price?.toFixed(2)}
- Change: ${context.change?.toFixed(2)}%
- P/E Ratio: ${context.pe || 'N/A'}
- Market Cap: $${context.marketCap?.toFixed(2)}B
${context.recentNews ? `- Recent News: ${context.recentNews}` : ''}

User Question: ${query}

Provide a helpful, data-driven response with specific insights.`;
  }

  /**
   * Ensemble: Use multiple models and synthesize
   */
  async ensemble(query: string, context?: RouteContext) {
    console.log('🎯 Ensemble mode: Using multiple models');

    // Use 3 different models for different perspectives
    const [grokResult, claudeResult, gpt5Result] = await Promise.allSettled([
      openRouterService.chat(MODELS.GROK_4_FAST, [{ role: 'user', content: query }]),
      openRouterService.chat(MODELS.CLAUDE_SONNET_4_5, [{ role: 'user', content: query }]),
      openRouterService.chat(MODELS.GPT5, [{ role: 'user', content: query }]),
    ]);

    const responses = {
      grok: grokResult.status === 'fulfilled' ? grokResult.value.response : null,
      claude: claudeResult.status === 'fulfilled' ? claudeResult.value.response : null,
      gpt5: gpt5Result.status === 'fulfilled' ? gpt5Result.value.response : null,
    };

    // Synthesize with Claude
    const synthesis = await openRouterService.chat(
      MODELS.CLAUDE_SONNET_4_5,
      [{
        role: 'user',
        content: `Synthesize these AI perspectives into one coherent answer:

**Grok 4 Fast (Social/Real-time)**: ${responses.grok || 'Not available'}

**Claude Sonnet 4.5 (Analysis)**: ${responses.claude || 'Not available'}

**GPT-5 (Quantitative)**: ${responses.gpt5 || 'Not available'}

Provide:
1. **Consensus**: Common themes across all models
2. **Divergence**: Unique insights from each perspective
3. **Synthesis**: Your balanced final take combining strengths

Keep concise and actionable.`
      }]
    );

    return {
      model: 'ensemble',
      individual: responses,
      synthesis: synthesis.response,
      totalCost: 
        (grokResult.status === 'fulfilled' ? grokResult.value.cost : 0) +
        (claudeResult.status === 'fulfilled' ? claudeResult.value.cost : 0) +
        (gpt5Result.status === 'fulfilled' ? gpt5Result.value.cost : 0) +
        synthesis.cost,
      response: synthesis.response, // For compatibility
      usage: synthesis.usage,
      cost: (grokResult.status === 'fulfilled' ? grokResult.value.cost : 0) +
        (claudeResult.status === 'fulfilled' ? claudeResult.value.cost : 0) +
        (gpt5Result.status === 'fulfilled' ? gpt5Result.value.cost : 0) +
        synthesis.cost,
    };
  }
}

export const aiRouter = new AIRouter();

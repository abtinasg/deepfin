/**
 * OpenRouter AI System - Usage Examples
 * 
 * This file demonstrates all the ways to use the Multi-AI system
 */

import { openRouterService, MODELS } from '@/lib/ai/openrouter';
import { aiRouter } from '@/lib/ai/router';

// ============================================================================
// Example 1: Basic Chat with Auto-Routing
// ============================================================================

export async function example1_AutoRouting() {
  console.log('📝 Example 1: Auto-Routing');
  
  const result = await aiRouter.route(
    'What is the sentiment on Tesla stock?',
    {
      ticker: 'TSLA',
      price: 245.50,
      change: 2.3,
      marketCap: 780.5,
    }
  );

  console.log('Model used:', result.model);
  // Expected: x-ai/grok-4-fast (because "sentiment" keyword)
  
  console.log('Response:', result.response);
  console.log('Cost:', `$${result.cost.toFixed(6)}`);
  console.log('Tokens:', result.usage?.total_tokens);
}

// ============================================================================
// Example 2: Specific Model - Grok for Twitter Sentiment
// ============================================================================

export async function example2_TwitterSentiment() {
  console.log('🐦 Example 2: Twitter Sentiment with Grok');
  
  const result = await openRouterService.getTwitterSentiment('AAPL');

  console.log('Model:', result.model); // x-ai/grok-4-fast
  console.log('Twitter Analysis:', result.response);
  console.log('Cost:', `$${result.cost.toFixed(6)}`);
}

// ============================================================================
// Example 3: Chart Analysis with Gemini 2.5 Pro
// ============================================================================

export async function example3_ChartAnalysis() {
  console.log('📊 Example 3: Chart Analysis with Gemini');
  
  // Convert chart canvas to base64
  const canvas = document.querySelector('canvas') as HTMLCanvasElement;
  const base64Image = canvas.toDataURL('image/png').split(',')[1];

  const result = await openRouterService.analyzeChart('NVDA', base64Image);

  console.log('Model:', result.model); // google/gemini-2.5-pro
  console.log('Chart Analysis:', result.response);
  console.log('Cost:', `$${result.cost.toFixed(6)}`);
}

// ============================================================================
// Example 4: Fundamental Analysis with Claude 4.5
// ============================================================================

export async function example4_FundamentalAnalysis() {
  console.log('🧠 Example 4: Fundamental Analysis with Claude');

  const financialData = {
    ticker: 'MSFT',
    revenue: 211915000000, // Annual revenue
    netIncome: 72361000000, // Net income
    totalAssets: 411976000000,
    totalLiabilities: 198298000000,
    freeCashFlow: 56118000000,
    pe: 35.5,
    priceToBook: 12.8,
    debtToEquity: 0.48,
    roe: 0.42,
    quarterlyRevenueGrowth: 0.16,
  };

  const result = await openRouterService.analyzeFundamentals(
    'MSFT',
    financialData
  );

  console.log('Model:', result.model); // anthropic/claude-sonnet-4.5
  console.log('Analysis:', result.response);
  console.log('Cost:', `$${result.cost.toFixed(6)}`);
}

// ============================================================================
// Example 5: DCF Calculation with GPT-5
// ============================================================================

export async function example5_DCFCalculation() {
  console.log('🧮 Example 5: DCF Calculation with GPT-5');

  const dcfData = {
    ticker: 'AAPL',
    currentFreeCashFlow: 99584000000,
    projectedGrowthRates: [0.12, 0.10, 0.08, 0.06, 0.04], // 5 years
    terminalGrowthRate: 0.025,
    wacc: 0.095, // 9.5%
    sharesOutstanding: 15634000000,
    currentStockPrice: 195.50,
  };

  const result = await openRouterService.calculate(
    'AAPL',
    'DCF Valuation',
    dcfData
  );

  console.log('Model:', result.model); // openai/gpt-5
  console.log('Calculation:', result.response);
  console.log('Cost:', `$${result.cost.toFixed(6)}`);
}

// ============================================================================
// Example 6: Ensemble Mode - Multiple Models
// ============================================================================

export async function example6_EnsembleMode() {
  console.log('🎯 Example 6: Ensemble Mode (All Models)');

  const result = await aiRouter.ensemble(
    'Should I invest in META stock? Consider fundamentals, technicals, and sentiment.',
    {
      ticker: 'META',
      price: 485.20,
      change: -1.2,
      pe: 28.5,
      marketCap: 1240.0,
    }
  );

  console.log('Model:', result.model); // 'ensemble'
  console.log('\n--- Individual Perspectives ---\n');
  
  console.log('🐦 Grok (Social):', result.individual?.grok);
  console.log('\n🧠 Claude (Analysis):', result.individual?.claude);
  console.log('\n🧮 GPT-5 (Quant):', result.individual?.gpt5);
  
  console.log('\n--- Synthesis ---\n');
  console.log('🎯 Combined Insight:', result.synthesis);
  
  console.log('\nTotal Cost:', `$${result.totalCost?.toFixed(6)}`);
}

// ============================================================================
// Example 7: Manual Model Selection
// ============================================================================

export async function example7_ManualModelSelection() {
  console.log('🎛️ Example 7: Manual Model Selection');

  // Force use of GPT-4o (cheaper alternative to GPT-5)
  const result = await openRouterService.chat(
    MODELS.GPT4O,
    [
      {
        role: 'system',
        content: 'You are a financial analyst. Provide concise answers.'
      },
      {
        role: 'user',
        content: 'Calculate the P/E ratio for a company with EPS of $5.20 and stock price of $145.'
      }
    ],
    {
      temperature: 0.3, // Low temperature for precision
      max_tokens: 500,
    }
  );

  console.log('Model:', result.model); // openai/gpt-4o
  console.log('Response:', result.response);
  console.log('Cost:', `$${result.cost.toFixed(6)}`);
}

// ============================================================================
// Example 8: API Endpoint Usage (Client-Side)
// ============================================================================

export async function example8_APIEndpoint() {
  console.log('🌐 Example 8: Using API Endpoint');

  // From React component or client code
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: 'Analyze AMD stock fundamentals',
      ticker: 'AMD',
      mode: 'claude', // auto | grok | gemini | gpt5 | claude | ensemble
    }),
  });

  const data = await response.json();

  console.log('Model:', data.model);
  console.log('Response:', data.response);
  console.log('Cost:', `$${data.cost.toFixed(6)}`);
  console.log('Tokens:', data.usage?.total_tokens);
}

// ============================================================================
// Example 9: Twitter Sentiment Endpoint
// ============================================================================

export async function example9_TwitterEndpoint() {
  console.log('🐦 Example 9: Twitter Sentiment Endpoint');

  const response = await fetch('/api/ai/chat?ticker=TSLA');
  const data = await response.json();

  console.log('Model:', data.model); // x-ai/grok-4-fast
  console.log('Twitter Sentiment:', data.response);
  console.log('Cost:', `$${data.cost.toFixed(6)}`);
}

// ============================================================================
// Example 10: Batch Processing
// ============================================================================

export async function example10_BatchProcessing() {
  console.log('📦 Example 10: Batch Processing Multiple Stocks');

  const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

  const results = await Promise.all(
    tickers.map(ticker =>
      aiRouter.route(`Provide a one-sentence investment thesis for ${ticker}`, {
        ticker,
      })
    )
  );

  results.forEach((result, index) => {
    console.log(`\n${tickers[index]}:`, result.response);
  });

  const totalCost = results.reduce((sum, r) => sum + r.cost, 0);
  console.log(`\nTotal Cost: $${totalCost.toFixed(6)}`);
}

// ============================================================================
// Example 11: Cost Comparison
// ============================================================================

export async function example11_CostComparison() {
  console.log('💰 Example 11: Cost Comparison Across Models');

  const query = 'What is the current market sentiment?';

  const models = [
    { name: 'Claude 4.5', model: MODELS.CLAUDE_SONNET_4_5 },
    { name: 'GPT-5', model: MODELS.GPT5 },
    { name: 'Gemini 2.5 Pro', model: MODELS.GEMINI_2_5_PRO },
    { name: 'Gemini Flash (FREE)', model: MODELS.GEMINI_2_FLASH },
    { name: 'Grok 4 Fast', model: MODELS.GROK_4_FAST },
  ];

  for (const { name, model } of models) {
    const result = await openRouterService.chat(
      model,
      [{ role: 'user', content: query }]
    );

    console.log(`\n${name}:`);
    console.log('  Cost:', `$${result.cost.toFixed(6)}`);
    console.log('  Tokens:', result.usage?.total_tokens);
    console.log('  Response length:', result.response.length, 'chars');
  }
}

// ============================================================================
// Example 12: Error Handling
// ============================================================================

export async function example12_ErrorHandling() {
  console.log('🚨 Example 12: Error Handling');

  try {
    const result = await openRouterService.chat(
      MODELS.CLAUDE_SONNET_4_5,
      [{ role: 'user', content: 'Test query' }]
    );

    console.log('Success:', result.response);
  } catch (error: any) {
    if (error.status === 401) {
      console.error('❌ Invalid API key');
    } else if (error.status === 429) {
      console.error('❌ Rate limit exceeded');
    } else if (error.status === 503) {
      console.error('❌ Model temporarily unavailable');
      console.log('💡 OpenRouter will auto-fallback to similar models');
    } else {
      console.error('❌ Unknown error:', error.message);
    }
  }
}

// ============================================================================
// Run All Examples
// ============================================================================

export async function runAllExamples() {
  console.log('🚀 Running all OpenRouter AI examples...\n');

  await example1_AutoRouting();
  await example2_TwitterSentiment();
  // await example3_ChartAnalysis(); // Requires browser canvas
  await example4_FundamentalAnalysis();
  await example5_DCFCalculation();
  await example6_EnsembleMode();
  await example7_ManualModelSelection();
  // await example8_APIEndpoint(); // Client-side only
  // await example9_TwitterEndpoint(); // Client-side only
  await example10_BatchProcessing();
  await example11_CostComparison();
  await example12_ErrorHandling();

  console.log('\n✅ All examples completed!');
}

// Export for use in other files
export const examples = {
  autoRouting: example1_AutoRouting,
  twitterSentiment: example2_TwitterSentiment,
  chartAnalysis: example3_ChartAnalysis,
  fundamentalAnalysis: example4_FundamentalAnalysis,
  dcfCalculation: example5_DCFCalculation,
  ensembleMode: example6_EnsembleMode,
  manualSelection: example7_ManualModelSelection,
  apiEndpoint: example8_APIEndpoint,
  twitterEndpoint: example9_TwitterEndpoint,
  batchProcessing: example10_BatchProcessing,
  costComparison: example11_CostComparison,
  errorHandling: example12_ErrorHandling,
};

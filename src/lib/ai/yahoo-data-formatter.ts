/**
 * Yahoo Finance Data Formatter for AI Analysis
 * Formats live Yahoo Finance data into structured prompts for AI models
 */

interface YahooQuoteData {
  symbol: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketVolume: number;
  regularMarketOpen: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketPreviousClose: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  fiftyDayAverage?: number;
  twoHundredDayAverage?: number;
  marketCap?: number;
  trailingPE?: number;
  forwardPE?: number;
  priceToBook?: number;
  dividendYield?: number;
  epsTrailingTwelveMonths?: number;
  beta?: number;
  averageVolume?: number;
}

interface YahooHistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjClose?: number;
}

interface YahooFinancials {
  revenue?: number;
  netIncome?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  freeCashFlow?: number;
  operatingCashFlow?: number;
  ebitda?: number;
  grossMargin?: number;
  operatingMargin?: number;
  profitMargin?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  debtToEquity?: number;
  currentRatio?: number;
  quickRatio?: number;
}

export class YahooDataFormatter {
  /**
   * Format quote data for AI analysis
   */
  static formatQuoteData(quote: YahooQuoteData): string {
    const lines = [
      `=== LIVE YAHOO FINANCE DATA (Retrieved: ${new Date().toISOString()}) ===`,
      ``,
      `Symbol: ${quote.symbol}`,
      ``,
      `CURRENT PRICE DATA:`,
      `- Current Price: $${quote.regularMarketPrice.toFixed(2)}`,
      `- Change: ${quote.regularMarketChange >= 0 ? '+' : ''}$${quote.regularMarketChange.toFixed(2)} (${quote.regularMarketChangePercent >= 0 ? '+' : ''}${quote.regularMarketChangePercent.toFixed(2)}%)`,
      `- Previous Close: $${quote.regularMarketPreviousClose.toFixed(2)}`,
      ``,
      `TODAY'S TRADING:`,
      `- Open: $${quote.regularMarketOpen.toFixed(2)}`,
      `- Day High: $${quote.regularMarketDayHigh.toFixed(2)}`,
      `- Day Low: $${quote.regularMarketDayLow.toFixed(2)}`,
      `- Volume: ${quote.regularMarketVolume.toLocaleString()}`,
    ];

    if (quote.averageVolume) {
      const volumeVsAvg = ((quote.regularMarketVolume / quote.averageVolume - 1) * 100).toFixed(1);
      lines.push(`- Average Volume: ${quote.averageVolume.toLocaleString()} (Today is ${volumeVsAvg}% vs avg)`);
    }

    if (quote.fiftyTwoWeekHigh && quote.fiftyTwoWeekLow) {
      lines.push(``);
      lines.push(`52-WEEK RANGE:`);
      lines.push(`- 52-Week High: $${quote.fiftyTwoWeekHigh.toFixed(2)}`);
      lines.push(`- 52-Week Low: $${quote.fiftyTwoWeekLow.toFixed(2)}`);
      const pctFromHigh = ((quote.regularMarketPrice / quote.fiftyTwoWeekHigh - 1) * 100).toFixed(1);
      const pctFromLow = ((quote.regularMarketPrice / quote.fiftyTwoWeekLow - 1) * 100).toFixed(1);
      lines.push(`- Distance from High: ${pctFromHigh}%`);
      lines.push(`- Distance from Low: +${pctFromLow}%`);
    }

    if (quote.fiftyDayAverage || quote.twoHundredDayAverage) {
      lines.push(``);
      lines.push(`MOVING AVERAGES:`);
      if (quote.fiftyDayAverage) {
        const pctFrom50 = ((quote.regularMarketPrice / quote.fiftyDayAverage - 1) * 100).toFixed(2);
        lines.push(`- 50-Day MA: $${quote.fiftyDayAverage.toFixed(2)} (Price is ${pctFrom50}% ${parseFloat(pctFrom50) >= 0 ? 'above' : 'below'})`);
      }
      if (quote.twoHundredDayAverage) {
        const pctFrom200 = ((quote.regularMarketPrice / quote.twoHundredDayAverage - 1) * 100).toFixed(2);
        lines.push(`- 200-Day MA: $${quote.twoHundredDayAverage.toFixed(2)} (Price is ${pctFrom200}% ${parseFloat(pctFrom200) >= 0 ? 'above' : 'below'})`);
      }
    }

    if (quote.marketCap || quote.trailingPE || quote.forwardPE) {
      lines.push(``);
      lines.push(`VALUATION METRICS:`);
      if (quote.marketCap) {
        lines.push(`- Market Cap: $${(quote.marketCap / 1_000_000_000).toFixed(2)}B`);
      }
      if (quote.trailingPE) {
        lines.push(`- P/E Ratio (TTM): ${quote.trailingPE.toFixed(2)}`);
      }
      if (quote.forwardPE) {
        lines.push(`- Forward P/E: ${quote.forwardPE.toFixed(2)}`);
      }
      if (quote.priceToBook) {
        lines.push(`- Price/Book: ${quote.priceToBook.toFixed(2)}`);
      }
      if (quote.epsTrailingTwelveMonths) {
        lines.push(`- EPS (TTM): $${quote.epsTrailingTwelveMonths.toFixed(2)}`);
      }
    }

    if (quote.dividendYield) {
      lines.push(``);
      lines.push(`DIVIDEND:`);
      lines.push(`- Dividend Yield: ${(quote.dividendYield * 100).toFixed(2)}%`);
    }

    if (quote.beta) {
      lines.push(``);
      lines.push(`RISK METRICS:`);
      lines.push(`- Beta: ${quote.beta.toFixed(2)} (${quote.beta > 1 ? 'More volatile than market' : quote.beta < 1 ? 'Less volatile than market' : 'Same as market'})`);
    }

    lines.push(``);
    lines.push(`=== END OF YAHOO FINANCE DATA ===`);

    return lines.join('\n');
  }

  /**
   * Format historical data for AI analysis
   */
  static formatHistoricalData(
    symbol: string,
    historicalData: YahooHistoricalData[],
    period: string
  ): string {
    if (!historicalData || historicalData.length === 0) {
      return 'No historical data available.';
    }

    const latest = historicalData[historicalData.length - 1];
    const oldest = historicalData[0];
    const priceChange = latest.close - oldest.close;
    const priceChangePercent = ((priceChange / oldest.close) * 100).toFixed(2);

    const lines = [
      `=== HISTORICAL PRICE DATA (${period.toUpperCase()}) ===`,
      ``,
      `Symbol: ${symbol}`,
      `Period: ${oldest.date} to ${latest.date}`,
      `Data Points: ${historicalData.length}`,
      ``,
      `PERIOD PERFORMANCE:`,
      `- Starting Price: $${oldest.close.toFixed(2)}`,
      `- Ending Price: $${latest.close.toFixed(2)}`,
      `- Change: ${priceChange >= 0 ? '+' : ''}$${priceChange.toFixed(2)} (${priceChange >= 0 ? '+' : ''}${priceChangePercent}%)`,
      ``,
      `PRICE EXTREMES:`,
    ];

    const highestDay = historicalData.reduce((max, day) => day.high > max.high ? day : max);
    const lowestDay = historicalData.reduce((min, day) => day.low < min.low ? day : min);

    lines.push(`- Highest: $${highestDay.high.toFixed(2)} (${highestDay.date})`);
    lines.push(`- Lowest: $${lowestDay.low.toFixed(2)} (${lowestDay.date})`);

    const avgVolume = historicalData.reduce((sum, day) => sum + day.volume, 0) / historicalData.length;
    lines.push(``);
    lines.push(`VOLUME ANALYSIS:`);
    lines.push(`- Average Volume: ${Math.round(avgVolume).toLocaleString()}`);
    lines.push(`- Latest Volume: ${latest.volume.toLocaleString()}`);

    // Recent 5 days detail
    const recentDays = historicalData.slice(-5);
    lines.push(``);
    lines.push(`RECENT 5-DAY DETAIL:`);
    recentDays.forEach(day => {
      const dayChange = day.close - day.open;
      const dayChangePercent = ((dayChange / day.open) * 100).toFixed(2);
      lines.push(`  ${day.date}: $${day.close.toFixed(2)} (${dayChange >= 0 ? '+' : ''}${dayChangePercent}%) | Vol: ${day.volume.toLocaleString()}`);
    });

    lines.push(``);
    lines.push(`=== END OF HISTORICAL DATA ===`);

    return lines.join('\n');
  }

  /**
   * Format financials for AI analysis
   */
  static formatFinancials(symbol: string, financials: YahooFinancials): string {
    const lines = [
      `=== FINANCIAL METRICS (YAHOO FINANCE) ===`,
      ``,
      `Symbol: ${symbol}`,
      ``,
    ];

    if (financials.revenue || financials.netIncome) {
      lines.push(`INCOME STATEMENT:`);
      if (financials.revenue) {
        lines.push(`- Revenue (TTM): $${(financials.revenue / 1_000_000_000).toFixed(2)}B`);
      }
      if (financials.netIncome) {
        lines.push(`- Net Income (TTM): $${(financials.netIncome / 1_000_000_000).toFixed(2)}B`);
        if (financials.revenue) {
          const netMargin = (financials.netIncome / financials.revenue * 100).toFixed(2);
          lines.push(`- Net Profit Margin: ${netMargin}%`);
        }
      }
      if (financials.ebitda) {
        lines.push(`- EBITDA: $${(financials.ebitda / 1_000_000_000).toFixed(2)}B`);
      }
      lines.push(``);
    }

    if (financials.totalAssets || financials.totalLiabilities) {
      lines.push(`BALANCE SHEET:`);
      if (financials.totalAssets) {
        lines.push(`- Total Assets: $${(financials.totalAssets / 1_000_000_000).toFixed(2)}B`);
      }
      if (financials.totalLiabilities) {
        lines.push(`- Total Liabilities: $${(financials.totalLiabilities / 1_000_000_000).toFixed(2)}B`);
      }
      if (financials.totalAssets && financials.totalLiabilities) {
        const equity = financials.totalAssets - financials.totalLiabilities;
        lines.push(`- Shareholders' Equity: $${(equity / 1_000_000_000).toFixed(2)}B`);
      }
      lines.push(``);
    }

    if (financials.freeCashFlow || financials.operatingCashFlow) {
      lines.push(`CASH FLOW:`);
      if (financials.operatingCashFlow) {
        lines.push(`- Operating Cash Flow: $${(financials.operatingCashFlow / 1_000_000_000).toFixed(2)}B`);
      }
      if (financials.freeCashFlow) {
        lines.push(`- Free Cash Flow: $${(financials.freeCashFlow / 1_000_000_000).toFixed(2)}B`);
      }
      lines.push(``);
    }

    if (financials.grossMargin || financials.operatingMargin || financials.profitMargin) {
      lines.push(`PROFITABILITY MARGINS:`);
      if (financials.grossMargin) {
        lines.push(`- Gross Margin: ${(financials.grossMargin * 100).toFixed(2)}%`);
      }
      if (financials.operatingMargin) {
        lines.push(`- Operating Margin: ${(financials.operatingMargin * 100).toFixed(2)}%`);
      }
      if (financials.profitMargin) {
        lines.push(`- Profit Margin: ${(financials.profitMargin * 100).toFixed(2)}%`);
      }
      lines.push(``);
    }

    if (financials.returnOnEquity || financials.returnOnAssets) {
      lines.push(`RETURNS:`);
      if (financials.returnOnEquity) {
        lines.push(`- Return on Equity (ROE): ${(financials.returnOnEquity * 100).toFixed(2)}%`);
      }
      if (financials.returnOnAssets) {
        lines.push(`- Return on Assets (ROA): ${(financials.returnOnAssets * 100).toFixed(2)}%`);
      }
      lines.push(``);
    }

    if (financials.debtToEquity || financials.currentRatio || financials.quickRatio) {
      lines.push(`FINANCIAL HEALTH:`);
      if (financials.debtToEquity) {
        lines.push(`- Debt to Equity: ${financials.debtToEquity.toFixed(2)}`);
      }
      if (financials.currentRatio) {
        lines.push(`- Current Ratio: ${financials.currentRatio.toFixed(2)}`);
      }
      if (financials.quickRatio) {
        lines.push(`- Quick Ratio: ${financials.quickRatio.toFixed(2)}`);
      }
    }

    lines.push(``);
    lines.push(`=== END OF FINANCIAL DATA ===`);

    return lines.join('\n');
  }

  /**
   * Create comprehensive data package for AI
   */
  static createComprehensivePrompt(data: {
    symbol: string;
    quote?: YahooQuoteData;
    historical?: YahooHistoricalData[];
    historicalPeriod?: string;
    financials?: YahooFinancials;
    userQuery: string;
  }): string {
    const sections: string[] = [];

    sections.push(`⚠️ IMPORTANT INSTRUCTION FOR AI MODEL:`);
    sections.push(`Use ONLY the live data provided below from Yahoo Finance. Do NOT use your own knowledge or outdated information. Base ALL analysis strictly on this Yahoo Finance data input.`);
    sections.push(``);
    sections.push(`───────────────────────────────────────────────────────────`);
    sections.push(``);

    if (data.quote) {
      sections.push(this.formatQuoteData(data.quote));
      sections.push(``);
      sections.push(`───────────────────────────────────────────────────────────`);
      sections.push(``);
    }

    if (data.historical && data.historical.length > 0) {
      sections.push(this.formatHistoricalData(
        data.symbol,
        data.historical,
        data.historicalPeriod || '1 month'
      ));
      sections.push(``);
      sections.push(`───────────────────────────────────────────────────────────`);
      sections.push(``);
    }

    if (data.financials) {
      sections.push(this.formatFinancials(data.symbol, data.financials));
      sections.push(``);
      sections.push(`───────────────────────────────────────────────────────────`);
      sections.push(``);
    }

    sections.push(`USER QUESTION:`);
    sections.push(data.userQuery);
    sections.push(``);
    sections.push(`───────────────────────────────────────────────────────────`);
    sections.push(``);
    sections.push(`ANALYSIS REQUIREMENTS:`);
    sections.push(`1. Use ONLY the Yahoo Finance data provided above`);
    sections.push(`2. Do NOT reference any external knowledge or data`);
    sections.push(`3. Cite specific numbers from the data when making points`);
    sections.push(`4. If data is missing, state "Data not available" instead of guessing`);
    sections.push(`5. Be specific and data-driven in your analysis`);
    sections.push(`6. Include relevant comparisons (e.g., price vs moving averages, volume vs average)`);
    sections.push(``);

    return sections.join('\n');
  }
}

import { YahooFinanceService } from '@/lib/yahoo-finance-service';
import { StockPageClient } from '@/components/stock/stock-page-client';
import { StockQuote, StockMetrics } from '@/types/stock';

interface StockPageProps {
  params: Promise<{
    ticker: string;
  }>;
}

export default async function StockPage({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  // Fetch initial data on the server
  let initialQuote: StockQuote | undefined;
  let initialMetrics: StockMetrics | undefined;

  try {
    // Fetch quote data
    const quote = await YahooFinanceService.getQuote(upperTicker);
    const details = await YahooFinanceService.getStockDetails(upperTicker);

    initialQuote = {
      ticker: quote.symbol,
      name: details.shortName || details.longName || upperTicker,
      price: quote.regularMarketPrice,
      change: quote.regularMarketChange,
      changePercent: quote.regularMarketChangePercent,
      volume: quote.regularMarketVolume,
      marketCap: details.marketCap || 0,
      open: quote.regularMarketOpen,
      high: quote.regularMarketDayHigh,
      low: quote.regularMarketDayLow,
      previousClose: quote.regularMarketPreviousClose,
      isLive: true,
      lastUpdate: Date.now(),
    };

    // Fetch metrics data
    initialMetrics = {
      ticker: quote.symbol,
      marketCap: details.marketCap || 0,
      peRatio: details.trailingPE || null,
      eps: details.epsTrailingTwelveMonths || null,
      dividendYield: details.dividendYield || null,
      week52High: details.fiftyTwoWeekHigh || 0,
      week52Low: details.fiftyTwoWeekLow || 0,
      volume: quote.regularMarketVolume,
      avgVolume: details.averageDailyVolume3Month || 0,
      beta: details.beta || null,
      revenue: details.revenuePerShare || null,
    };
  } catch (error) {
    console.error('Error fetching initial stock data:', error);
  }

  return (
    <StockPageClient
      ticker={upperTicker}
      initialQuote={initialQuote}
      initialMetrics={initialMetrics}
    />
  );
}

export async function generateMetadata({ params }: StockPageProps) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  try {
    const details = await YahooFinanceService.getStockDetails(upperTicker);
    const name = details.shortName || details.longName || upperTicker;

    return {
      title: `${upperTicker} - ${name} | Deep Terminal`,
      description: `Live stock data, charts, and analysis for ${name} (${upperTicker})`,
    };
  } catch (error) {
    return {
      title: `${upperTicker} | Deep Terminal`,
      description: `Stock analysis for ${upperTicker}`,
    };
  }
}

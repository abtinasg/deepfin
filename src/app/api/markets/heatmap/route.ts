import { NextRequest, NextResponse } from 'next/server';
import { YahooFinanceService, YahooQuote } from '@/lib/yahoo-finance-service';

// Top stocks by market cap in each sector
const SECTOR_STOCKS = {
  'Technology': ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'META', 'AVGO', 'ORCL', 'AMD', 'CRM', 'ADBE'],
  'Consumer Cyclical': ['AMZN', 'TSLA', 'HD', 'NKE', 'MCD', 'SBUX', 'TGT', 'LOW'],
  'Financial Services': ['JPM', 'V', 'MA', 'BAC', 'WFC', 'GS', 'MS', 'AXP'],
  'Healthcare': ['LLY', 'UNH', 'JNJ', 'MRK', 'ABBV', 'TMO', 'PFE', 'DHR'],
  'Consumer Defensive': ['WMT', 'PG', 'KO', 'PEP', 'COST', 'PM', 'MDLZ', 'CL'],
  'Energy': ['XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'PSX', 'VLO'],
  'Communication Services': ['DIS', 'CMCSA', 'NFLX', 'T', 'VZ', 'TMUS'],
  'Industrials': ['UPS', 'BA', 'HON', 'UNP', 'CAT', 'GE', 'RTX', 'LMT'],
  'Basic Materials': ['LIN', 'APD', 'SHW', 'FCX', 'NEM', 'DD', 'DOW'],
  'Real Estate': ['AMT', 'PLD', 'CCI', 'EQIX', 'PSA', 'SPG', 'O'],
  'Utilities': ['NEE', 'DUK', 'SO', 'D', 'AEP', 'EXC', 'SRE']
};

// Market cap data (approximate, in billions)
const MARKET_CAPS: Record<string, number> = {
  'AAPL': 2800, 'MSFT': 2400, 'GOOGL': 1700, 'NVDA': 1200, 'AMZN': 1500,
  'TSLA': 800, 'META': 800, 'JPM': 450, 'V': 500, 'UNH': 480,
  'LLY': 550, 'WMT': 450, 'JNJ': 400, 'PG': 380, 'MA': 380,
  'XOM': 420, 'AVGO': 350, 'HD': 320, 'CVX': 300, 'MRK': 280,
  'KO': 260, 'PEP': 240, 'COST': 250, 'ORCL': 300, 'AMD': 180,
  'NKE': 150, 'DIS': 180, 'CMCSA': 160, 'NFLX': 190, 'CRM': 230,
  'BAC': 290, 'WFC': 160, 'GS': 120, 'MS': 130, 'AXP': 140,
  'TMO': 210, 'ABBV': 280, 'PFE': 150, 'DHR': 170, 'PM': 150,
  'MCD': 190, 'SBUX': 100, 'TGT': 70, 'LOW': 130, 'UPS': 130,
  'BA': 110, 'HON': 130, 'UNP': 140, 'CAT': 140, 'NEE': 150,
  'LIN': 190, 'APD': 60, 'SHW': 70, 'FCX': 50, 'AMT': 100,
  'PLD': 90, 'DUK': 70, 'SO': 70, 'T': 110, 'VZ': 160,
  'COP': 130, 'SLB': 60, 'EOG': 70, 'MPC': 50, 'PSX': 50,
  'MDLZ': 90, 'CL': 70, 'TMUS': 170, 'GE': 130, 'RTX': 140,
  'LMT': 100, 'NEM': 40, 'DD': 30, 'DOW': 35, 'CCI': 40,
  'EQIX': 70, 'PSA': 50, 'SPG': 40, 'O': 40, 'D': 40,
  'AEP': 50, 'EXC': 40, 'SRE': 40, 'VLO': 50, 'ADBE': 220
};

// Industry mapping
const INDUSTRIES: Record<string, string> = {
  'AAPL': 'Consumer Electronics',
  'MSFT': 'Software - Infrastructure',
  'GOOGL': 'Internet Content & Information',
  'NVDA': 'Semiconductors',
  'META': 'Internet Content & Information',
  'AVGO': 'Semiconductors',
  'ORCL': 'Software - Infrastructure',
  'AMD': 'Semiconductors',
  'CRM': 'Software - Application',
  'ADBE': 'Software - Application',
  'AMZN': 'Internet Retail',
  'TSLA': 'Auto Manufacturers',
  'HD': 'Home Improvement Retail',
  'NKE': 'Footwear & Accessories',
  'MCD': 'Restaurants',
  'SBUX': 'Restaurants',
  'TGT': 'Discount Stores',
  'LOW': 'Home Improvement Retail',
  'JPM': 'Banks - Diversified',
  'V': 'Credit Services',
  'MA': 'Credit Services',
  'BAC': 'Banks - Diversified',
  'WFC': 'Banks - Diversified',
  'GS': 'Capital Markets',
  'MS': 'Capital Markets',
  'AXP': 'Credit Services',
  'LLY': 'Drug Manufacturers',
  'UNH': 'Healthcare Plans',
  'JNJ': 'Drug Manufacturers',
  'MRK': 'Drug Manufacturers',
  'ABBV': 'Drug Manufacturers',
  'TMO': 'Diagnostics & Research',
  'PFE': 'Drug Manufacturers',
  'DHR': 'Diagnostics & Research',
  'WMT': 'Discount Stores',
  'PG': 'Household & Personal Products',
  'KO': 'Beverages - Non-Alcoholic',
  'PEP': 'Beverages - Non-Alcoholic',
  'COST': 'Discount Stores',
  'PM': 'Tobacco',
  'MDLZ': 'Confectioners',
  'CL': 'Household & Personal Products',
  'XOM': 'Oil & Gas Integrated',
  'CVX': 'Oil & Gas Integrated',
  'COP': 'Oil & Gas Exploration & Production',
  'SLB': 'Oil & Gas Equipment & Services',
  'EOG': 'Oil & Gas Exploration & Production',
  'MPC': 'Oil & Gas Refining & Marketing',
  'PSX': 'Oil & Gas Refining & Marketing',
  'VLO': 'Oil & Gas Refining & Marketing',
  'DIS': 'Entertainment',
  'CMCSA': 'Telecom Services',
  'NFLX': 'Entertainment',
  'T': 'Telecom Services',
  'VZ': 'Telecom Services',
  'TMUS': 'Telecom Services',
  'UPS': 'Integrated Freight & Logistics',
  'BA': 'Aerospace & Defense',
  'HON': 'Conglomerates',
  'UNP': 'Railroads',
  'CAT': 'Farm & Heavy Construction Machinery',
  'GE': 'Conglomerates',
  'RTX': 'Aerospace & Defense',
  'LMT': 'Aerospace & Defense',
  'LIN': 'Specialty Chemicals',
  'APD': 'Specialty Chemicals',
  'SHW': 'Specialty Chemicals',
  'FCX': 'Copper',
  'NEM': 'Gold',
  'DD': 'Specialty Chemicals',
  'DOW': 'Specialty Chemicals',
  'AMT': 'REIT - Specialty',
  'PLD': 'REIT - Industrial',
  'CCI': 'REIT - Specialty',
  'EQIX': 'REIT - Specialty',
  'PSA': 'REIT - Industrial',
  'SPG': 'REIT - Retail',
  'O': 'REIT - Retail',
  'NEE': 'Utilities - Regulated Electric',
  'DUK': 'Utilities - Regulated Electric',
  'SO': 'Utilities - Regulated Electric',
  'D': 'Utilities - Regulated Electric',
  'AEP': 'Utilities - Regulated Electric',
  'EXC': 'Utilities - Regulated Electric',
  'SRE': 'Utilities - Regulated Electric'
};

// Company names
const COMPANY_NAMES: Record<string, string> = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corp.',
  'GOOGL': 'Alphabet Inc.',
  'NVDA': 'NVIDIA Corp.',
  'META': 'Meta Platforms',
  'AMZN': 'Amazon.com Inc.',
  'TSLA': 'Tesla Inc.',
  'JPM': 'JPMorgan Chase',
  'V': 'Visa Inc.',
  'UNH': 'UnitedHealth Group',
  'LLY': 'Eli Lilly',
  'WMT': 'Walmart Inc.',
  'JNJ': 'Johnson & Johnson',
  'XOM': 'Exxon Mobil',
  'AVGO': 'Broadcom',
  'MA': 'Mastercard',
  'PG': 'Procter & Gamble',
  'HD': 'Home Depot',
  'CVX': 'Chevron',
  'MRK': 'Merck & Co.',
  'KO': 'Coca-Cola',
  'PEP': 'PepsiCo',
  'COST': 'Costco',
  'ORCL': 'Oracle',
  'AMD': 'AMD',
  'NKE': 'Nike',
  'DIS': 'Walt Disney',
  'CMCSA': 'Comcast',
  'NFLX': 'Netflix',
  'CRM': 'Salesforce',
  'BAC': 'Bank of America',
  'WFC': 'Wells Fargo',
  'GS': 'Goldman Sachs',
  'MS': 'Morgan Stanley',
  'AXP': 'American Express',
  'TMO': 'Thermo Fisher',
  'ABBV': 'AbbVie',
  'PFE': 'Pfizer',
  'DHR': 'Danaher',
  'PM': 'Philip Morris',
  'MCD': 'McDonald\'s',
  'SBUX': 'Starbucks',
  'TGT': 'Target',
  'LOW': 'Lowe\'s',
  'UPS': 'UPS',
  'BA': 'Boeing',
  'HON': 'Honeywell',
  'UNP': 'Union Pacific',
  'CAT': 'Caterpillar',
  'NEE': 'NextEra Energy',
  'LIN': 'Linde',
  'APD': 'Air Products',
  'SHW': 'Sherwin-Williams',
  'FCX': 'Freeport-McMoRan',
  'AMT': 'American Tower',
  'PLD': 'Prologis',
  'DUK': 'Duke Energy',
  'SO': 'Southern Company',
  'T': 'AT&T',
  'VZ': 'Verizon',
  'COP': 'ConocoPhillips',
  'SLB': 'Schlumberger',
  'EOG': 'EOG Resources',
  'MPC': 'Marathon Petroleum',
  'PSX': 'Phillips 66',
  'MDLZ': 'Mondelez',
  'CL': 'Colgate-Palmolive',
  'TMUS': 'T-Mobile',
  'GE': 'General Electric',
  'RTX': 'Raytheon',
  'LMT': 'Lockheed Martin',
  'NEM': 'Newmont',
  'DD': 'DuPont',
  'DOW': 'Dow Inc.',
  'CCI': 'Crown Castle',
  'EQIX': 'Equinix',
  'PSA': 'Public Storage',
  'SPG': 'Simon Property',
  'O': 'Realty Income',
  'D': 'Dominion Energy',
  'AEP': 'American Electric',
  'EXC': 'Exelon',
  'SRE': 'Sempra Energy',
  'VLO': 'Valero Energy',
  'ADBE': 'Adobe'
};

export async function GET(request: NextRequest) {
  try {
    const allSymbols = Object.values(SECTOR_STOCKS).flat();
    
    // Fetch quotes for all symbols
    const quotes = await YahooFinanceService.getQuotes(allSymbols);
    
    // Build heatmap data
    const heatmapData = quotes.map((quote: YahooQuote) => {
      // Find sector for this symbol
      let sector = 'Other';
      for (const [sectorName, symbols] of Object.entries(SECTOR_STOCKS)) {
        if (symbols.includes(quote.symbol)) {
          sector = sectorName;
          break;
        }
      }
      
      return {
        symbol: quote.symbol,
        name: COMPANY_NAMES[quote.symbol] || quote.symbol,
        sector,
        industry: INDUSTRIES[quote.symbol] || 'Other',
        marketCap: (MARKET_CAPS[quote.symbol] || 100) * 1_000_000_000, // Convert to actual number
        changePercent: quote.regularMarketChangePercent,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        volume: quote.regularMarketVolume
      };
    });
    
    return NextResponse.json({ 
      data: heatmapData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[Heatmap API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    );
  }
}

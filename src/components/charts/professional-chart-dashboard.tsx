'use client';

import { useState, useEffect } from 'react';
import { ProfessionalTradingChart } from '@/components/charts/professional-trading-chart';
import { OHLCVData, Timeframe, CHART_PRESETS } from '@/types/chart';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/toast';
import { 
  Search, 
  TrendingUp, 
  BarChart3, 
  Zap,
  BookOpen,
  Star,
  Clock,
  Maximize2,
  Minimize2,
  Download,
  Share,
  Settings,
  Bell,
  Newspaper,
  TrendingDown,
  Activity,
  Moon,
  Sun,
  Grid3X3,
  Layout,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const POPULAR_TICKERS = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corp.' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.' },
  { ticker: 'TSLA', name: 'Tesla Inc.' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'BRK.B', name: 'Berkshire Hathaway' },
];

interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface Alert {
  id: string;
  symbol: string;
  condition: string;
  value: number;
  triggered: boolean;
}

export default function ProfessionalChartDashboard() {
  const [selectedTicker, setSelectedTicker] = useState('AAPL');
  const [selectedName, setSelectedName] = useState('Apple Inc.');
  const [chartData, setChartData] = useState<OHLCVData[]>([]);
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('1D');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // New state for enhanced features
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showMarketOverview, setShowMarketOverview] = useState(true);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showNews, setShowNews] = useState(false);
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Load chart data
  useEffect(() => {
    loadChartData(selectedTicker, selectedTimeframe);
  }, [selectedTicker, selectedTimeframe]);

  // Load market indices
  useEffect(() => {
    loadMarketIndices();
  }, []);

  // Load alerts
  useEffect(() => {
    loadAlerts();
  }, [selectedTicker]);

  const loadChartData = async (ticker: string, timeframe: Timeframe) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/chart/data?ticker=${ticker}&timeframe=${timeframe}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.data && Array.isArray(data.data) && data.data.length > 0) {
        setChartData(data.data);
        toast(`Data for ${ticker} loaded successfully`, 'success');
      } else {
        console.warn('No chart data received for', ticker);
        setChartData([]);
        toast('No data found', 'error');
      }
    } catch (error) {
      console.error('Error loading chart data:', error);
      setChartData([]);
      toast('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadMarketIndices = async () => {
    try {
      const response = await fetch('/api/markets/indices');
      if (response.ok) {
        const data = await response.json();
        if (data.indices) {
          setMarketIndices(data.indices);
        }
      }
    } catch (error) {
      console.error('Error loading market indices:', error);
    }
  };

  const loadAlerts = async () => {
    // Mock alerts for now - in real app, fetch from API
    const mockAlerts: Alert[] = [
      {
        id: '1',
        symbol: selectedTicker,
        condition: 'Price above',
        value: 150,
        triggered: false,
      },
      {
        id: '2',
        symbol: selectedTicker,
        condition: 'RSI below',
        value: 30,
        triggered: true,
      },
    ];
    setAlerts(mockAlerts);
  };

  const handleTickerChange = (ticker: string, name: string) => {
    setSelectedTicker(ticker);
    setSelectedName(name);
  };

  const handleApplyPreset = (preset: any) => {
    console.log('Applying preset:', preset.name);
    
    // Apply preset configuration
    if (preset.config.timeframe) {
      setSelectedTimeframe(preset.config.timeframe);
    }
    
    toast(`Preset "${preset.name}" applied - Timeframe: ${preset.config.timeframe}`, 'success');
  };

  const handleExportChart = () => {
    // Export functionality - could save as PNG/PDF
    toast('Export feature coming soon!', 'info');
  };

  const handleShareChart = () => {
    // Share functionality - could generate shareable link
    toast('Share feature coming soon!', 'info');
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // In a real app, you'd update the theme context
    document.documentElement.classList.toggle('dark');
  };

  const handleSaveLayout = async () => {
    try {
      const layoutName = prompt('نام Layout را وارد کنید:', `${selectedTicker} - ${selectedTimeframe}`);
      
      if (!layoutName) return;

      const config = {
        ticker: selectedTicker,
        timeframe: selectedTimeframe,
        chartType: 'candlestick' as const,
        indicators: [],
        drawings: [],
        comparisons: [],
        showVolume: true,
        showGrid: true,
      };

      const response = await fetch('/api/chart/layouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: layoutName,
          config,
        }),
      });

      if (response.ok) {
        toast(`Layout "${layoutName}" saved successfully`, 'success');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      toast('Error saving layout', 'error');
    }
  };

  return (
    <div className={cn(
      "h-screen flex flex-col transition-colors duration-300",
      isDarkMode ? "bg-background dark text-foreground" : "bg-white text-gray-900",
      isFullscreen && "fixed inset-0 z-50"
    )}>
      {/* Enhanced Header */}
      <header className="h-14 border-b bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <motion.div 
            className="flex items-center gap-2"
            whileHover={{ scale: 1.02 }}
          >
            <BarChart3 className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Pro Chart</h1>
          </motion.div>
          <div className="h-6 w-px bg-border" />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{selectedTicker}</span>
            <span>•</span>
            <span>{selectedName}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Panel Toggles */}
          <Button 
            variant={showMarketOverview ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setShowMarketOverview(!showMarketOverview)}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Markets</span>
          </Button>
          <Button 
            variant={showAlerts ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setShowAlerts(!showAlerts)}
            className="gap-2"
          >
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Alerts</span>
          </Button>
          <Button 
            variant={showNews ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setShowNews(!showNews)}
            className="gap-2"
          >
            <Newspaper className="w-4 h-4" />
            <span className="hidden sm:inline">News</span>
          </Button>

          <div className="h-6 w-px bg-border" />

          <Button variant="ghost" size="sm" onClick={toggleTheme} className="gap-2">
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline">Theme</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportChart} className="gap-2">
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleShareChart} className="gap-2">
            <Share className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <BookOpen className="w-4 h-4" />
            <span className="hidden sm:inline">Guide</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-2">
            <Star className="w-4 h-4" />
            <span className="hidden sm:inline">Watchlist</span>
          </Button>
          <Button variant="default" size="sm" onClick={handleSaveLayout} className="gap-2">
            <Zap className="w-4 h-4" />
            Save Layout
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="gap-2">
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Collapsible Sidebar */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 288, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-r bg-card/50 backdrop-blur-sm flex flex-col overflow-hidden"
            >
              <div className="p-4 space-y-4 overflow-y-auto flex-1">
                {/* Search */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Search
                  </h3>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Symbol..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Popular Stocks */}
                <div className="space-y-2">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-3 h-3" />
                    Popular
                  </h3>
                  <div className="space-y-1">
                    {POPULAR_TICKERS.filter(s => 
                      s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
                      s.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((stock) => (
                      <motion.button
                        key={stock.ticker}
                        onClick={() => handleTickerChange(stock.ticker, stock.name)}
                        className={cn(
                          "w-full text-left px-3 py-2 rounded-md text-sm transition-all duration-200 flex items-center justify-between group",
                          selectedTicker === stock.ticker
                            ? 'bg-primary/10 text-primary font-medium shadow-sm'
                            : 'hover:bg-accent hover:text-accent-foreground text-muted-foreground'
                        )}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{stock.ticker}</span>
                          <span className="text-[10px] opacity-70 truncate max-w-[120px]">{stock.name}</span>
                        </div>
                        {selectedTicker === stock.ticker && (
                          <motion.div 
                            className="w-1.5 h-1.5 rounded-full bg-primary"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                          />
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Presets */}
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-3 h-3" />
                    Presets
                  </h3>
                  <div className="space-y-1">
                    {CHART_PRESETS.map((preset) => (
                      <motion.button
                        key={preset.id}
                        onClick={() => handleApplyPreset(preset)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-colors flex items-start gap-3"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-base mt-0.5">{preset.icon}</span>
                        <div>
                          <div className="font-medium">{preset.name}</div>
                          <div className="text-[10px] text-muted-foreground">{preset.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Footer Info */}
              <div className="p-4 border-t bg-muted/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Real-time Data</span>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Sidebar Toggle */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-20 left-2 z-10 bg-card/80 backdrop-blur-sm border shadow-sm"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Chart Area */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
            {loading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-50">
                <motion.div 
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">Loading market data...</p>
                </motion.div>
              </div>
            ) : null}
            
            {chartData.length > 0 ? (
              <div className="flex-1 w-full h-full">
                <ProfessionalTradingChart
                  ticker={selectedTicker}
                  name={selectedName}
                  initialData={chartData}
                  onTimeframeChange={(timeframe) => setSelectedTimeframe(timeframe)}
                  onSaveLayout={handleSaveLayout}
                />
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <motion.div 
                  className="text-center max-w-md mx-auto p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BarChart3 className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Data Available</h3>
                  <p className="text-sm text-muted-foreground">
                    Unable to load chart data for {selectedTicker}. Please try another ticker or check your connection.
                  </p>
                </motion.div>
              </div>
            )}
          </div>

          {/* Right Panel - Market Overview, Alerts, News */}
          <AnimatePresence>
            {(showMarketOverview || showAlerts || showNews) && (
              <motion.div 
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 320, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="border-l bg-card/50 backdrop-blur-sm overflow-hidden flex flex-col"
              >
                <div className="flex-1 overflow-y-auto">
                  {/* Market Overview */}
                  {showMarketOverview && (
                    <div className="p-4 border-b">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Market Overview
                      </h3>
                      <div className="space-y-2">
                        {marketIndices.length > 0 ? (
                          marketIndices.slice(0, 5).map((index) => (
                            <motion.div 
                              key={index.symbol}
                              className="flex items-center justify-between p-2 rounded-md bg-muted/30"
                              whileHover={{ scale: 1.02 }}
                            >
                              <div>
                                <div className="text-sm font-medium">{index.symbol}</div>
                                <div className="text-xs text-muted-foreground">{index.name}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{index.price.toFixed(2)}</div>
                                <div className={cn(
                                  "text-xs flex items-center gap-1",
                                  index.change >= 0 ? "text-green-500" : "text-red-500"
                                )}>
                                  {index.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                  {index.changePercent.toFixed(2)}%
                                </div>
                              </div>
                            </motion.div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <div className="animate-pulse space-y-2">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="h-12 bg-muted/30 rounded" />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alerts */}
                  {showAlerts && (
                    <div className="p-4 border-b">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Alerts
                      </h3>
                      <div className="space-y-2">
                        {alerts.map((alert) => (
                          <motion.div 
                            key={alert.id}
                            className={cn(
                              "p-3 rounded-md border",
                              alert.triggered ? "bg-red-500/10 border-red-500/20" : "bg-muted/30"
                            )}
                            whileHover={{ scale: 1.02 }}
                          >
                            <div className="text-sm font-medium">{alert.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {alert.condition} {alert.value}
                            </div>
                            {alert.triggered && (
                              <div className="text-xs text-red-500 font-medium mt-1">Triggered!</div>
                            )}
                          </motion.div>
                        ))}
                        {alerts.length === 0 && (
                          <div className="text-center py-4 text-muted-foreground text-sm">
                            No alerts set
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* News */}
                  {showNews && (
                    <div className="p-4">
                      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Newspaper className="w-4 h-4" />
                        News
                      </h3>
                      <div className="space-y-3">
                        <motion.div 
                          className="p-3 rounded-md bg-muted/30"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm font-medium mb-1">Market Update</div>
                          <div className="text-xs text-muted-foreground">
                            Latest market news and analysis coming soon...
                          </div>
                        </motion.div>
                        <motion.div 
                          className="p-3 rounded-md bg-muted/30"
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="text-sm font-medium mb-1">Technical Analysis</div>
                          <div className="text-xs text-muted-foreground">
                            AI-powered insights available in premium version
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

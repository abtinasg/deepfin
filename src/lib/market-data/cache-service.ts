import { Redis } from '@upstash/redis';
import { MarketData, CachedMarketData } from '@/types/market-data';

// Initialize Redis client (optional - falls back to memory cache)
let redis: Redis | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    // Validate URL format
    if (url.startsWith('https://') && url.includes('upstash.io')) {
      redis = new Redis({
        url,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
    }
  }
} catch (error) {
  console.warn('Redis initialization failed, using memory cache only:', error);
}

export class MarketDataCache {
  private readonly defaultTTL = 60; // 60 seconds default TTL
  private memoryCache = new Map<string, CachedMarketData>();

  /**
   * Get cached market data
   */
  async get(symbol: string): Promise<MarketData | null> {
    const key = this.buildKey(symbol);

    // Try memory cache first
    const memCached = this.memoryCache.get(key);
    if (memCached && this.isValid(memCached)) {
      return memCached.data;
    }

    // Try Redis if available
    if (redis) {
      try {
        const cached = await redis.get<CachedMarketData>(key);
        if (cached && this.isValid(cached)) {
          // Update memory cache
          this.memoryCache.set(key, cached);
          return cached.data;
        }
      } catch (error) {
        console.error('[Cache] Redis get error:', error);
      }
    }

    return null;
  }

  /**
   * Set cached market data
   */
  async set(symbol: string, data: MarketData, ttl?: number): Promise<void> {
    const key = this.buildKey(symbol);
    const cached: CachedMarketData = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
    };

    // Update memory cache
    this.memoryCache.set(key, cached);

    // Update Redis if available
    if (redis) {
      try {
        await redis.setex(key, cached.ttl, JSON.stringify(cached));
      } catch (error) {
        console.error('[Cache] Redis set error:', error);
      }
    }
  }

  /**
   * Get multiple cached items
   */
  async getMany(symbols: string[]): Promise<Map<string, MarketData>> {
    const result = new Map<string, MarketData>();

    await Promise.all(
      symbols.map(async (symbol) => {
        const data = await this.get(symbol);
        if (data) {
          result.set(symbol, data);
        }
      })
    );

    return result;
  }

  /**
   * Set multiple cached items
   */
  async setMany(items: Map<string, MarketData>, ttl?: number): Promise<void> {
    await Promise.all(
      Array.from(items.entries()).map(([symbol, data]) => 
        this.set(symbol, data, ttl)
      )
    );
  }

  /**
   * Invalidate cache for a symbol
   */
  async invalidate(symbol: string): Promise<void> {
    const key = this.buildKey(symbol);

    // Remove from memory cache
    this.memoryCache.delete(key);

    // Remove from Redis if available
    if (redis) {
      try {
        await redis.del(key);
      } catch (error) {
        console.error('[Cache] Redis delete error:', error);
      }
    }
  }

  /**
   * Invalidate multiple symbols
   */
  async invalidateMany(symbols: string[]): Promise<void> {
    await Promise.all(symbols.map((symbol) => this.invalidate(symbol)));
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    // Clear memory cache
    this.memoryCache.clear();

    // Clear Redis if available (only market data keys)
    if (redis) {
      try {
        const keys = await redis.keys('market:*');
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } catch (error) {
        console.error('[Cache] Redis clear error:', error);
      }
    }
  }

  /**
   * Build cache key for symbol
   */
  private buildKey(symbol: string): string {
    return `market:${symbol.toUpperCase()}`;
  }

  /**
   * Check if cached data is still valid
   */
  private isValid(cached: CachedMarketData): boolean {
    const age = Date.now() - cached.timestamp;
    return age < cached.ttl * 1000;
  }

  /**
   * Clean up expired entries from memory cache
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.memoryCache.entries()) {
      if (!this.isValid(cached)) {
        this.memoryCache.delete(key);
      }
    }
  }
}

// Singleton instance
let cacheInstance: MarketDataCache | null = null;

export function getMarketDataCache(): MarketDataCache {
  if (!cacheInstance) {
    cacheInstance = new MarketDataCache();
    
    // Run cleanup every 5 minutes
    setInterval(() => {
      cacheInstance?.cleanup();
    }, 5 * 60 * 1000);
  }

  return cacheInstance;
}

export function resetMarketDataCache(): void {
  if (cacheInstance) {
    cacheInstance.clear();
    cacheInstance = null;
  }
}

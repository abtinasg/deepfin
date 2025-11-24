import { Redis } from '@upstash/redis';

// Check if Redis is configured
const isRedisConfigured = 
  process.env.UPSTASH_REDIS_REST_URL && 
  process.env.UPSTASH_REDIS_REST_TOKEN &&
  !process.env.UPSTASH_REDIS_REST_URL.includes('...') &&
  !process.env.UPSTASH_REDIS_REST_TOKEN.includes('...');

export const redis = isRedisConfigured 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null;

// Helper functions
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
  // If Redis is not configured, just fetch directly
  if (!redis) {
    console.warn('⚠️ Redis not configured, fetching without cache');
    return fetcher();
  }
  // Try cache first
  const cached = await redis.get<T>(key);
  if (cached) return cached;

  // Fetch fresh data
  const data = await fetcher();

  // Cache it
  await redis.set(key, data, { ex: ttl });

  return data;
}

// Clear cache by pattern
export async function clearCache(pattern: string): Promise<void> {
  if (!redis) return;
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Set cache with custom TTL
export async function setCache<T>(key: string, data: T, ttl: number = 300): Promise<void> {
  if (!redis) return;
  await redis.set(key, data, { ex: ttl });
}

// Get cache
export async function getCache<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  return redis.get<T>(key);
}

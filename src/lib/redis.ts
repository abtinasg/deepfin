import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Helper functions
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300 // 5 minutes default
): Promise<T> {
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
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

// Set cache with custom TTL
export async function setCache<T>(key: string, data: T, ttl: number = 300): Promise<void> {
  await redis.set(key, data, { ex: ttl });
}

// Get cache
export async function getCache<T>(key: string): Promise<T | null> {
  return redis.get<T>(key);
}

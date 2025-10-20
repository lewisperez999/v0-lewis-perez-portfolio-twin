import { Redis } from '@upstash/redis';
import { Index } from '@upstash/vector';

// Initialize Redis client for caching (Vercel KV under the hood)
// Vercel automatically provides these environment variables when you add the integration
export const redis = process.env.KV_URL && process.env.KV_REST_API_TOKEN
  ? Redis.fromEnv()
  : null;

// Initialize Vector client for semantic search
export const vectorIndex = process.env.UPSTASH_VECTOR_REST_URL && process.env.UPSTASH_VECTOR_REST_TOKEN
  ? new Index({
      url: process.env.UPSTASH_VECTOR_REST_URL!,
      token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
    })
  : null;

// Generic cache utility with TTL
export async function getCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600
): Promise<T> {
  // If Redis is not configured, fetch data directly
  if (!redis) {
    console.warn('Redis not configured, fetching data directly');
    return fetcher();
  }

  try {
    // Check cache first
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      console.log(`Cache hit for key: ${key}`);
      return cached;
    }

    // Fetch fresh data
    console.log(`Cache miss for key: ${key}, fetching...`);
    const data = await fetcher();
    
    // Store in cache with TTL
    await redis.setex(key, ttl, JSON.stringify(data));
    
    return data;
  } catch (error) {
    console.error('Cache error:', error);
    // Fallback to fetcher on cache error
    return fetcher();
  }
}

// Invalidate cache by pattern
export async function invalidateCache(pattern: string) {
  if (!redis) {
    console.warn('Redis not configured, cannot invalidate cache');
    return;
  }

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Invalidated ${keys.length} cache keys matching pattern: ${pattern}`);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

// Health check for Upstash services
export async function checkUpstashHealth() {
  const health = {
    redis: false,
    vector: false,
  };

  // Check Redis
  if (redis) {
    try {
      await redis.ping();
      health.redis = true;
    } catch (error) {
      console.error('Redis health check failed:', error);
    }
  }

  // Check Vector
  if (vectorIndex) {
    try {
      // Vector doesn't have a ping, so we'll just check if it's initialized
      health.vector = true;
    } catch (error) {
      console.error('Vector health check failed:', error);
    }
  }

  return health;
}

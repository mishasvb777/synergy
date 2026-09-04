interface MemoryItem {
  value: string;
  expiresAt?: number;
}

const memory = new Map<string, MemoryItem>();
let redisClient: {
  get: (key: string) => Promise<string | null>;
  setEx: (key: string, ttl: number, value: string) => Promise<unknown>;
  keys: (pattern: string) => Promise<string[]>;
  del: (keys: string[]) => Promise<number>;
  quit: () => Promise<unknown>;
} | null = null;
let redisReady = false;

export const redis = {
  get isOpen() {
    return redisReady;
  },
  async get(key: string): Promise<string | null> {
    if (redisReady && redisClient) return redisClient.get(key);
    const item = memory.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memory.delete(key);
      return null;
    }
    return item.value;
  },
  async setEx(key: string, ttlSec: number, value: string): Promise<void> {
    if (redisReady && redisClient) {
      await redisClient.setEx(key, ttlSec, value);
      return;
    }
    memory.set(key, { value, expiresAt: Date.now() + ttlSec * 1000 });
  },
  async keys(pattern: string): Promise<string[]> {
    if (redisReady && redisClient) return redisClient.keys(pattern);
    const prefix = pattern.replace('*', '');
    return [...memory.keys()].filter((k) => k.startsWith(prefix));
  },
  async del(keys: string[] | string): Promise<number> {
    const list = Array.isArray(keys) ? keys : [keys];
    if (redisReady && redisClient) {
      if (!list.length) return 0;
      return redisClient.del(list);
    }
    list.forEach((k) => memory.delete(k));
    return list.length;
  },
};

export async function connectRedis(): Promise<typeof redis> {
  const url = process.env.REDIS_URL || 'redis://localhost:6379';
  if (process.env.SKIP_REDIS === '1') {
    console.warn('Cache: in-memory (SKIP_REDIS=1)');
    return redis;
  }
  try {
    const { createClient } = await import('redis');
    const client = createClient({
      url,
      socket: { connectTimeout: 800, reconnectStrategy: false },
    });
    client.on('error', () => undefined);
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Redis timeout')), 1000)),
    ]);
    redisClient = client as typeof redisClient;
    redisReady = true;
    console.log('Cache: Redis connected');
    return redis;
  } catch (err) {
    redisReady = false;
    try {
      if (redisClient) await redisClient.quit();
    } catch {
      /* ignore */
    }
    redisClient = null;
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Cache: in-memory fallback (Redis unavailable):', message);
    return redis;
  }
}

export async function invalidateFeedCache(): Promise<void> {
  try {
    const keys = await redis.keys('feed:*');
    if (keys.length) await redis.del(keys);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Feed cache invalidate skipped:', message);
  }
}

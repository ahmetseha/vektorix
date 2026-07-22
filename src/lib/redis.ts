import "server-only";
import { Redis } from "@upstash/redis";

const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  ? new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN })
  : null;

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    if (!redis) return null;
    try { return await redis.get<T>(key); } catch { return null; }
  },
  async set<T>(key: string, value: T, ttlSeconds = 300) {
    if (!redis) return;
    await redis.set(key, value, { ex: ttlSeconds });
  },
  async delete(key: string) {
    if (!redis) return;
    await redis.del(key);
  },
  async invalidateWorkspace(workspaceId: string) {
    if (!redis) return;
    const keys = await redis.keys(`analytics:${workspaceId}:*`);
    if (keys.length) await redis.del(...keys);
  },
};

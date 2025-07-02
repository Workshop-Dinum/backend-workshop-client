import NodeCache from 'node-cache';
import { createClient } from 'redis';

const isProd = process.env.NODE_ENV === 'production';

let cache: any;

if (isProd) {
  // Redis en production
  const redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.connect();
  cache = {
    async get(key: string) {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    },
    async set(key: string, value: any, ttl = 60) {
      await redisClient.set(key, JSON.stringify(value), { EX: ttl });
    },
    async del(key: string) {
      await redisClient.del(key);
    }
  };
} else {
  // NodeCache en dev/test
  const nodeCache = new NodeCache({ stdTTL: 60 });
  cache = {
    async get(key: string) {
      return nodeCache.get(key);
    },
    async set(key: string, value: any, ttl = 60) {
      nodeCache.set(key, value, ttl);
    },
    async del(key: string) {
      nodeCache.del(key);
    }
  };
}

export default cache; 
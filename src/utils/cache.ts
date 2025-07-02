import NodeCache from 'node-cache'
import { createClient } from 'redis'

const isProd = process.env.NODE_ENV === 'production'
let cache: any

if (isProd && process.env.REDIS_URL) {
  try {
    const redisClient = createClient({ url: process.env.REDIS_URL })

    // Évite le crash Render si Redis n'est pas dispo
    redisClient.connect().catch(err => {
      console.warn('⚠️ Redis non disponible :', err.message)
    })

    cache = {
      async get(key: string) {
        try {
          const data = await redisClient.get(key)
          return data ? JSON.parse(data) : null
        } catch {
          return null
        }
      },
      async set(key: string, value: any, ttl = 60) {
        try {
          await redisClient.set(key, JSON.stringify(value), { EX: ttl })
        } catch {}
      },
      async del(key: string) {
        try {
          await redisClient.del(key)
        } catch {}
      }
    }
  } catch (e) {
    const err = e as Error;
    console.warn('⚠️ Échec init Redis :', err.message)
  }
} else {
  const nodeCache = new NodeCache({ stdTTL: 60 })
  cache = {
    async get(key: string) {
      return nodeCache.get(key)
    },
    async set(key: string, value: any, ttl = 60) {
      nodeCache.set(key, value, ttl)
    },
    async del(key: string) {
      nodeCache.del(key)
    }
  }
}

export default cache

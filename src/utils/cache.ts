import NodeCache from 'node-cache'
import { createClient } from 'redis'

const isProd = process.env.NODE_ENV === 'production'
let cache: any

if (isProd && process.env.REDIS_URL) {
  try {
    const redisClient = createClient({ url: process.env.REDIS_URL })

    // Gestion propre de la connexion
    redisClient.on('error', (err) => {
      console.warn('⚠️ Redis error:', err.message)
    })

    redisClient.connect().catch(err => {
      console.warn('⚠️ Échec de connexion Redis (non bloquant) :', err.message)
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
    console.warn('⚠️ Exception lors de l’init Redis :', err.message)
    fallbackToNodeCache()
  }
} else {
  fallbackToNodeCache()
}

function fallbackToNodeCache() {
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

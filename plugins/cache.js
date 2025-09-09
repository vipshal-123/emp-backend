import fp from 'fastify-plugin'
import IoRedis from 'ioredis'
import config from '@/config'
import isEmpty from 'is-empty'

const cachePlugin = async (app) => {
    const redis = new IoRedis({
        host: config.REDIS_HOST || '127.0.0.1',
        port: config.REDIS_PORT || 6379,
        password: config.REDIS_PASSWORD || undefined,
    })

    redis.on('connect', () => app.log.info('✅ Redis connected successfully'))
    redis.on('ready', () => app.log.info('⚡ Redis ready to use'))
    redis.on('error', (err) => app.log.error({ err }, '❌ Redis connection error'))

    const getCache = async (key) => {
        const data = await redis.get(key)
        if (isEmpty(data)) return null
        return JSON.parse(data)
    }

    const setCache = async (key, value, ttl = 60, userId = null) => {
        await redis.set(key, JSON.stringify(value), 'EX', ttl)

        if (userId) {
            await redis.sadd(`employee:keys:${userId}`, key)
        }
    }

    const deleteCachePrefix = async (userId) => {
        const keys = await redis.smembers(`employee:keys:${userId}`)
        if (!isEmpty(keys)) {
            await redis.del(...keys)
            await redis.del(`employee:keys:${userId}`)
        }
    }

    app.decorate('cacheGet', getCache)
    app.decorate('cacheSet', setCache)
    app.decorate('cacheDeletePrefix', deleteCachePrefix)
}


export default fp(cachePlugin, { name: 'cache-plugin' })

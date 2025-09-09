import fp from 'fastify-plugin'
import IoRedis from 'ioredis'
import abstractCache from 'abstract-cache'
import redisStore from 'abstract-cache-redis'
import fastifyCaching from '@fastify/caching'
import config from '@/config'
import isEmpty from 'is-empty'

const cachePlugin = async (app) => {
    const redis = new IoRedis({
        host: config.REDIS_HOST || '127.0.0.1',
        port: config.REDIS_PORT || 6379,
        password: config.REDIS_PASSWORD || undefined,
    })

    redis.on('connect', () => {
        app.log.info('✅ Redis connected successfully')
    })

    redis.on('ready', () => {
        app.log.info('⚡ Redis ready to use')
    })

    redis.on('error', (err) => {
        app.log.error({ err }, '❌ Redis connection error')
    })

    const cache = abstractCache({
        useAwait: true,
        driver: redisStore({ client: redis }),
    })

    app.register(fastifyCaching, {
        privacy: fastifyCaching.privacy.PUBLIC,
        expiresIn: 60 * 1000,
        cache,
    })

    const getCache = async (key) => {
        const data = await cache.get(key)

        if (isEmpty(data)) return null
        return JSON.parse(data.item)
    }

    const setCache = async (key, value, ttl = 60) => {
        await cache.set(key, JSON.stringify(value), ttl * 1000)
    }

    app.decorate('cacheGet', getCache)
    app.decorate('cacheSet', setCache)
}

export default fp(cachePlugin, { name: 'cache-plugin' })

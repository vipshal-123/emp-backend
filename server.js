/* Package Imports */
import ip from 'ip'
import cors from '@fastify/cors'
import fastifyCookie from '@fastify/cookie'
import fastifyHelmet from '@fastify/helmet'
import fastifyRateLimit from '@fastify/rate-limit'
import connectDatabase, { sequelize } from '@/database/connection'
import config from '@/config'
import router from '@/routes'
import fastify from 'fastify'
import fastifySession from '@fastify/session'
import cachePlugin from '@/plugins/cache.js'
import { requestLogger } from './middlewares/requestLogger.middleware'

const app = fastify({
    logger: true,
})

app.register(cors, {
    origin: [config.CORS_ORIGIN],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})

app.register(fastifyCookie)

app.register(fastifySession, {
    secret: config.SESSION_SECRET,
    cookie: { secure: false },
    saveUninitialized: false,
})

app.register(fastifyHelmet)

app.register(fastifyRateLimit, {
    max: 100,
    timeWindow: '1 minute',
})

const serverIP = ip.address()
console.log(`\x1b[95mSERVER IP: ${serverIP}`)

requestLogger(app)

app.get('/', async (req, reply) => {
    return { ok: true, message: 'health check..!!' }
})

app.register(cachePlugin)
app.register(router, { prefix: '/api' })

connectDatabase(async (isConnect) => {
    if (isConnect) {
        await sequelize.sync({ alter: true })
        console.log('All tables created/updated')

        app.listen({ port: config.PORT, host: '0.0.0.0' })
        console.log(`\x1b[33mServer runs in port ${config.PORT}...`)
        console.log(`\x1b[38;5;201mAPI HOST - http://${serverIP}:${config.PORT} or http://127.0.0.1:${config.PORT} or ${config.API_HOST} \n`)
    }
})

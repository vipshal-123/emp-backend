import authRoutes from './auth'
import v1Routes from './v1'
import { FastifyInstance } from 'fastify'

const router = (fastify: FastifyInstance) => {
    fastify.register(v1Routes, { prefix: '/v1' })
    fastify.register(authRoutes, { prefix: '/auth' })
}

export default router

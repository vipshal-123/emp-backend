import userRoutes from './user.routes'
import { FastifyInstance } from 'fastify'

const v1Routes = (fastify: FastifyInstance) => {
    fastify.register(userRoutes, { prefix: '/user' })
}

export default v1Routes

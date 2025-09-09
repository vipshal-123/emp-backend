import userRoutes from './user.routes'

const v1Routes = (fastify) => {
    fastify.register(userRoutes, { prefix: '/user' })
}

export default v1Routes

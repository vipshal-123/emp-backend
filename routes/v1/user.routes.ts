import controllers from '@/controllers'
import validations from '@/validations'
import { authenticate } from '@/middleware/auth.middleware'
import { FastifyInstance } from 'fastify'

const userRoutes = (fastify: FastifyInstance) => {
    fastify.addHook('onRequest', authenticate)

    fastify
        .post('/add-employee', { preHandler: validations.v1.user.addEmployee }, controllers.v1.user.createEmployee)
        .get('/employees', controllers.v1.user.getEmployees)
        .put('/employee/:id', { preHandler: validations.v1.user.addEmployee }, controllers.v1.user.updateEmployee)
        .get('/employee/:id', controllers.v1.user.getEmployeeById)
        .delete('/employee/:id', controllers.v1.user.deleteEmployee)

    fastify.get('/user-info', controllers.v1.user.userInfo)
    fastify.post('/signout', controllers.v1.user.signout)
}

export default userRoutes

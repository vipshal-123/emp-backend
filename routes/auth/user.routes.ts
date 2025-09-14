import controllers from '@/controllers'
import validations from '@/validations'
import { FastifyInstance } from 'fastify'

const userRoutes = (fastify: FastifyInstance) => {
    fastify.post('/signup', { preHandler: validations.auth.user.signup }, controllers.auth.user.signupSendOtp)
    fastify.post('/verify-signup-otp', controllers.auth.user.verifySignupOtp)
    fastify.post('/resend-signup-otp', controllers.auth.user.resendOtp)
    fastify.post('/create-password', controllers.auth.user.createPassword)
    fastify.post('/signin', controllers.auth.user.signin)
    fastify.post('/refresh-token', controllers.auth.user.refreshToken)
}

export default userRoutes

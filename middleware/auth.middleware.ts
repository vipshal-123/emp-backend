import jwt from 'jsonwebtoken'
import isEmpty from 'is-empty'
import config from '@/config'
import { FastifyRequest, FastifyReply } from 'fastify'
import { AuthJwtPayload } from '@/types/fastify'

export const authenticate = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { headers } = req

        const token = headers?.authorization?.split(' ')[1] as string

        if (isEmpty(token)) {
            return reply.code(401).send({ success: false, message: 'Unauthorized' })
        }

        let payload = null

        try {
            payload = jwt.verify(token, config.JWT_SECRET) as AuthJwtPayload
        } catch (error) {
            console.error('error: ', error)
            payload = null
        }

        if (isEmpty(payload)) {
            return reply.code(401).send({ success: false, message: 'Unauthorized' })
        }

        req.user = payload
    } catch (error) {
        console.log('error: ', error)
        reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

import jwt from 'jsonwebtoken'
import isEmpty from 'is-empty'
import config from '@/config'

export const authenticate = async (req, reply) => {
    try {
        const { headers } = req

        const token = headers?.authorization?.split(' ')[1]

        if (isEmpty(token)) {
            return reply.code(401).send({ success: false, message: 'Unauthorized' })
        }

        const payload = jwt.verify(token, config.JWT_SECRET)

        if (isEmpty(payload)) {
            return reply.code(401).send({ success: false, message: 'Unauthorized' })
        }
        req.user = payload
    } catch (error) {
        console.log('error: ', error)
        reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

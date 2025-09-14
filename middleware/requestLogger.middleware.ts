import { RequestLog } from '@/repositories'
import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'

export const requestLogger = async (app: FastifyInstance) => {
    app.addHook('onSend', async (req: FastifyRequest, reply: FastifyReply, response) => {
        try {
            const { user, body, params, query, headers } = req

            const request = {
                body: body || null,
                query: query || null,
                params: params || null,
                headers: headers || null,
            }

            const data = {
                userId: user?.id || null,
                method: req.method,
                url: req.url,
                statusCode: reply.statusCode,
                ip: req.ip,
                request: request,
                response: response,
            }
            await RequestLog.create(data)
        } catch (error) {
            console.log('error: ', error)
        }

        return response
    })
}

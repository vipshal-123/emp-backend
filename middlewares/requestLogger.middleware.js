import { RequestLog } from '@/models'

export const requestLogger = async (app) => {
    app.addHook('onResponse', async (req, reply) => {
        try {
            const { user } = req

            const payload = {
                userId: user?.id || null,
                method: req.method,
                url: req.url,
                statusCode: reply.statusCode,
                ip: req.ip,
            }
            await RequestLog.create(payload)
        } catch (error) {
            console.log('error: ', error)
        }
    })
}

import 'fastify'
import { JwtPayload } from 'jsonwebtoken'

export interface AuthJwtPayload {
    id: number
    email: string
    sessionId?: string
    [key: string]: any
}

declare module 'fastify' {
    interface FastifyRequest {
        user?: AuthJwtPayload | null
    }
}

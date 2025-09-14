import { query } from '@/database/connection'

interface RequestLog {
    userId?: number | null
    method: string
    url: string
    statusCode: number
    ip: string
    request: any
    response:any
}

class RequestLog {
    static async create(data: RequestLog) {
        const res = await query(
            `INSERT INTO "RequestLogs"("userId", method, url, "statusCode", ip, request, response, "createdAt", "updatedAt")
            VALUES($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
            RETURNING *`,
            [data?.userId, data?.method, data?.url, data?.statusCode, data?.ip, data?.request, data?.response],
        )

        return res.rows[0] || null
    }
}

export default RequestLog

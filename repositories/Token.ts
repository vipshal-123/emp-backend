import { query } from '@/database/connection'

class Token {
    static async create(data: { userId: number; sessionId: string; accessToken: string; refreshToken: string; expiresAt: Date }) {
        const res = await query(
            `
            INSERT INTO "Tokens"("userId","sessionId","accessToken","refreshToken","expiresAt","createdAt","updatedAt")
            VALUES($1,$2,$3,$4,$5,NOW(),NOW())
            RETURNING *
        `,
            [data.userId, data.sessionId, data.accessToken, data.refreshToken, data.expiresAt],
        )
        return res.rows[0] || null
    }

    static async findByRefreshToken(refreshToken: string) {
        const res = await query(`SELECT * FROM "Tokens" WHERE "refreshToken"=$1 LIMIT 1`, [refreshToken])
        return res.rows[0] || null
    }

    static async updateAccessToken(refreshToken: string, accessToken: string) {
        const res = await query(`UPDATE "Tokens" SET "accessToken"=$1, "updatedAt"=NOW() WHERE "refreshToken"=$2`, [accessToken, refreshToken])
        return res.rowCount
    }

    static async deleteByRefreshToken(refreshToken: string) {
        const res = await query(`DELETE FROM "Tokens" WHERE "refreshToken"=$1`, [refreshToken])
        return res.rowCount
    }

    static async findByUserAndSession(userId: number, sessionId: string) {
        const result = await query(`SELECT id FROM "Tokens" WHERE "userId"=$1 AND "sessionId"=$2`, [userId, sessionId])
        return result.rows[0]
    }

    static async deleteById(id: number) {
        await query(`DELETE FROM "Tokens" WHERE id=$1`, [id])
    }
}

export default Token

import { query } from '@/database/connection'
import isEmpty from 'is-empty'

interface SecurityRecord {
    id?: number
    userId?: number
    type?: string
    mode?: string
    value?: string
    expiresAt?: Date
    secret?: string
    securityCount?: number
    tries?: number
    otpRequestedAt?: Date
}

class Security {
    static async create(data: SecurityRecord) {
        const res = await query(
            `
            INSERT INTO "Securities"(
                "userId", type, mode, value, secret, "expiresAt", "otpRequestedAt", "securityCount", tries, "createdAt", "updatedAt"
            )
            VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW(), NOW())
            RETURNING *
        `,
            [
                data.userId,
                data.type || null,
                data.mode || null,
                data.value || '',
                data.secret || null,
                data.expiresAt || null,
                data.otpRequestedAt || null,
                data.securityCount || 0,
                data.tries || 0,
            ],
        )
        return res.rows[0] || null
    }

    static async findOne(where: { userId?: number; type?: string; mode?: string }) {
        const conditions = []
        const values = []
        let idx = 1
        for (const key in where) {
            conditions.push(`"${key}"=$${idx}`)
            values.push((where as any)[key])
            idx++
        }
        const res = await query(`SELECT * FROM "Securities" ${conditions.length ? 'WHERE ' + conditions.join(' AND ') : ''} LIMIT 1`, values)
        return res.rows[0] || null
    }

    static async update(where: any, updateData: any) {
        const cleanData = { ...updateData }
        delete (cleanData as any)?.updatedAt

        const setFields: string[] = []
        const values: any[] = []
        let idx = 1

        for (const key in cleanData) {
            setFields.push(`"${key}"=$${idx}`)
            values.push(cleanData[key])
            idx++
        }

        if (isEmpty(setFields)) return 0

        const conditions: string[] = []
        for (const key in where) {
            conditions.push(`"${key}"=$${idx}`)
            values.push(where[key])
            idx++
        }

        console.log('conditions: ', conditions)
        console.log('values: ', values)

        const res = await query(
            `UPDATE "Securities" 
         SET ${setFields.join(', ')}, "updatedAt"=NOW() 
         ${!isEmpty(conditions) ? 'WHERE ' + conditions.join(' AND ') : ''}`,
            values,
        )

        return res.rowCount
    }

    static async upsert(data: SecurityRecord): Promise<void> {
        await query(
            `
      INSERT INTO "Securities" ("userId", type, mode, value, "expiresAt", secret, "securityCount", tries, "otpRequestedAt", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, 0), $9, NOW(), NOW())
      ON CONFLICT ("userId", type, mode)
      DO UPDATE SET
        value = EXCLUDED.value,
        "expiresAt" = EXCLUDED."expiresAt",
        secret = EXCLUDED.secret,
        "securityCount" = EXCLUDED."securityCount",
        tries = EXCLUDED.tries,
        "otpRequestedAt" = EXCLUDED."otpRequestedAt",
        "updatedAt" = NOW()
    `,
            [data.userId, data.type, data.mode, data.value, data.expiresAt, data.secret, data.securityCount, data.tries ?? 0, data.otpRequestedAt],
        )
    }
}

export default Security

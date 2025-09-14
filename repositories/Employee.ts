import { query } from '@/database/connection'

interface Employee {
    userId: number
    name: string
    ssn: string
    address1?: string
    address2?: string
    city?: string
    state?: string
    zip?: string
    country?: string
}

class Employee {
    static async create(payload: Employee) {
        const result = await query(
            `INSERT INTO "Employees" 
        ("userId", name, ssn, address1, address2, city, state, zip, country, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9, NOW(), NOW())
       RETURNING *`,
            [
                payload.userId,
                payload.name,
                payload.ssn,
                payload.address1 || '',
                payload.address2 || '',
                payload.city || '',
                payload.state || '',
                payload.zip || '',
                payload.country || '',
            ],
        )

        return result.rows[0]
    }

    static async findAll(userId: number, limit: number, lastId?: number) {
        let sql = `SELECT * FROM "Employees" WHERE "userId"=$1 AND "isDeleted"=false`
        const params: [number] = [userId]

        if (lastId) {
            sql += ` AND id < $2`
            params.push(lastId)
        }

        sql += ` ORDER BY id DESC LIMIT ${limit}`
        const result = await query(sql, params)
        return result.rows
    }

    static async findById(id: number) {
        const result = await query(`SELECT * FROM "Employees" WHERE id=$1 AND "isDeleted"=false`, [id])
        return result.rows[0]
    }

    static async update(id: number, payload: Partial<Employee>) {
        const cleanPayload = { ...payload }
        delete (cleanPayload as any)?.updatedAt

        const fields = Object.keys(cleanPayload)
        if (fields.length === 0) return null

        const setQuery = fields.map((f, i) => `"${f}"=$${i + 1}`).join(', ')
        const values = Object.values(cleanPayload)

        const result = await query(
            `UPDATE "Employees" 
         SET ${setQuery}, "updatedAt"=NOW() 
         WHERE id=$1 
         RETURNING *`,
            [...values],
        )
        console.log('[id, ...values]: ', [...values])

        return result.rows[0]
    }

    static async delete(id: number) {
        const result = await query(`UPDATE "Employees" SET "isDeleted"=true, "updatedAt"=NOW() WHERE id=$1 RETURNING *`, [id])
        return result.rows[0]
    }
}

export default Employee

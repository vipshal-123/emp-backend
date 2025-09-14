import { query } from '@/database/connection'
import isEmpty from 'is-empty'

interface User {
    name: string
    companyName: string
    email: string
    phone: string
    password?: string
    isEmailVerified?: boolean
}

class User {
    static async create(userData: User) {
        const res = await query(
            `
            INSERT INTO "Users"(name, "companyName", email, phone, password, "isEmailVerified", "createdAt", "updatedAt")
            VALUES($1, $2, $3, $4, $5, $6, NOW(), NOW())
            RETURNING *
        `,
            [userData.name, userData.companyName, userData.email, userData.phone, userData.password || '', userData.isEmailVerified || false],
        )
        return res.rows[0] || null
    }

    static async findById(id: number) {
        const res = await query(`SELECT * FROM "Users" WHERE id=$1`, [id])
        return res.rows[0] || null
    }

    static async findByEmail(email: string) {
        const res = await query(`SELECT * FROM "Users" WHERE email=$1`, [email])
        return res.rows[0] || null
    }

    static async updateById(id: number, updateData: Partial<any>) {
        const cleanData = { ...updateData }
        delete (cleanData as any)?.updatedAt

        const fields: string[] = []
        const values: any[] = []
        let idx = 1

        for (const key in cleanData) {
            fields.push(`"${key}"=$${idx}`)
            values.push(cleanData[key])
            idx++
        }

        if (isEmpty(fields)) return 0

        values.push(id)

        const res = await query(
            `UPDATE "Users" 
         SET ${fields.join(', ')}, "updatedAt"=NOW() 
         WHERE id=$${idx}`,
            values,
        )

        return res.rowCount
    }
}

export default User

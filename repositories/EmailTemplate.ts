import { pool } from '@/database/connection'

interface EmailTemplate {
    id?: number
    identifier: string
    subject: string
    content: string
    status?: 'active' | 'inactive'
    "createdAt"?: Date
    "updatedAt"?: Date
}

class EmailTemplate {
    static async create(template: EmailTemplate): Promise<EmailTemplate> {
        const result = await pool.query<EmailTemplate>(
            `INSERT INTO "EmailTemplates" (identifier, subject, content, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
            [template.identifier, template.subject, template.content, template.status || 'active'],
        )
        return result.rows[0]
    }

    static async findByIdentifier(identifier: string): Promise<EmailTemplate | null> {
        const result = await pool.query<EmailTemplate>(`SELECT * FROM "EmailTemplates" WHERE identifier = $1 LIMIT 1`, [identifier])
        return result.rows[0] || null
    }

    static async update(id: number, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
        const fields = Object.keys(updates)
        if (fields.length === 0) return null

        const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ')
        const values = fields.map((field) => (updates as any)[field])

        const result = await pool.query<EmailTemplate>(`UPDATE "EmailTemplates" SET ${setClause}, "updatedAt" = NOW() WHERE id = $1 RETURNING *`, [
            id,
            ...values,
        ])

        return result.rows[0] || null
    }

    static async delete(id: number): Promise<boolean> {
        const result = await pool.query(`DELETE FROM "EmailTemplates" WHERE id = $1`, [id])
        if (result.rowCount === null) {
            return false
        }
        return result.rowCount > 0
    }
}

export default EmailTemplate

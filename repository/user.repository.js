import { query } from '@/database/connection'

export const findUserByEmail = async (email) => {
    const dbQuery = 'SELECT * FROM employers WHERE email = $1 AND is_deleted = FALSE'
    const { rows } = await query(dbQuery, [email])
    return rows[0] || null
}

export const createUser = async (data) => {
    const dbQuery = `
        INSERT INTO employers (name, email, password_hash)
        VALUES ($1, $2, $3)
        RETURNING id, name, email, created_at;
    `
    const { rows } = await query(dbQuery, [data.name, data.email, data.passwordHash])
    return rows[0]
}

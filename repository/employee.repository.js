import { query } from '@/database/connection'

export const getAllEmployees = async (employerId) => {
    const dbQuery = 'SELECT * FROM employees WHERE employer_id = $1 AND is_deleted = FALSE ORDER BY created_at DESC'
    const { rows } = await query(dbQuery, [employerId])
    return rows
}

export const getEmployeeById = async (employeeId, employerId) => {
    const dbQuery = 'SELECT * FROM employees WHERE id = $1 AND employer_id = $2 AND is_deleted = FALSE'
    const { rows } = await query(dbQuery, [employeeId, employerId])
    return rows[0] || null
}

export const createEmployee = async (employerId, data) => {
    const dbQuery = `
        INSERT INTO employees (employer_id, name, ssn, address1, address2, city, state, zip, country)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *;
    `
    const values = [employerId, data.name, data.ssn, data.address1, data.address2, data.city, data.state, data.zip, data.country]
    const { rows } = await query(dbQuery, values)
    return rows[0]
}

export const updateEmployee = async (employeeId, employerId, data) => {
    const dbQuery = `
        UPDATE employees
        SET
            name = $1,
            ssn = $2,
            address1 = $3,
            address2 = $4,
            city = $5,
            state = $6,
            zip = $7,
            country = $8,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $9 AND employer_id = $10 AND is_deleted = FALSE
        RETURNING *;
    `
    const values = [data.name, data.ssn, data.address1, data.address2, data.city, data.state, data.zip, data.country, employeeId, employerId]
    const { rows } = await query(dbQuery, values)
    return rows[0] || null
}

export const deleteEmployee = async (employeeId, employerId) => {
    const dbQuery = `
        UPDATE employees
        SET is_deleted = TRUE, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND employer_id = $2
        RETURNING *;
    `
    const { rows } = await query(dbQuery, [employeeId, employerId])
    return rows[0] || null
}

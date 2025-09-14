import { Pool, PoolClient } from 'pg'
import config from '@/config'

let connectionCounter = 0

export const pool = new Pool({
    user: config.USER_NAME,
    host: config.HOST,
    database: config.DATABASE_NAME,
    password: String(config.PASSWORD),
    port: Number(config.DB_PORT),
    ssl: {
        rejectUnauthorized: false,
    },
})

export async function connectDatabase(callback: (connected: boolean) => void): Promise<void> {
    try {
        const client: PoolClient = await pool.connect()
        console.log('Postgres connection successful')
        client.release()
        callback(true)
    } catch (err) {
        console.error('Database connection failed:', err)
        connectionCounter++
        if (connectionCounter >= 10) {
            process.exit(-1)
        } else {
            setTimeout(() => connectDatabase(callback), 5000)
        }
    }
}

export const query = (text: string, params?: any[]) => {
    return pool.query(text, params)
}

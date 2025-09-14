import { query } from '@/database/connection'

export async function up() {
    await query(`
    CREATE TABLE IF NOT EXISTS "RequestLogs" (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER DEFAULT NULL,
      method VARCHAR(255) DEFAULT '',
      url VARCHAR(255) DEFAULT '',
      "statusCode" INTEGER NOT NULL,
      ip VARCHAR(50) DEFAULT '',
      request JSONB DEFAULT NULL,
      response JSONB DEFAULT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `)

    console.log('✅ request_log table created')
}

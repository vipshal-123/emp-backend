import { query } from '@/database/connection'

export async function up() {
    await query(`
    CREATE TABLE IF NOT EXISTS "Tokens" (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
      "refreshToken" VARCHAR(255) NOT NULL,
      "accessToken" VARCHAR(255) NOT NULL,
      "sessionId" VARCHAR(255) NOT NULL,
      "expiresAt" TIMESTAMP NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `)

    console.log('✅ token table created')
}

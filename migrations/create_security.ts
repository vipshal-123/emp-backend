import { query } from '@/database/connection'

export async function up() {
    await query(`
    CREATE TABLE IF NOT EXISTS "Securities" (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
      type VARCHAR(50) DEFAULT NULL CHECK (type IN ('activation_mail')),
      mode VARCHAR(50) DEFAULT NULL CHECK (mode IN ('email')),
      value VARCHAR(255) DEFAULT '',
      secret VARCHAR(255) DEFAULT NULL,
      "expiresAt" TIMESTAMP DEFAULT NULL,
      "otpRequestedAt" TIMESTAMP DEFAULT NULL,
      "securityCount" INTEGER DEFAULT 0,
      tries INTEGER DEFAULT 0,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW(),
      UNIQUE("userId", type, mode)
    );
  `)

    console.log('✅ Security table created')
}

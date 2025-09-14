import { query } from '@/database/connection'

export async function up() {
    await query(`
    CREATE TABLE IF NOT EXISTS "EmailTemplates" (
      id SERIAL PRIMARY KEY,
      identifier VARCHAR(255) NOT NULL UNIQUE,
      subject VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active','inactive')),
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW(),
      UNIQUE(identifier)
    );
  `)

    console.log('✅ email_template table created')
}

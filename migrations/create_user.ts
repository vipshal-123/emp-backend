import { query } from '@/database/connection'

export async function up() {
    await query(`
    CREATE TABLE IF NOT EXISTS "Users" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      "companyName" VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      phone VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) DEFAULT '',
      "isEmailVerified" BOOLEAN DEFAULT false,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `)

    console.log('✅ user table created')
}

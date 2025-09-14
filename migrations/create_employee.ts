import { query } from '@/database/connection'

export async function up() {
    await query(`
    CREATE TABLE IF NOT EXISTS "Employees" (
      id SERIAL PRIMARY KEY,
      "userId" INTEGER NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      ssn VARCHAR(50) NOT NULL,
      address1 VARCHAR(100) DEFAULT '',
      address2 VARCHAR(100) DEFAULT '',
      city VARCHAR(50) DEFAULT '',
      state VARCHAR(50) DEFAULT '',
      zip VARCHAR(20) DEFAULT '',
      country VARCHAR(50) DEFAULT 'India',
      "isDeleted" BOOLEAN DEFAULT FALSE,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `)

    console.log('✅ employee table created')
}

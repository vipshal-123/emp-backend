import { pool } from '@/database/connection'
import { up as createUser } from './create_user'
import { up as createEmployee } from './create_employee'
import { up as createEmailTemplate } from './create_email_template'
import { up as createSecurity } from './create_security'
import { up as createToken } from './create_token'
import { up as createRequestLog } from './create_reaquestLog'

async function runMigrations() {
    try {
        console.log('➡️  Running migrations...')

        await createUser()
        console.log('✅ User table created')

        await createEmployee()
        console.log('✅ Employee table created')

        await createEmailTemplate()
        console.log('✅ EmailTemplate table created')

        await createSecurity()
        console.log('✅ Security table created')

        await createToken()
        console.log('✅ Token table created')

        await createRequestLog()
        console.log('✅ RequestLog table created')

        console.log('🎉 All migrations applied!')
    } catch (err) {
        console.error('❌ Migration failed:', err)
        process.exit(1)
    } finally {
        await pool.end()
    }
}

runMigrations()

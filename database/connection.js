import config from '@/config'
import { Sequelize } from 'sequelize'

export const sequelize = new Sequelize(config.DATABASE_NAME, config.USER_NAME, config.PASSWORD, {
    host: config.HOST,
    port: config.DB_PORT,
    dialect: 'postgres',
    logging: false,
})

let connectionCounter = 0

export default function connectDatabase(callback) {
    sequelize
        .authenticate()
        .then(() => {
            console.log('Postgres authentication successful')
            callback(true)
        })
        .catch((err) => {
            console.error('Database connection failed:', err)
            connectionCounter++
            if (connectionCounter >= 10) process.exit(-1)
            else setTimeout(() => connectDatabase(callback), 5000)
        })
}

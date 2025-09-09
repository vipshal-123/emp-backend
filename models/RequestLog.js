import { sequelize } from '@/database/connection'
import { DataTypes } from 'sequelize'

const RequestLog = sequelize.define(
    'RequestLog',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            defaultValue: null,
        },
        method: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        url: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        statusCode: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ip: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
    },
    { timestamps: true },
)

export default RequestLog

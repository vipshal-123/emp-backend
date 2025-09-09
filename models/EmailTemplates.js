import { sequelize } from '@/database/connection'
import { DataTypes } from 'sequelize'

const EmailTemplate = sequelize.define(
    'EmailTemplate',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        identifier: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active',
        },
    },
    {
        timestamps: true,
    },
)

export default EmailTemplate

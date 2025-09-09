import { sequelize } from '@/database/connection'
import { DataTypes } from 'sequelize'
import User from './User'

const Security = sequelize.define(
    'Security',
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        type: {
            type: DataTypes.ENUM('activation_mail'),
            allowNull: true,
            defaultValue: null,
        },
        mode: {
            type: DataTypes.ENUM('email'),
            allowNull: true,
            defaultValue: null,
        },
        value: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        secret: {
            type: DataTypes.STRING,
            defaultValue: null,
        },
        expiresAt: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        otpRequestedAt: {
            type: DataTypes.DATE,
            defaultValue: null,
        },
        securityCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
        tries: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'type', 'mode'],
            },
        ],
    },
)

Security.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Security, { foreignKey: 'userId' })

export default Security

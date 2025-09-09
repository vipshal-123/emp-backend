import { sequelize } from '@/database/connection'
import { DataTypes } from 'sequelize'
import User from './User'

const Token = sequelize.define(
    'Token',
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
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        accessToken: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        sessionId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    { timestamps: true },
)

Token.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Token, { foreignKey: 'userId' })

export default Token

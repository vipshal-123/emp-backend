import { sequelize } from '@/database/connection'
import { DataTypes } from 'sequelize'
import User from './User'

const Employee = sequelize.define(
    'Employee',
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
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
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        ssn: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        address1: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        address2: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        city: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        state: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        zip: {
            type: DataTypes.STRING,
            defaultValue: '',
        },
        country: {
            type: DataTypes.STRING,
            defaultValue: 'India',
        },
        isDeleted: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    },
    {
        timestamps: true,
    },
)

Employee.belongsTo(User, { foreignKey: 'userId' })
User.hasMany(Employee, { foreignKey: 'userId' })

export default Employee

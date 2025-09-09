import { Token, User } from '@/models'
import Employee from '@/models/Employee'
import isEmpty from 'is-empty'
import { Op } from 'sequelize'

export const createEmployee = async (req, reply) => {
    try {
        const { body, user } = req

        const payload = {
            userId: user.id,
            name: body?.name,
            ssn: body?.ssn,
            address1: body?.address1 || '',
            address2: body?.address2 || '',
            city: body?.city || '',
            state: body?.state || '',
            zip: body?.zip || '',
            country: body?.country || '',
        }

        const employee = await Employee.create(payload)

        if (isEmpty(employee)) {
            return reply.status(500).send({ success: false, message: 'Employee added successfully' })
        }

        return reply.status(201).send({ success: true, message: 'Employee created successfully', id: employee?.id })
    } catch (error) {
        console.error('createEmployee error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const getEmployees = async (req, reply) => {
    try {
        const { query, user, server } = req

        let dbQuery = { isDeleted: false, userId: user.id }
        const cacheKey = `employee:list${user.id}:${query?.next || ''}`
        console.log('cacheKey: ', cacheKey)

        if (!isEmpty(query?.next)) {
            const decodeData = JSON.parse(Buffer.from(query?.next, 'base64').toString('utf-8'))
            dbQuery = { ...dbQuery, id: { [Op.lt]: decodeData.id } }
        }

        let employees = await server.cacheGet(cacheKey)
        console.log('employees: ', employees);

        if (!isEmpty(employees)) {
            const lastData = employees[employees.length - 1].id
            const encodeData = Buffer.from(JSON.stringify({ id: lastData }), 'utf-8').toString('base64')

            return reply.status(200).send({ success: true, data: employees, next: encodeData })
        }

        employees = await Employee.findAll({
            where: dbQuery,
            order: [['id', 'DESC']],
            limit: parseInt(query?.limit) || 10,
            raw: true,
        })

        if (isEmpty(employees)) {
            return reply.status(200).send({ success: true, data: [] })
        }

        await server.cacheSet(cacheKey, employees, 120)

        const lastData = employees[employees.length - 1].id
        const encodeData = Buffer.from(JSON.stringify({ id: lastData }), 'utf-8').toString('base64')

        return reply.status(200).send({ success: true, data: employees, next: encodeData })
    } catch (error) {
        console.error('getEmployees error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const getEmployeeById = async (req, reply) => {
    try {
        const { params } = req

        const employee = await Employee.findOne({
            where: { id: params?.id, isDeleted: false },
            raw: true,
        })

        if (isEmpty(employee)) {
            return reply.status(200).send({ success: true, data: {} })
        }

        return reply.status(200).send({ success: true, data: employee })
    } catch (error) {
        console.error('getEmployeeById error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const updateEmployee = async (req, reply) => {
    try {
        const { params, body } = req

        const payload = {
            name: body?.name,
            ssn: body?.ssn,
            address1: body?.address1,
            address2: body?.address2,
            city: body?.city,
            state: body?.state,
            zip: body?.zip,
            country: body?.country,
        }

        const employee = await Employee.findByPk(params?.id)

        if (isEmpty(employee) || employee.isDeleted) {
            return reply.status(404).send({ success: false, message: 'Employee not found' })
        }

        const [updateEmployee] = await Employee.update(payload, { where: { id: params?.id } })
        console.log('updateEmployee: ', updateEmployee);
        
        if (updateEmployee === 0) {
            return reply.status(500).send({ success: false, message: 'Something went wrong' })
        }


        return reply.status(200).send({ success: true, message: 'Employee updated successfully' })
    } catch (error) {
        console.error('updateEmployee error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const deleteEmployee = async (req, reply) => {
    try {
        const { params } = req

        const employee = await Employee.findByPk(params?.id)

        if (isEmpty(employee) || employee.isDeleted) {
            return reply.status(404).send({ success: false, message: 'Employee not found' })
        }

        await employee.update({ isDeleted: true })

        return reply.status(200).send({ success: true, message: 'Employee deleted successfully' })
    } catch (error) {
        console.error('deleteEmployee error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const userInfo = async (req, res) => {
    try {
        const { user, server } = req

        const cacheKey = `user:info${user.id}`

        let findUser = await server.cacheGet(cacheKey)
        console.log('findUser: ', findUser)

        if (!isEmpty(findUser)) {
            return res.status(200).send({ success: true, data: findUser })
        }

        findUser = await User.findByPk(user.id, { attributes: ['id', 'name', 'companyName', 'email'], raw: true })

        if (isEmpty(findUser)) {
            return res.status(200).send({ success: true, data: {} })
        }

        await server.cacheSet(cacheKey, findUser, 120)

        return res.status(200).send({ success: true, data: findUser })
    } catch (error) {
        console.error('error: ', error)
    }
}

export const signout = async (req, reply) => {
    try {
        const { user } = req

        const token = await Token.findOne({ where: { userId: user.id, sessionId: user.sessionId }, attributes: ['id'], raw: true })

        if (isEmpty(token)) {
            return reply.status(401).send({ success: false, isLogout: true, message: 'Session expired' })
        }

        await Token.destroy({ where: { id: token.id } })

        reply.clearCookie('refreshToken')

        return reply.status(200).send({ success: true, message: 'Logout successfully' })
    } catch (error) {
        console.log('error: ', error)
        return reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

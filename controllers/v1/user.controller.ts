import { FastifyReply, FastifyRequest } from 'fastify'
import isEmpty from 'is-empty'
import { Employee, User, Token } from '@/repositories'

export const createEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { body, user, server } = req as any

        const payload = {
            userId: user.id,
            name: body?.name,
            ssn: body?.ssn,
            address1: body?.address1,
            address2: body?.address2,
            city: body?.city,
            state: body?.state,
            zip: body?.zip,
            country: body?.country,
        }

        const employee = await Employee.create(payload)

        if (isEmpty(employee)) {
            return reply.status(500).send({ success: false, message: 'Employee not added' })
        }

        await server.cacheDeletePrefix(user.id)
        return reply.status(201).send({ success: true, message: 'Employee created successfully', id: employee.id })
    } catch (error) {
        console.error('createEmployee error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const getEmployees = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { query, user, server } = req as any

        let lastId: number | undefined
        if (query?.next) {
            const decodeData = JSON.parse(Buffer.from(query.next, 'base64').toString('utf-8'))
            lastId = decodeData.id
        }

        const cacheKey = `employee:list${user.id}:${query?.next || ''}`
        let employees = await server.cacheGet(cacheKey)

        if (!isEmpty(employees)) {
            const lastData = employees[employees.length - 1].id
            const encodeData = Buffer.from(JSON.stringify({ id: lastData }), 'utf-8').toString('base64')
            return reply.status(200).send({ success: true, data: employees, next: encodeData })
        }

        employees = await Employee.findAll(user.id, parseInt(query?.limit) || 10, lastId)

        if (isEmpty(employees)) {
            return reply.status(200).send({ success: true, data: [] })
        }

        await server.cacheSet(cacheKey, employees, 120, user.id)

        const lastData = employees[employees.length - 1].id
        const encodeData = Buffer.from(JSON.stringify({ id: lastData }), 'utf-8').toString('base64')

        return reply.status(200).send({ success: true, data: employees, next: encodeData })
    } catch (error) {
        console.error('getEmployees error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const getEmployeeById = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { params } = req as any
        const employee = await Employee.findById(Number(params?.id))

        if (isEmpty(employee)) {
            return reply.status(200).send({ success: true, data: {} })
        }

        return reply.status(200).send({ success: true, data: employee })
    } catch (error) {
        console.error('getEmployeeById error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const updateEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { params, body, server, user } = req as any

        const employee = await Employee.findById(Number(params?.id))
        if (isEmpty(employee)) {
            return reply.status(404).send({ success: false, message: 'Employee not found' })
        }

        const updated = await Employee.update(Number(params?.id), body)
        if (isEmpty(updated)) {
            return reply.status(500).send({ success: false, message: 'Something went wrong' })
        }

        await server.cacheDeletePrefix(user.id)
        return reply.status(200).send({ success: true, message: 'Employee updated successfully' })
    } catch (error) {
        console.error('updateEmployee error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const deleteEmployee = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { params, server, user } = req as any
        const employee = await Employee.findById(Number(params?.id))

        if (isEmpty(employee)) {
            return reply.status(404).send({ success: false, message: 'Employee not found' })
        }

        await Employee.delete(Number(params?.id))
        await server.cacheDeletePrefix(user.id)

        return reply.status(200).send({ success: true, message: 'Employee deleted successfully' })
    } catch (error) {
        console.error('deleteEmployee error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const userInfo = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { user, server } = req as any
        const cacheKey = `user:info${user.id}`

        let findUser = await server.cacheGet(cacheKey)
        if (!isEmpty(findUser)) {
            return reply.status(200).send({ success: true, data: findUser })
        }

        findUser = await User.findById(user.id)
        if (isEmpty(findUser)) {
            return reply.status(200).send({ success: true, data: {} })
        }

        await server.cacheSet(cacheKey, findUser, 120, '')
        return reply.status(200).send({ success: true, data: findUser })
    } catch (error) {
        console.error('userInfo error', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const signout = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { user } = req as any
        const token = await Token.findByUserAndSession(user.id, user.sessionId)

        if (isEmpty(token)) {
            return reply.status(401).send({ success: false, isLogout: true, message: 'Session expired' })
        }

        await Token.deleteById(token.id)
        reply.clearCookie('refreshToken')

        return reply.status(200).send({ success: true, message: 'Logout successfully' })
    } catch (error) {
        console.error('signout error', error)
        return reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

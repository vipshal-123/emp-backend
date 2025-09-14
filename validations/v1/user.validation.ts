import yupToFormError from '@/utils/yupToFormErrors'
import * as yup from 'yup'
import { SSN, ZIP_CODE } from '@/constants/regex'
import { FastifyRequest, FastifyReply } from 'fastify'

interface AddEmployeeBody {
    name: string
    ssn: string
    address1: string
    address2?: string
    city: string
    state: string
    zip: string
    country: string
}

export const addEmployee = async (req: FastifyRequest<{ Body: AddEmployeeBody }>, reply: FastifyReply) => {
    try {
        const { body } = req

        const schema = yup.object({
            name: yup.string().required('Name is required').min(2, 'Name must be at least 2 characters'),
            ssn: yup.string().required('SSN is required').matches(SSN, 'SSN must be a 9-digit number'),
            address1: yup.string().max(100, 'Address1 can be max 100 characters').required('Address 1 is required'),
            address2: yup.string().max(100, 'Address2 can be max 100 characters'),
            city: yup.string().max(50, 'City can be max 50 characters').required('City is required'),
            state: yup.string().max(50, 'State can be max 50 characters').required('State is required'),
            zip: yup.string().matches(ZIP_CODE).max(20, 'ZIP can be max 20 characters').required('Zip code is required'),
            country: yup.string().required('Country is required'),
        })

        try {
            await schema.validate(body, { abortEarly: false })
        } catch (error: any) {
            return reply.status(400).send({ success: false, errors: yupToFormError(error) })
        }
    } catch (error) {
        console.log(error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

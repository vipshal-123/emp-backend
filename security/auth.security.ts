import isEmpty from 'is-empty'
import ms from 'ms'
import moment from 'moment'
import config from '@/config'
import { generateOTP } from '@/utils/reUseableFunctions'
import { v4 as uuid } from 'uuid'
import { encryptString } from './crypto'
import { sendEmailViaTemplate } from '@/controllers/utility/mail.controller'
import { compareString, hashString } from './security'
import { Security } from '@/repositories'
import { FastifyReply, FastifyRequest } from 'fastify'

export const sendOtp = async (
    user: { id: number; email: string },
    request: FastifyRequest,
    reply: FastifyReply,
    identifier: string,
    subject: string = '',
    type: string,
    mode: string,
    session: string,
    otpCount: number,
): Promise<{ status: boolean; message?: string; token?: string }> => {
    try {
        const otp = generateOTP()
        const otpExpiry = new Date(Date.now() + ms('10min'))
        const otpSecret = uuid()

        const otpHash = await hashString(otpSecret)
        if (!otpHash) return { status: false, message: 'Something went wrong' }

        const emailContext = {
            identifier,
            to: user.email,
            content: { subject, otp },
        }
        const emailSent = await sendEmailViaTemplate(emailContext)
        if (!emailSent) return { status: false, message: 'Something went wrong' }

        const otpValueHash = await hashString(otp)

        const payload = {
            userId: user.id,
            type,
            mode,
            value: otpValueHash,
            expiresAt: otpExpiry,
            secret: otpSecret,
            securityCount: otpCount,
            otpRequestedAt: moment().toDate(),
        }

        await Security.upsert(payload)

        const token = encryptString(
            JSON.stringify({
                id: user.id,
                email: user.email,
                type,
                mode,
                session,
            }),
        )

        reply.clearCookie(session)
        reply.header('Access-Control-Allow-Origin', config.FRONTEND_USER)
        reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

        reply.setCookie(session, encodeURIComponent(otpHash), {
            httpOnly: true,
            sameSite: 'none',
            secure: true,
            path: '/',
        })

        return { status: true, token }
    } catch (error) {
        console.log('error: ', error)
        return { status: false, message: 'Something went wrong' }
    }
}

export const verifyOtp = async (
    user: { id: number },
    reply: FastifyReply,
    cookies: Record<string, string | undefined>,
    otp: string,
    type: string,
    mode: string,
    session: string,
): Promise<{ status: boolean; message?: string }> => {
    try {
        if (isEmpty(cookies[session])) {
            return { status: false, message: 'Invalid cookie session' }
        }

        if (isEmpty(otp)) {
            return { status: false, message: 'Otp is required' }
        }

        const securityData = await Security.findOne({ userId: user.id, type: type, mode: mode })

        if (!securityData || isEmpty(securityData.secret)) {
            return { status: false, message: 'Otp verification failed, retry with new OTP' }
        }

        if (!(await compareString(securityData.secret, decodeURIComponent(cookies[session] as string)))) {
            return { status: false, message: 'Invalid session' }
        }

        const now = moment()
        const otpResetTime = moment(securityData.otpRequestedAt).add(6, 'hours')

        if ((securityData.tries ?? 0) >= 5 && now.isBefore(otpResetTime)) {
            const waitHours = otpResetTime.diff(now, 'hours')
            const waitMinutes = otpResetTime.diff(now, 'minutes') % 60
            return {
                status: false,
                message: `You have reached the maximum OTP tries. Please try again after ${waitHours} hours ${waitMinutes} minutes.`,
            }
        }

        if (!(await compareString(otp, securityData.value))) {
            await Security.update({ user: user.id, type: type, mode: mode }, { tries: (securityData.tries ?? 0) + 1 })
            return { status: false, message: 'Invalid OTP' }
        }

        if (new Date() > securityData.expiresAt) {
            return { status: false, message: 'Your OTP has been expired' }
        }

        await Security.update(
            { userId: user.id, type: type, mode: mode },
            {
                value: '',
                expiresAt: null,
                secret: null,
                tries: 0,
                securityCount: 0,
                otpRequestedAt: null,
            },
        )

        reply.clearCookie(session)
        return { status: true }
    } catch (error) {
        console.error('OTP verification error:', error)
        return { status: false, message: 'Something went wrong' }
    }
}

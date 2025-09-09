import isEmpty from 'is-empty'
import ms from 'ms'
import moment from 'moment'
import config from '@/config'
import { generateOTP } from '@/utils/reUseableFunctions'
import { v4 as uuid } from 'uuid'
import { encryptString } from './crypto'
import { sendEmailViaTemplate } from '@/controllers/utility/mail.controller'
import { compareString, hashString } from './security'
import { Security } from '@/models'

export const sendOtp = async (user, request, reply, identifier, subject = '', type, mode, session, otpCount) => {
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

        await Security.upsert({
            userId: user.id,
            type,
            mode,
            value: otpValueHash,
            expiresAt: otpExpiry,
            secret: otpSecret,
            securityCount: otpCount,
            otpRequestedAt: moment().toDate(),
        })

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
        request.log.error('OTP verification error:', error)
        return { status: false, message: 'Something went wrong' }
    }
}

export const verifyOtp = async (user, reply, cookies, otp, type, mode, session) => {
    try {
        if (isEmpty(cookies[session])) {
            return { status: false, message: 'Invalid cookie session' }
        }

        if (isEmpty(otp)) {
            return { status: false, message: 'Otp is required' }
        }

        const securityData = await Security.findOne({
            where: { userId: user.id, type, mode },
        })

        if (!securityData || isEmpty(securityData.secret)) {
            return { status: false, message: 'Otp verification failed, retry with new OTP' }
        }

        if (!(await compareString(securityData.secret, decodeURIComponent(cookies[session])))) {
            return { status: false, message: 'Invalid session' }
        }

        const now = moment()
        const otpResetTime = moment(securityData.otpRequestedAt).add(6, 'hours')

        if (securityData.tries >= 5 && now.isBefore(otpResetTime)) {
            const waitHours = otpResetTime.diff(now, 'hours')
            const waitMinutes = otpResetTime.diff(now, 'minutes') % 60
            return {
                status: false,
                message: `You have reached the maximum OTP tries. Please try again after ${waitHours} hours ${waitMinutes} minutes.`,
            }
        }

        if (!(await compareString(otp, securityData.value))) {
            await Security.update({ tries: securityData.tries + 1 }, { where: { userId: user.id, type, mode } })
            return { status: false, message: 'Invalid OTP' }
        }

        if (new Date() > securityData.expiresAt) {
            return { status: false, message: 'Your OTP has been expired' }
        }

        await Security.update(
            {
                value: '',
                expiresAt: null,
                secret: null,
                tries: 0,
                securityCount: 0,
                otpRequestedAt: null,
            },
            { where: { userId: user.id, type } },
        )

        reply.clearCookie(session)
        return { status: true }
    } catch (error) {
        console.error('OTP verification error:', error)
        return { status: false, message: 'Something went wrong' }
    }
}

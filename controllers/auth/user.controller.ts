import config from '@/config'
import { Security, Token, User } from '@/repositories'
import { sendOtp, verifyOtp } from '@/security/auth.security'
import { decryptString, encryptString } from '@/security/crypto'
import { comparePassword, generateJWTToken, generatePassword } from '@/security/security'
import { v4 as uuid } from 'uuid'
import isEmpty from 'is-empty'
import ms from 'ms'
import jwt from 'jsonwebtoken'
import { parsePhoneNumberWithError } from 'libphonenumber-js'
import { FastifyRequest, FastifyReply } from 'fastify'

interface SignupBody {
    name: string
    email: string
    companyName: string
    phone: string
    otpCount?: number
    password?: string
    token?: string
    otp?: string
}

interface CreatePasswordCookies {
    create_password_token?: string
}

interface RefreshTokenCookies {
    refreshToken?: string
}

export const signupSendOtp = async (req: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
    try {
        const { body } = req
        const otpCount = body.otpCount || 0

        const findUser = await User.findByEmail(body.email)
        console.log('findUser: ', findUser)

        if (!isEmpty(findUser) && findUser.isEmailVerified) {
            return reply.status(400).send({ success: false, message: 'User already exists with this email' })
        }

        try {
            const parsedPhone = parsePhoneNumberWithError(body.phone, 'IN')

            if (!parsedPhone.isValid() || !parsedPhone.isPossible()) {
                return reply.status(400).send({ success: false, errors: { phone: 'Invalid Phone number' } })
            }
        } catch (error) {
            console.error('error: ', error)
            return reply.status(400).send({ success: false, errors: { phone: 'Invalid Phone number' } })
        }

        const userPayload = {
            name: body.name,
            email: body.email,
            companyName: body.companyName,
            phone: body.phone,
        }

        let createUser: any = { id: findUser?.id, email: body.email }
        console.log('createUser: ', createUser)

        if (isEmpty(findUser)) {
            createUser = await User.create(userPayload)

            if (isEmpty(createUser)) {
                console.log('createUser: ', createUser)
                return reply.status(500).send({ success: false, message: 'Something went wrong' })
            }
        }

        const findSecurities = await Security.findOne({ userId: findUser?.id })

        if (!isEmpty(findUser) && !findUser.isEmailVerified && !isEmpty(findSecurities)) {
            await Security.update(
                { userId: findUser?.id, type: 'activation_mail' },
                {
                    value: '',
                    expiresAt: null,
                    secret: null,
                    tries: 0,
                    securityCount: 0,
                    otpRequestedAt: null,
                },
            )
        }

        const { status, message, token } = await sendOtp(
            { id: createUser.id, email: createUser.email },
            req,
            reply,
            'OTP_TEMPLATE',
            '',
            'activation_mail',
            'email',
            'email_otp_session',
            otpCount,
        )

        if (!status) {
            console.log('message: ', message)
            return reply.status(500).send({ success: false, message: 'Something went wrong while sending OTP' })
        }

        return reply.status(200).send({ success: true, message: 'OTP sent via email', mode: 'OTP_VERIFY', token })
    } catch (error) {
        console.log('error: ', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const verifySignupOtp = async (req: FastifyRequest<{ Body: { token: string; otp: string } }>, reply: FastifyReply) => {
    try {
        const { body, cookies } = req

        if (isEmpty(body?.token)) {
            return reply.status(400).send({ success: false, message: 'Invalid token' })
        }

        const decryptToken = JSON.parse(decryptString(body.token))
        console.log('decryptToken: ', decryptToken)
        if (isEmpty(decryptToken)) {
            return reply.status(400).send({ success: false, message: 'Invalid token' })
        }

        const { status, message } = await verifyOtp(
            { id: decryptToken.id },
            reply,
            cookies,
            body.otp,
            'activation_mail',
            'email',
            'email_otp_session',
        )

        if (!status) {
            return reply.status(400).send({ success: false, message })
        }

        const updatedCount = await User.updateById(decryptToken.id, { isEmailVerified: true })

        if (updatedCount === 0) {
            console.log('updatedCount: ', updatedCount)
            return reply.status(500).send({ success: false, message: 'Something went wrong' })
        }

        const cookieData = encryptString(JSON.stringify({ id: decryptToken.id }))
        const cookieConfig = {
            httpOnly: true,
            sameSite: 'none' as const,
            secure: true,
            partitioned: true,
        }

        reply
            .header('Access-Control-Allow-Origin', config.FRONTEND_USER)
            .header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
            .clearCookie('email_otp_session')
            .setCookie('create_password_token', cookieData, cookieConfig)

        return reply.status(201).send({
            success: true,
            message: 'Organization registered successfully',
            mode: 'CREATE_PASSWORD',
        })
    } catch (error) {
        console.error('error: ', error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const resendOtp = async (req: FastifyRequest<{ Body: { token: string } } & { otpCount?: number }>, reply: FastifyReply) => {
    try {
        const { body } = req

        if (isEmpty(body.token)) {
            return reply.status(400).send({ success: false, message: 'Token is required' })
        }

        const tokenId = JSON.parse(decryptString(body.token))
        const user = await User.findById(tokenId?.id)

        if (isEmpty(user)) {
            console.log('user: ', user)
            return reply.status(400).send({ success: false, message: 'Invalid token' })
        }

        const securityData = await Security.findOne({ userId: user.id, type: tokenId?.type, mode: tokenId?.mode })

        if (isEmpty(securityData)) {
            console.log('securityData: ', securityData)
            return reply.status(404).send({ success: false, message: 'Security not found' })
        }

        if (securityData.expiresAt && securityData.expiresAt.getTime() - new Date().getTime() > ms('8m')) {
            return reply.status(400).send({ success: false, message: 'Please try requesting OTP after two minutes' })
        }

        const { status, message } = await sendOtp(
            { id: tokenId.id, email: tokenId.email },
            req,
            reply,
            'OTP_TEMPLATE',
            '',
            'activation_mail',
            'email',
            'email_otp_session',
            0,
        )

        if (!status) {
            console.log('message: ', message)
            return reply.status(500).send({ success: false, message: 'Something went wrong while sending otp' })
        }
        return reply.status(201).send({ success: true, message: 'OTP has been successfully resent to your email', mode: 'VERIFY_SIGNUP' })
    } catch (error) {
        console.error(error)
        return reply.status(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const createPassword = async (req: FastifyRequest<{ Body: { password: string }; Cookies: CreatePasswordCookies }>, reply: FastifyReply) => {
    try {
        const { body, cookies } = req

        if (isEmpty(cookies.create_password_token)) {
            console.log('Invalid session: missing create_password_token: ')
            return reply.code(400).send({ success: false, message: 'Invalid session' })
        }

        const decryptData = JSON.parse(decryptString(cookies.create_password_token as string))

        if (isEmpty(decryptData)) {
            console.log('decryptData: ', decryptData)
            return reply.code(400).send({ success: false, message: 'Invalid session' })
        }

        const userData = await User.findById(decryptData.id)

        if (isEmpty(userData)) {
            console.log('userData: ', userData)
            return reply.code(404).send({ success: false, message: 'User not found' })
        }

        let findSecurity = await Security.findOne({ userId: userData.id })
        if (isEmpty(findSecurity)) {
            const secPayload = {
                userId: userData.id,
                type: 'activation_mail',
            }

            findSecurity = await Security.create(secPayload)

            if (isEmpty(findSecurity)) {
                console.log('findSecurity: ', findSecurity)
                return reply.code(500).send({ success: false, message: 'Something went wrong' })
            }
        }

        const hashPassword = await generatePassword(body?.password)
        if (isEmpty(hashPassword)) {
            console.log('hashPassword: ', hashPassword)
            return reply.code(500).send({ success: false, message: 'Something went wrong' })
        }

        const updateUser = await User.updateById(userData.id, {
            password: hashPassword,
            isEmailVerified: true,
        })

        if (isEmpty(updateUser)) {
            console.log('updateUser: ', updateUser)
            return reply.code(500).send({ success: false, message: 'Something went wrong' })
        }

        const sessionId = uuid()
        const jwtPayload = { sessionId, id: userData.id }

        const accessToken = generateJWTToken(jwtPayload, false)
        const refreshToken = generateJWTToken(jwtPayload, true)

        const createToken = await Token.create({
            userId: userData.id,
            sessionId,
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + ms(config.REFRESH_TOKEN_EXPIRATION as ms.StringValue)),
        })

        if (isEmpty(createToken)) {
            console.log('createToken: ', createToken)
            return reply.code(500).send({ success: false, message: 'Something went wrong' })
        }

        reply
            .setCookie('refreshToken', refreshToken, {
                maxAge: ms(config.REFRESH_TOKEN_EXPIRATION as ms.StringValue) / 1000,
                httpOnly: true,
                sameSite: 'none' as const,
                secure: true,
                partitioned: true,
            })
            .clearCookie('create_password_token')

        reply.header('Access-Control-Allow-Origin', config.FRONTEND_USER)
        reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

        return reply.code(200).send({
            success: true,
            message: 'Password created successfully',
            mode: 'HOME',
            accessToken,
        })
    } catch (error) {
        console.error('error: ', error)
        return reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const signin = async (req: FastifyRequest<{ Body: { email: string; password: string } }>, reply: FastifyReply) => {
    try {
        const { body } = req

        const user = await User.findByEmail(body.email)
        console.log('user: ', user)

        if (isEmpty(user)) {
            console.log('user: ', user)
            return reply.code(400).send({ success: false, message: 'No user exists with this email' })
        }

        if (!user.isEmailVerified) {
            return reply.code(400).send({
                success: false,
                message: 'E-mail was not verified, please signUp to continue',
                mode: 'SIGNUP',
            })
        }

        const passwordCheck = await comparePassword(body.password, user.password)
        if (!passwordCheck) {
            return reply.code(400).send({ success: false, message: 'Password is incorrect' })
        }

        const userSecurity = await Security.findOne({ userId: user.id })
        if (isEmpty(userSecurity)) {
            console.log('userSecurity: ', userSecurity)
            return reply.code(404).send({ success: false, message: 'Security info not found' })
        }

        const sessionId = uuid()
        const accessToken = generateJWTToken({ sessionId, id: user.id }, false)
        const refreshToken = generateJWTToken({ sessionId, id: user.id }, true)

        await Token.create({
            userId: user.id,
            sessionId,
            accessToken,
            refreshToken,
            expiresAt: new Date(Date.now() + ms(config.REFRESH_TOKEN_EXPIRATION as ms.StringValue)),
        })

        reply.setCookie('refreshToken', refreshToken, {
            maxAge: ms(config.REFRESH_TOKEN_EXPIRATION as ms.StringValue) / 1000,
            httpOnly: true,
            sameSite: 'none' as const,
            secure: true,
            partitioned: true,
        })

        reply.header('Access-Control-Allow-Origin', config.FRONTEND_USER)
        reply.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')

        return reply.code(201).send({
            success: true,
            message: 'Signed-In successfully',
            sessionId,
            accessToken,
        })
    } catch (error) {
        console.error('error: ', error)
        return reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

export const refreshToken = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const { cookies } = req

        if (isEmpty(cookies.refreshToken)) {
            return reply.code(401).send({ success: false, message: 'Unauthorized' })
        }

        const storedToken = await Token.findByRefreshToken(cookies?.refreshToken as string)

        if (isEmpty(storedToken)) {
            return reply.code(401).send({ success: false, message: 'Unauthorized' })
        }

        if (new Date() > new Date(storedToken.expiresAt)) {
            await Token.deleteByRefreshToken(cookies?.refreshToken as string)

            reply.clearCookie('refreshToken')
            return reply.code(403).send({ success: false, message: 'Refresh token expired' })
        }

        let decoded: any = null
        try {
            decoded = jwt.verify(cookies.refreshToken as string, config.JWT_SECRET)
            console.log('decoded: ', decoded)

            if (isEmpty(decoded)) {
                return reply.code(401).send({ success: false, message: 'Unauthorized' })
            }
        } catch (error) {
            console.log('error: ', error)
            return reply.code(403).send({ success: false, message: 'Invalid refresh token' })
        }

        const user = await User.findById(decoded.id)

        if (isEmpty(user)) {
            return reply.code(404).send({ success: false, message: 'User not found' })
        }

        const newAccessToken = generateJWTToken(
            {
                sessionId: storedToken.sessionId,
                id: user.id,
            },
            false,
        )

        await Token.updateAccessToken(cookies?.refreshToken as string, newAccessToken)

        return reply.code(200).send({ success: true, message: 'New access token generated', accessToken: newAccessToken })
    } catch (error) {
        console.log('error: ', error)
        return reply.code(500).send({ success: false, message: 'Something went wrong' })
    }
}

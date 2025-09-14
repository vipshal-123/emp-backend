import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import config from '@/config'
import ms from 'ms'

export const generatePassword = async (password: string) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    return hashedPassword
}

export const comparePassword = async (password: string, hashedPassword: string) => {
    const isMatch = await bcrypt.compare(password, hashedPassword)
    return isMatch
}

export const generateJWTToken = (payload: any, isRefreshToken: boolean = false): string => {
    const durationStr = isRefreshToken ? (config.REFRESH_TOKEN_EXPIRATION as string) : (config.ACCESS_TOKEN_EXPIRATION as string)

    const durationMs = ms(durationStr as ms.StringValue)
    if (!durationMs) {
        throw new Error(`Invalid duration string: ${durationStr}`)
    }

    const token = jwt.sign(payload, config.JWT_SECRET, {
        expiresIn: Math.floor(durationMs / 1000),
    })

    return token
}

export const hashString = async (string: string) => {
    const salt = await bcrypt.genSalt(10)
    const hashedString = await bcrypt.hash(string, salt)
    return hashedString
}

export const compareString = async (string: string, hashedString: string) => {
    const isMatch = await bcrypt.compare(string, hashedString)
    return isMatch
}

import crypto from 'crypto'

export function generateOTP() {
    return crypto.randomInt(100000, 999999).toString()
}

export function generateRandomNumbers() {
    return crypto.randomInt(10000, 99999).toString()
}

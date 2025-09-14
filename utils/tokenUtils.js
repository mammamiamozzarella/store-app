import crypto from 'crypto'
import dotenv from 'dotenv'

dotenv.config()

function base64url(input) {
    return Buffer.from(input)
        .toString('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
}

function base64urlDecode(input) {
    input = input.replace(/-/g, '+').replace(/_/g, '/')
    while (input.length % 4) {
        input += '='
    }
    return Buffer.from(input, 'base64').toString('utf8')
}

export const createJWT = (payload) => {
    const header = {
        alg: 'HS256',
        typ: 'JWT',
    }
    const expiresIn = process.env.JWT_LIFETIME

    const currentTime = Math.floor(Date.now() / 1000)
    let exp

    if (typeof expiresIn === 'string' && expiresIn.endsWith('h')) {
        exp = currentTime + parseInt(expiresIn) * 60 * 60
    } else if (typeof expiresIn === 'string' && expiresIn.endsWith('m')) {
        exp = currentTime + parseInt(expiresIn) * 60
    } else {
        exp = currentTime + 3600
    }

    const extendedPayload = { ...payload, exp }

    const headerEncoded = base64url(JSON.stringify(header))
    const payloadEncoded = base64url(JSON.stringify(extendedPayload))

    const signature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

    return `${headerEncoded}.${payloadEncoded}.${signature}`
}

export const verifyJWT = (token) => {
    const [headerEncoded, payloadEncoded, signature] = token.split('.')

    const checkSignature = crypto
        .createHmac('sha256', process.env.JWT_SECRET)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('base64')
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')

    if (checkSignature !== signature) {
        throw new Error('Invalid signature')
    }

    let header, payload

    try {
        header = JSON.parse(base64urlDecode(headerEncoded))
        payload = JSON.parse(base64urlDecode(payloadEncoded))
    } catch {
        throw new Error('Invalid token format')
    }

    if (header.alg !== 'HS256') {
        throw new Error('Unsupported algorithm')
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired')
    }

    return payload
}

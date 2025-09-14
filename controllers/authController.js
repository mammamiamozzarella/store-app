import { StatusCodes } from 'http-status-codes'
import pool from '../db.js'
import { hashPassword, comparePassword } from '../utils/passwordUtils.js'
import { UnauthenticatedError } from '../errors/customErrors.js'
import { createJWT } from '../utils/tokenUtils.js'

export const register = async (req, res) => {
    const { name, email, password } = req.body
    const hashedPassword = await hashPassword(password)

    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3) RETURNING id, name, email, created_at`,
        [name, email, hashedPassword]
    )

    const user = result.rows[0]

    res.status(StatusCodes.CREATED).json({ user })
}

export const login = async (req, res) => {
    const { email, password } = req.body

    const result = await pool.query(
        'SELECT id, name, email, hashed_password FROM users WHERE email = $1',
        [email]
    )

    const user = result.rows[0]

    const isValidUser =
        user && (await comparePassword(password, user.hashed_password))
    if (!isValidUser) throw new UnauthenticatedError('invalid credentials')

    const token = createJWT({ userId: user.id, email: user.email })

    const oneDay = 1000 * 60 * 60 * 24

    res.cookie('token', token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === 'production',
    })

    res.status(StatusCodes.CREATED).json({ msg: 'user logged in' })
}

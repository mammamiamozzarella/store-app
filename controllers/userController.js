import { StatusCodes } from 'http-status-codes'
import pool from '../db.js'

export const getCurrentUser = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, role
             FROM users
             WHERE id = $1`,
            [req.user.userId],
        )

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'User not found' })
        }

        res.status(StatusCodes.OK).json({ user: result.rows[0] })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

export const updateUser = async (req, res) => {
    try {
        const { name, email } = req.body

        const result = await pool.query(
            `UPDATE users
             SET name  = COALESCE($1, name),
                 email = COALESCE($2, email)
             WHERE id = $3 RETURNING id, name, email, role`,
            [name, email, req.user.userId],
        )

        res.status(StatusCodes.OK).json({ msg: 'User updated', user: result.rows[0] })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

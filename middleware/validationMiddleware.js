import { body, validationResult } from 'express-validator'
import { BadRequestError } from '../errors/customErrors'
import pool from '../db.js'

const withValidationErrors = (validateValues) => {
    return [
        validateValues,
        (req, res, next) => {
            const errors = validationResult(req)
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => error.msg)
                throw new BadRequestError(errorMessages)
            }
            next()
        },
    ]
}

export const validateRegisterInput = withValidationErrors([
    body('name').notEmpty().withMessage('name is required'),
    body('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('invalid email format')
        .custom(async (email) => {
            const result = await pool.query(
                'SELECT id FROM users WHERE email = $1',
                [email]
            )
            if (result.rows.length > 0) {
                throw new BadRequestError('email already exists')
            }
        }),
    body('password')
        .notEmpty()
        .withMessage('password is required')
        .isLength({ min: 8 })
        .withMessage('password must be at least 8 characters long'),
    body('location').notEmpty().withMessage('location is required'),
    body('lastName').notEmpty().withMessage('last name is required'),
])

export const validateLoginInput = withValidationErrors([
    body('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('invalid email format'),
    body('password').notEmpty().withMessage('password is required'),
])

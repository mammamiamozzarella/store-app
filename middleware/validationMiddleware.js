import { body, validationResult } from 'express-validator'
import { BadRequestError } from '../errors/customErrors.js'
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
        .withMessage('password must be at least 8 characters long')
])

export const validateLoginInput = withValidationErrors([
    body('email')
        .notEmpty()
        .withMessage('email is required')
        .isEmail()
        .withMessage('invalid email format'),
    body('password').notEmpty().withMessage('password is required'),
])

export const validateProductInput = withValidationErrors([
    body('category_id')
        .notEmpty()
        .withMessage('category_id is required')
        .custom(async (category_id) => {
            const result = await pool.query(
                'SELECT id FROM categories WHERE id = $1',
                [category_id]
            )
            if (result.rows.length === 0) {
                throw new BadRequestError('category_id does not exist')
            }
        }),
    body('name').notEmpty().withMessage('name is required'),
    body('description').notEmpty().withMessage('description is required'),
    body('price')
        .notEmpty()
        .withMessage('price is required')
        .isFloat({ gt: 0 })
        .withMessage('price must be a positive number'),
    body('stock')
        .notEmpty()
        .withMessage('stock is required')
        .isInt({ gt: -1 })
        .withMessage('stock must be a non-negative integer'),
    body('attributes')
        .optional()
        .isArray()
        .withMessage('attributes must be an array'),
    body('attributes.*.attribute_name')
        .notEmpty()
        .withMessage('attribute_name is required for each attribute'),
    body('attributes.*.attribute_value')
        .notEmpty()
        .withMessage('attribute_value is required for each attribute'),
])

export const validateProductUpdateInput = withValidationErrors([
    body('id')
        .optional()
        .isUUID()
        .withMessage('id must be a valid UUID')
        .custom(async (id) => {
            const result = await pool.query(
                'SELECT id FROM products WHERE id = $1',
                [id]
            )
            if (result.rows.length === 0) {
                throw new BadRequestError('product_id does not exist')
            }
        })
])

export const validateCategoryInput = withValidationErrors([
    body('name')
        .notEmpty()
        .withMessage('name is required')
        .isLength({ max: 100 })
        .withMessage('name must be less than 100 characters'),
    body('description')
        .notEmpty()
        .withMessage('description is required'),
]);

export const validateCategoryUpdateInput = withValidationErrors([
    body('id')
        .optional()
        .isUUID()
        .withMessage('id must be a valid UUID')
        .custom(async (id) => {
            const result = await pool.query(
                'SELECT id FROM categories WHERE id = $1',
                [id]
            );
            if (result.rows.length === 0) {
                throw new BadRequestError('category_id does not exist');
            }
        })
]);

export const validateAdminAction = withValidationErrors([
    body('role')
        .custom((_, { req }) => {
            if (!req.user || req.user.role !== 'admin') {
                throw new BadRequestError('Access denied. Admins only.');
            }
            return true;
        })
]);

import pool from '../db.js'
import { StatusCodes } from 'http-status-codes'

export const getAllProducts = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT p.*, c.name as category_name
            FROM products p
                     LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.created_at DESC
        `)
        res.status(StatusCodes.OK).json({ products: result.rows })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

export const getProduct = async (req, res) => {
    try {
        const { id } = req.params

        const productResult = await pool.query(
            `SELECT *
             FROM products
             WHERE id = $1`,
            [id],
        )
        if (productResult.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Product not found' })
        }

        const attributesResult = await pool.query(
            `SELECT attribute_name, attribute_value
             FROM product_attributes
             WHERE product_id = $1`,
            [id],
        )

        const product = productResult.rows[0]
        product.attributes = attributesResult.rows

        res.status(StatusCodes.OK).json({ product })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

export const createProduct = async (req, res) => {
    const client = await pool.connect()
    try {
        const { category_id, name, description, price, stock, attributes = [] } = req.body

        await client.query('BEGIN')

        const productResult = await client.query(
            `INSERT INTO products (category_id, name, description, price, stock)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [category_id, name, description, price, stock],
        )

        const product = productResult.rows[0]

        for (const attr of attributes) {
            await client.query(
                `INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                 VALUES ($1, $2, $3)`,
                [product.id, attr.attribute_name, attr.attribute_value],
            )
        }

        await client.query('COMMIT')

        res.status(StatusCodes.CREATED).json({ product })
    } catch (err) {
        await client.query('ROLLBACK')
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    } finally {
        client.release()
    }
}

export const updateProduct = async (req, res) => {
    const client = await pool.connect()
    try {
        const { id } = req.params
        const { category_id, name, description, price, stock, attributes = [] } = req.body

        await client.query('BEGIN')

        const productResult = await client.query(
            `UPDATE products
             SET category_id = $1,
                 name = $2,
                 description = $3,
                 price = $4,
                 stock = $5,
                 updated_at = NOW()
             WHERE id = $6 RETURNING *`,
            [category_id, name, description, price, stock, id],
        )

        if (productResult.rows.length === 0) {
            await client.query('ROLLBACK')
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Product not found' })
        }

        const product = productResult.rows[0]

        await client.query(`DELETE
                            FROM product_attributes
                            WHERE product_id = $1`, [id])

        for (const attr of attributes) {
            await client.query(
                `INSERT INTO product_attributes (product_id, attribute_name, attribute_value)
                 VALUES ($1, $2, $3)`,
                [id, attr.attribute_name, attr.attribute_value],
            )
        }

        await client.query('COMMIT')

        res.status(StatusCodes.OK).json({ product })
    } catch (err) {
        await client.query('ROLLBACK')
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    } finally {
        client.release()
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params

        const result = await pool.query(
            `DELETE
             FROM products
             WHERE id = $1 RETURNING *`,
            [id],
        )

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Product not found' })
        }

        res.status(StatusCodes.OK).json({ msg: 'Product deleted', product: result.rows[0] })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

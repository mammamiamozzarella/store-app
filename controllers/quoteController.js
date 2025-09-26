import pool from '../db.js'
import { StatusCodes } from 'http-status-codes'

export const addToCart = async (req, res) => {
    const client = await pool.connect()
    try {
        const { userId } = req.user
        const { product_id, qty } = req.body

        await client.query('BEGIN')

        let quoteResult = await client.query(
            `SELECT id
             FROM quote
             WHERE user_id = $1`,
            [userId],
        )

        let quoteId
        if (quoteResult.rows.length === 0) {
            const newQuote = await client.query(
                `INSERT INTO quote (user_id)
                 VALUES ($1) RETURNING id`,
                [userId],
            )
            quoteId = newQuote.rows[0].id
        } else {
            quoteId = quoteResult.rows[0].id
        }

        const existingItem = await client.query(
            `SELECT id, qty
             FROM quote_item
             WHERE quote_id = $1
               AND product_id = $2`,
            [quoteId, product_id],
        )

        if (existingItem.rows.length > 0) {
            await client.query(
                `UPDATE quote_item
                 SET qty = qty + $1
                 WHERE id = $2`,
                [qty, existingItem.rows[0].id],
            )
        } else {
            await client.query(
                `INSERT INTO quote_item (quote_id, product_id, qty)
                 VALUES ($1, $2, $3)`,
                [quoteId, product_id, qty],
            )
        }

        await client.query('COMMIT')
        res.status(StatusCodes.OK).json({ message: 'Added to cart', quoteId })
    } catch (err) {
        await client.query('ROLLBACK')
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: err.message })
    } finally {
        client.release()
    }
}

export const getCart = async (req, res) => {
    try {
        const { userId } = req.user

        const result = await pool.query(
            `SELECT qi.id, qi.qty, p.name, p.price
             FROM quote q
                      JOIN quote_item qi ON q.id = qi.quote_id
                      JOIN products p ON qi.product_id = p.id
             WHERE q.user_id = $1`,
            [userId],
        )

        res.status(StatusCodes.OK).json({ items: result.rows })
    } catch (err) {
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: err.message })
    }
}

import pool from '../db.js'
import { StatusCodes } from 'http-status-codes'

export const getAllOrders = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT o.id,
                    o.user_id,
                    o.total_price,
                    o.status,
                    o.created_at,
                    json_agg(json_build_object(
                            'product_id', oi.product_id,
                            'qty', oi.qty,
                            'price', oi.price
                             )) AS items
             FROM orders o
                      LEFT JOIN order_item oi ON o.id = oi.order_id
             WHERE o.user_id = $1
             GROUP BY o.id
             ORDER BY o.created_at DESC`,
            [req.user.userId],
        )

        res.status(StatusCodes.OK).json({ orders: result.rows })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

export const placeOrder = async (req, res) => {
    const client = await pool.connect()
    try {
        const { userId } = req.user

        await client.query('BEGIN')

        const cartItems = await client.query(
            `SELECT qi.product_id, qi.qty, p.price
             FROM quote q
                      JOIN quote_item qi ON q.id = qi.quote_id
                      JOIN products p ON qi.product_id = p.id
             WHERE q.user_id = $1`,
            [userId],
        )

        if (cartItems.rows.length === 0) {
            await client.query('ROLLBACK')
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json({ msg: 'Cart is empty' })
        }

        let totalPrice = 0
        cartItems.rows.forEach((item) => {
            totalPrice += item.qty * item.price
        })

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, total_price)
             VALUES ($1, $2) RETURNING *`,
            [userId, totalPrice],
        )

        const order = orderResult.rows[0]

        for (const item of cartItems.rows) {
            await client.query(
                `INSERT INTO order_item (order_id, product_id, qty, price)
                 VALUES ($1, $2, $3, $4)`,
                [order.id, item.product_id, item.qty, item.price],
            )
        }

        await client.query(
            `DELETE
             FROM quote_item
             WHERE quote_id IN (SELECT id FROM quote WHERE user_id = $1)`,
            [userId],
        )

        await client.query('COMMIT')

        res.status(StatusCodes.CREATED).json({ order })
    } catch (err) {
        await client.query('ROLLBACK')
        res
            .status(StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: err.message })
    } finally {
        client.release()
    }
}

export const updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params
        const { status } = req.body

        const result = await pool.query(
            `UPDATE orders
             SET status = $1
             WHERE id = $2 RETURNING *`,
            [status, orderId],
        )

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Order not found' })
        }

        res.status(StatusCodes.OK).json({ order: result.rows[0] })
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message })
    }
}

import pool from '../db.js';
import { StatusCodes } from 'http-status-codes';

export const getAllCategories = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM categories ORDER BY created_at DESC`);
        res.status(StatusCodes.OK).json({ categories: result.rows });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

export const getCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const categoryResult = await pool.query(`SELECT * FROM categories WHERE id = $1`, [id]);
        if (categoryResult.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Category not found' });
        }

        const productsResult = await pool.query(
            `SELECT p.*, c.name as category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = $1
       ORDER BY p.created_at DESC`,
            [id]
        );

        const category = categoryResult.rows[0];
        category.products = productsResult.rows;

        res.status(StatusCodes.OK).json({ category });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

export const createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;

        const result = await pool.query(
            `INSERT INTO categories (name, description)
       VALUES ($1, $2)
       RETURNING *`,
            [name, description]
        );

        res.status(StatusCodes.CREATED).json({ category: result.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const result = await pool.query(
            `UPDATE categories
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
            [name, description, id]
        );

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Category not found' });
        }

        res.status(StatusCodes.OK).json({ category: result.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM categories WHERE id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(StatusCodes.NOT_FOUND).json({ msg: 'Category not found' });
        }

        res.status(StatusCodes.OK).json({ msg: 'Category deleted', category: result.rows[0] });
    } catch (err) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message });
    }
};

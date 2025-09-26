import request from 'supertest';
import app from '../app.js';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

describe('Product Controller - Create Product', () => {
    let adminToken;
    let categoryId;
    let productId;

    beforeAll(async () => {
        await pool.query(`DELETE FROM users WHERE email = 'admin1@example.com'`);
        await pool.query(`DELETE FROM categories WHERE name = 'Test Category'`);

        const hashedPassword = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ('Admin User', 'admin1@example.com', $1, 'admin')`,
            [hashedPassword]
        );

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin1@example.com', password: 'admin123' });

        adminToken = loginRes.body.token;

        const categoryRes = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', [`token=${adminToken}`])
            .send({ name: 'Test Category', description: 'Test description' });

        categoryId = categoryRes.body.category.id;
    }, 20000);

    afterAll(async () => {
        await pool.query(`DELETE FROM products WHERE name = 'Test Product'`);
        await pool.query(`DELETE FROM categories WHERE id = $1`, [categoryId]);
        await pool.query(`DELETE FROM users WHERE email = 'admin1@example.com'`);
        await pool.end();
    });

    it('should create a new product', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                category_id: categoryId,
                name: 'Test Product',
                description: 'Product description',
                price: 9.99,
                stock: 10,
                attributes: [
                    { attribute_name: 'Color', attribute_value: 'Red' },
                    { attribute_name: 'Size', attribute_value: 'M' }
                ]
            });

        expect(res.statusCode).toBe(StatusCodes.CREATED);
        expect(res.body.product).toHaveProperty('id');
        expect(res.body.product.name).toBe('Test Product');
        productId = res.body.product.id;
    }, 10000);

    it('should return 400 for invalid product data', async () => {
        const res = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send({})

        expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST)
        expect(res.body.msg).toContain('category_id is required')
        expect(res.body.msg).toContain('name is required')
        expect(res.body.msg).toContain('description is required')
    });
});

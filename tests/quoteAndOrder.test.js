import request from 'supertest';
import app from '../app.js';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

describe('Cart & Order flow', () => {
    let adminToken;
    let userToken;
    let categoryId;
    let productId;

    beforeAll(async () => {
        await pool.query(`DELETE FROM users WHERE email IN ('admin2@example.com','user1@example.com')`);
        await pool.query(`DELETE FROM categories WHERE name = 'CartTest Category'`);

        const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ('Admin2', 'admin2@example.com', $1, 'admin')`,
            [hashedPasswordAdmin]
        );

        const adminLoginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin2@example.com', password: 'admin123' });

        adminToken = adminLoginRes.body.token;

        const categoryRes = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', [`token=${adminToken}`])
            .send({ name: 'CartTest Category', description: 'Category for cart tests' });

        categoryId = categoryRes.body.category.id;

        const productRes = await request(app)
            .post('/api/v1/products')
            .set('Cookie', [`token=${adminToken}`])
            .send({
                category_id: categoryId,
                name: 'CartTest Product',
                description: 'Product for cart tests',
                price: 50,
                stock: 20
            });

        productId = productRes.body.product.id;

        const hashedPasswordUser = await bcrypt.hash('user123', 10);
        await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ('User1', 'user1@example.com', $1, 'user')`,
            [hashedPasswordUser]
        );

        const userLoginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'user1@example.com', password: 'user123' });

        userToken = userLoginRes.body.token;
    }, 20000);

    afterAll(async () => {
        await pool.query(`DELETE FROM order_item WHERE product_id = $1`, [productId]);
        await pool.query(`DELETE FROM orders WHERE user_id = (SELECT id FROM users WHERE email='user1@example.com')`);
        await pool.query(`DELETE FROM quote_item WHERE product_id = $1`, [productId]);
        await pool.query(`DELETE FROM quote WHERE user_id = (SELECT id FROM users WHERE email='user1@example.com')`);
        await pool.query(`DELETE FROM products WHERE id = $1`, [productId]);
        await pool.query(`DELETE FROM categories WHERE id = $1`, [categoryId]);
        await pool.query(`DELETE FROM users WHERE email IN ('admin2@example.com','user1@example.com')`);
        await pool.end();
    });

    it('should add product to cart and place order', async () => {
        const addRes = await request(app)
            .post('/api/v1/quote/add')
            .set('Cookie', [`token=${userToken}`])
            .send({ product_id: productId, qty: 2 });

        expect(addRes.statusCode).toBe(StatusCodes.OK);
        expect(addRes.body).toHaveProperty('quoteId');

        const cartRes = await request(app)
            .get('/api/v1/quote')
            .set('Cookie', [`token=${userToken}`]);

        expect(cartRes.statusCode).toBe(StatusCodes.OK);
        expect(cartRes.body.items.length).toBe(1);
        expect(cartRes.body.items[0].qty).toBe(2);

        const orderRes = await request(app)
            .post('/api/v1/order')
            .set('Cookie', [`token=${userToken}`])
            .send();

        expect(orderRes.statusCode).toBe(StatusCodes.CREATED);
        expect(orderRes.body.order).toHaveProperty('id');
        expect(Number(orderRes.body.order.total_price)).toBeCloseTo(100.00, 2);

        const ordersRes = await request(app)
            .get('/api/v1/order')
            .set('Cookie', [`token=${userToken}`]);

        expect(ordersRes.statusCode).toBe(StatusCodes.OK);
        expect(ordersRes.body.orders.length).toBeGreaterThan(0);
    }, 20000);
});

import request from 'supertest';
import app from '../app.js';
import pool from '../db.js';
import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';

describe('Category Controller - CRUD', () => {
    let adminToken;
    let categoryId;

    beforeAll(async () => {
        await pool.query(`DELETE FROM users WHERE email = 'admin@example.com'`);

        const hashedPassword = await bcrypt.hash('admin123', 10);

        await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ('Admin User', 'admin@example.com', $1, 'admin')`,
            [hashedPassword]
        );

        const loginRes = await request(app)
            .post('/api/v1/auth/login')
            .send({ email: 'admin@example.com', password: 'admin123' });

        adminToken = loginRes.body.token;
    }, 20000);

    afterAll(async () => {
        await pool.query(`DELETE FROM users WHERE email = 'admin@example.com'`);
        await pool.query(`DELETE FROM categories WHERE id = $1`, [categoryId]);
        await pool.end();
    });

    it('should create a new category', async () => {
        const res = await request(app)
            .post('/api/v1/categories')
            .set('Cookie', [`token=${adminToken}`])
            .send({ name: 'Test Category', description: 'Test description' });

        expect(res.statusCode).toBe(StatusCodes.CREATED);
        expect(res.body.category).toHaveProperty('id');
        categoryId = res.body.category.id;
    });

    it('should get category by id', async () => {
        const res = await request(app)
            .get(`/api/v1/categories/${categoryId}`)
            .set('Cookie', [`token=${adminToken}`]);

        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body.category).toHaveProperty('id', categoryId);
    });

    it('should update category', async () => {
        const res = await request(app)
            .patch(`/api/v1/categories/${categoryId}`)
            .set('Cookie', [`token=${adminToken}`])
            .send({ name: 'Updated Category', description: 'Updated description' });

        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body.category.name).toBe('Updated Category');
    });

    it('should delete category', async () => {
        const res = await request(app)
            .delete(`/api/v1/categories/${categoryId}`)
            .set('Cookie', [`token=${adminToken}`]);

        expect(res.statusCode).toBe(StatusCodes.OK);
        expect(res.body).toHaveProperty('msg', 'Category deleted');
    });
});

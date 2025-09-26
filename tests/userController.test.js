import request from 'supertest'
import app from '../app.js'
import pool from '../db.js'
import { createJWT } from '../utils/tokenUtils.js'
import { hashPassword } from '../utils/passwordUtils.js'

describe('User Controller', () => {
    let token
    let testUserId

    beforeAll(async () => {
        const passwordHash = await hashPassword('password123')
        const res = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
            ['Test User', 'test@example.com', passwordHash, 'user']
        )
        testUserId = res.rows[0].id

        token = createJWT({ userId: testUserId, email: 'test@example.com' })
    })

    afterAll(async () => {
        await pool.query(`DELETE FROM users WHERE id = $1`, [testUserId])
        await pool.end()
    })

    it('should return current user', async () => {
        const res = await request(app)
            .get('/api/v1/user/account')
            .set('Cookie', [`token=${token}`])

        expect(res.statusCode).toBe(200)
        expect(res.body.user).toHaveProperty('id')
        expect(res.body.user.email).toBe('test@example.com')
    }, 10000)
})

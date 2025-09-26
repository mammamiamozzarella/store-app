import express from 'express'
import morgan from 'morgan'
import * as dotenv from 'dotenv'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()

// Middleware
app.use(express.json())
app.use(cookieParser())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

// Routers
import authRouter from './routers/authRouter.js'
import productRouter from './routers/productRouter.js'
import categoryRouter from './routers/categoryRouter.js'
import quoteRouter from './routers/quoteRouter.js'
import orderRouter from './routers/orderRouter.js'
import userRouter from './routers/userRouter.js'

app.use('/api/v1/auth', authRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/categories', categoryRouter)
app.use('/api/v1/quote', quoteRouter)
app.use('/api/v1/order', orderRouter)
app.use('/api/v1/user', userRouter)

app.use('*', (req, res) => {
    res.status(404).json({ msg: 'not found' })
})

app.use((err, req, res, next) => {
    console.log(err)
    if (err.statusCode) {
        return res.status(err.statusCode).json({ msg: err.message })
    }
    res.status(500).json({ msg: 'something went wrong' })
})


export default app

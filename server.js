import express from 'express'
const app = express()
import morgan from 'morgan'
import * as dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
app.use(cookieParser())

//routers
import authRouter from './routers/authRouter.js'

dotenv.config()

app.use(express.json())

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}

app.use('/api/v1/auth', authRouter)

app.use('*', (req, res) => {
    res.status(404).json({ msg: 'not found' })
})

app.use((err, req, res, next) => {
    console.log(err)
    res.status(500).json({ msg: 'something went wrong' })
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`server running on PORT ${port}....`)
})

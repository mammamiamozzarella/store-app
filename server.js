import app from './app.js'

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`server running on PORT ${port}....`)
})

export default app

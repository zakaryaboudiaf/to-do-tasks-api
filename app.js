require('dotenv').config()
const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const swagger = require('swagger-ui-express')
const { connectDB } = require("./src/Database")
const { notFoundMiddleware , errorHandlerMiddleware } = require("./src/Middlewares")

/*
==================================================================================
    API Documentation
==================================================================================
 */
const routes = require('./src/Routes')
const yaml = require('yamljs')
const swaggerDocument = yaml.load('./swagger.yaml')



const app = express()

app.set('trusr proxy' , 1)

app.use(rateLimit({
    windowMs : 15 * 60 * 1000,
    max : 100
}))

app.use(express.json())
app.use(helmet())
app.use(cors())
app.use(xss())

app.get('/' , (req , res) => {
    res.send('<h1>To Do Tasks API</h1><a href="/api-docs" >Documentation</a>')
})

app.use('/api-docs' , swagger.serve , swagger.setup(swaggerDocument))

app.use('/api/v1' , routes)
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)




var port = process.env.PORT || 5000


const start = async () => {
    try{
        await connectDB(process.env.MONGO_URI)
        console.log('The DB is connected')
        app.listen(port , () => {
            console.log(`The server is listenning on port ${port}...`)
        })

    }catch (error) {
        console.log(error)
    }
} 


start()




    

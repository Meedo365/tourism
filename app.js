require("dotenv").config()
const touristRouter = require("./src/router/touristRoute")
const authRouter = require("./src/router/authRoute")
const bookingRouter = require("./src/router/bookingRoute")
const reviewRouter = require("./src/router/reviewRoute")
const usersRouter = require("./src/router/userRoute")
const errorHandler = require("./src/middleware/errorHandler")
const cookieParser = require("cookie-parser")
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require("helmet")
const xss = require("xss-clean")
const rateLimit = require('express-rate-limit')
const hpp = require("hpp")
const cors = require("cors")


const express = require("express")
const app = express()
const connectDb = require("./config/config")
app.use(express.urlencoded({extended:false}))
app.use(express.json())
app.use(cookieParser())

// sanitize data
app.use(mongoSanitize())

// set security headers
app.use(helmet())

// prevent xss attack
app.use(xss())

// set rate limit
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 150, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
})

// Apply the rate limiting middleware to all requests
app.use(limiter)

// allow cors
app.use(cors())

app.use(hpp())

app.use("/api/v1/tourist",touristRouter)
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/booking",bookingRouter)
app.use("/api/v1/reviews",reviewRouter)
app.use("/api/v1/users",usersRouter)

app.use(errorHandler)



connectDb()
const port = 5000
app.listen(port||PORT,()=>{
    console.log(`app is listening on port ${port}`)
})
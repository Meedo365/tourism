require("dotenv").config()
const cookieParser = require("cookie-parser")
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require("helmet")
const xss = require("xss-clean")
const rateLimit = require('express-rate-limit')
const hpp = require("hpp")
const cors = require("cors")
const routes = require('./src/routes');
const express = require("express");
const app = express();
const connectDb = require("./config/config")
const port = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }))
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
});
// Apply the rate limiting middleware to all requests
app.use(limiter)

// allow cors
app.use(cors())

app.use(hpp())
app.use(routes);
// app.use(errorHandler)

app.get('/', (req, res) => {
	res.send("this is index route for endpoints, welcome to your tourism project endpoints");
});

connectDb()

app.listen(port, () => {
	console.log(`App is running on port ${port}`)
});
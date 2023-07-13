const mongoose = require("mongoose")

const connectDb = ()=>{
    mongoose.connect(process.env.MONGO_URL)
    console.log("Db is connected")
}

module.exports = connectDb
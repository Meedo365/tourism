const mongoose = require("mongoose")

const bookingSchema = mongoose.Schema({
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"User"
    },
    reservation:[{
        touristCenter:{
            type:String,
            required:true
        },
        bookingNumber:{
            type:Number,
            required:true
        },
        time:Date,


    }],
    email:{
        type:String,
        required:true
    }
},{timestamps:true})

const Bookings = mongoose.model("Bookings",bookingSchema)

module.exports = Bookings
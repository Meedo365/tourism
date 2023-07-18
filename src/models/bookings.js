const mongoose = require("mongoose")

const bookingSchema = mongoose.Schema({
    owner: {
        type: mongoose.Schema.ObjectId,
        ref: "Users"
    },
    reservation: {
        touristCenter: {
            type: mongoose.Schema.ObjectId,
            required: true,
            ref: "Tourist-Centers"
        },
        bookingNumber: {
            type: Number,
            required: true
        },
        time: Date,
    },
    email: {
        type: String,
        required: true
    }
},
    { timestamps: true })

const Bookings = mongoose.model("Bookings", bookingSchema)

module.exports = Bookings
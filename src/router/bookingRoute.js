const {createBookings,getABooking,getBooking} = require("../controller/bookings")
const  {authorize} = require("../middleware/auth")
const express = require('express')


const router = express.Router()

router.post("/:touristId",authorize,createBookings)
router.route("/")
.get(authorize,getBooking)
router.get("/:bookingNumber",authorize,getABooking)

module.exports = router
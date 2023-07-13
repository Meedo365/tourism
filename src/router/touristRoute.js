const {createTourist, getAllTourist, getSingleTourist, updateTourist, deleteTourist, getTouristByDistance }= require("../controller/touristContoller")
const  {authorize} = require("../middleware/auth")
const express = require('express')


const router = express.Router()
const reviewRouter = require("./reviewRoute")

router.use("/:touristId/reviews",reviewRouter)

router.route("/")
.post(authorize,createTourist)
.get(getAllTourist)

router.route("/:id")
.get(getSingleTourist)
.put(authorize,updateTourist)
.delete(authorize,deleteTourist)

router.get("/:zipcode/:distance/:unit",getTouristByDistance)

module.exports = router
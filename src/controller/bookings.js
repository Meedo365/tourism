const Bookings = require("../models/bookings")
const Tourist = require("../models/touristcenterschema")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const sendMail = require("../utils/sendMail")

// create booking
const createBookings = asyncHandler(async(req,res,next)=>{
    const {time} = req.body
  
    const email = req.user.email
   
    const touristId = req.params.touristId
   
    const tourist = await Tourist.findById(touristId)
   
    const touristCenter = tourist.touristCenter
   
    const bookingNumber = Math.floor((Math.random()*1000000)+1)
   
    const owner = req.user.id
    
    // check if a booking exist
    let booking = await Bookings.findOne({email}).populate({path:"owner",select:"name"})

    // if there is a booking,check if the reservation exist
   
    if(booking){
        const touristCenterIndex = booking.reservation.findIndex((findtourist)=>findtourist.touristCenter===touristCenter)
            
        // if the resevation exist
        if(touristCenterIndex>-1){
            
            let myBooking = booking.reservation[touristCenterIndex]
           
            myBooking.time = time
           
            booking.reservation[touristCenterIndex] = myBooking
           
           booking =  await booking.save()
          
            const message = `this is your booking ${myBooking}`
    //    send mail
    try {
        await sendMail({
            email:email,
            subject:"Booking successful",
            message
        }) 
     } catch (error) {
         console.log(error.message)
         
         next(new ErrorResponse("message could not be sent",500))
         
     }
            
        return res.status(200).json({success:true,data:myBooking})
       
            //   create new reservation
        }else{
            
            booking.reservation.push({touristCenter,time,bookingNumber})
            
            booking = await booking.save()
           
            
            const message = `this is your booking ${booking.reservation}`
            //    send mail
    try {
        await sendMail({
            email,
            subject:"Booking successful",
            message
        }) 
     } catch (error) {
         console.log(error.message)
         
         next(new ErrorResponse("message could not be sent",500))
         
     }
           
            return res.status(200).json({success:true,data:booking})
        }
       
        // create a new booking
    }else{
       
        const newBooking = await Bookings.create({
            owner,
            reservation:[{touristCenter,bookingNumber,time}],
            email
        })
  
        const message = `this is your booking ${newBooking.reservation}`
   
        //    send mail
    try {
        await sendMail({
            email,
            subject:"Booking successful",
            message:newBooking
        }) 
     } catch (error) {
         console.log(error.message)
         
         next(new ErrorResponse("message could not be sent",500))
         
     }
      
        return res.status(200).json({success:true,data:newBooking})
    }
    
})

// get  booking for a user
const getBooking = asyncHandler(async(req,res,next)=>{
   
    const owner  = req.user.id 
    
   
    const booking = await Bookings.findOne({owner}).populate({path:"owner",select:"name"})
   
    if(!booking) return next(new ErrorResponse("No bookings found",400))
   
    res.status(200).json({success:true,data:booking})
})


// get a particular rewservation
const getABooking = asyncHandler(async(req,res,next)=>{

    // get a booking 
    const bookingNumber =Number( req.params.bookingNumber)
    
    const owner  = req.user.id 
   
    let booking = await Bookings.findOne({owner})
    
    // check for reservation
    const bookingIndex = booking.reservation.findIndex((findTourist)=>findTourist.bookingNumber === bookingNumber)
   
    // check if reservation does not exist
    if(bookingIndex<0) return next(new ErrorResponse(`No booking with booking number ${bookingNumber} `,400))
   
    booking = booking.reservation[bookingIndex]
   
    res.status(200).json({success:true,data:booking})
})

module.exports = {createBookings,getBooking,getABooking}
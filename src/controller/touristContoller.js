const Tourist = require("../models/touristcenterschema")
const geocoder = require("../utils/geocoder")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const { json } = require("express/lib/response")

// create a touristcenter
const createTourist =asyncHandler( async (req,res,next)=>{
    // only admin and publisher can create tourist center
    if(req.user.role != "admin" && req.user.role != "publisher") return next(new ErrorResponse("you cant accesss this route",403))
    
        // use node-geocoder to get formatted address
        const loc = await geocoder.geocode(req.body.address)
    let location = {
        type : "Point",
        coordinates:[loc[0].longitude,loc[0].latitude],
        formattedAddress:loc[0].formattedAddress,
        street:loc[0].streetName,
        city:loc[0].city,
        state:loc[0].stateCode,
        zipcode:loc[0].zipcode,
        country:loc[0].countryCode
    }
       
    req.body.location = location
        const owner = req.user.id
        req.body.owner = owner
      
        // create a new tourist site
        const tourist = await Tourist.create(req.body)
       
        res.status(201).json({success:true,data:tourist})  
   })
   
   
   // get all tourist center
   const getAllTourist = asyncHandler(async(req,res,next)=>{
       let query;
  
       //   make a copy of req.query
       const reqQuery = {...req.query}
      
       const remove = ["select","sort","page","limit"]
      
       remove.forEach(params=> delete reqQuery[params])
       
       let querystring = JSON.stringify(reqQuery)
       
       querystring = querystring.replace(/\b(gt|gte|lt|lte|in)\b/g,match=>`$${match}`)
      
       querystring = JSON.parse(querystring)
       
       query = Tourist.find(querystring).populate({path:"owner",select:"name email"})
      
       if(req.query.select){
           const variables = req.query.select.split(",").join(" ")
           query = query.select(variables)
       }
     
       if(req.query.sort){
        const variables = req.query.sort.split(",").join(" ")
        query = query.sort(variables)
     }else{
        query = query.sort("-createdAt")
     }
       
        const page = parseInt(req.query.page,10) || 1
       
        const limit = parseInt(req.query.limit,10)||50
       
        const startIndex = (page-1)*limit
       
        const endIndex = page*limit
       
        const total =await Tourist.countDocuments()
       
        query = query.skip(startIndex).limit(limit)

       const tourist = await query
       
       const pagination = {}
        if(endIndex<total){
            pagination.next={
                page:page + 1,
                limit
            }
        }
        if(startIndex>0){
            pagination.previous={
                page:page - 1,
                limit
            }
        }
      
       
        // if no tourist
       if(!tourist) return next(new ErrorResponse("No tourist center found",404))
      
       res.status(200).json({success:true,Total:tourist.length,pagination,data:tourist})
   })



   //    get a single touristcenter
    const getSingleTourist = asyncHandler(async(req,res,next)=>{
       
        //   get touristcenter from DB 
        const tourist =await Tourist.findById(req.params.id)
       
        // if no tourist
        if(!tourist) return next(new ErrorResponse("No tourist center found",404))
      
        res.status(200).json({success:true,data:tourist})
    })

    
    
      // update a touristcenter
     const updateTourist = asyncHandler(async(req,res,next)=>{
       
        //  get a tourist center from DB
        let tourist = await Tourist.findById(req.params.id)
      
        // another user cannot delete what he did not create
        if(tourist.user !== req.user.id && req.user.role !== "admin") return next(new ErrorResponse(`Not authorize to update`,401))
       
       // update tourist center   
        tourist =await Tourist.findOneAndUpdate(req.params.id,req.body,{new:true})
       
        // if no tourist
       if(!tourist) return next(new ErrorResponse("No tourist center found",404))
       
       res.status(200).json({success:true,data:tourist})
    })

   
   
    // delete a touristcenter
    const deleteTourist = asyncHandler(async(req,res,next)=>{
       
        // find tourist center
        let tourist = await Tourist.findById(req.params.id)
       
        // another user cannot delete what he did not create
        if(tourist.user !== req.user.id && req.user.role !== "admin") return next(new ErrorResponse(`Not authorize to update`,401))
        
        // find tourist center and delete from DB
        tourist = await Tourist.findOneAndDelete(req.params.id)
       
        // if no tourist
       if(!tourist) return next(new ErrorResponse("No tourist center found",404))
       
       res.status(200).json({success:true,message:`you have suucessfully deleted tourist center with id ${req.params.id}`})
    })

   
   
    // get a tourist by km/mi
    const getTouristByDistance = asyncHandler(async(req,res,next)=>{
   
        //    use geo-code to get latitude and longitude
        const {zipcode,distance, unit} = req.params
       const loc =await geocoder.geocode(zipcode)
       const lat = loc[0].latitude
       const lng = loc[0].longitude
       let radius;
  
       //    divide distance by the radius of earth to get the radius either in km/mi
       if(unit == "km"){
           radius = distance/6378
       }if(unit == "mi"){
           radius=distance/3963
       }
      
    //   find tourist center within location
       const tourist = await Tourist.find({
        location : { $geoWithin: { $centerSphere: [ [lng,lat], radius] } }
     })
     
     res.status(200).json({success:true,Number:tourist.length,data:tourist})
    })
    

module.exports = {createTourist,getAllTourist,getSingleTourist,updateTourist,deleteTourist,getTouristByDistance}
const mongoose = require("mongoose")
const geocoder = require("../utils/geocoder")

const touristSchema = new mongoose.Schema({
    touristCenter:{
        type:String,
        required:[true,"Please enter a tourist name"],
        unique:true
    },
    email:{
        type:String,
        required:true,
        match:[/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,"Please enter a valid email address"]
    },
    website:{
          type:String,
    },
    contactNumber:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:[true,"Give a description"],
        maxLength:500
    },
    averageCost:{
        type:String,
        required:[true,"please enter average cost"],
    },
    averageRating:{
        type:Number,
        min:1,
        max:10
    },
    accomodationAvailable:{
        type:Boolean,
        default:false
    },
    picture:Array,
    category:{
        type:[String],
        enum:["regular","vip","vvip"],
        default:"regular"
    },
    address:{
        type:String,
        required:true
    },
    location:{
        type: {
            type: String,
            enum: ['Point'],
            required: true
          },
          coordinates: {
            type: [Number],
            required: true,
            index:"2dsphere"
          },
          formattedAddress:String,
          street:String,
          city:String,
          state:String,
          zipcode:String,
          country:String
    },
    owner:{
        type:mongoose.Schema.ObjectId,
        ref:"User"

    }
},{timestamps:true})
touristSchema.pre("save",async function(next){
    
        this.address = undefined
     next()
 })


const Tourist = new mongoose.model("Tourist",touristSchema)


 




module.exports = Tourist
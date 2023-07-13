const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:[/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,"Please enter a valid email address"]
    },
    password:{
        type:String,
        required:true,
        select:false
    },
    role:{
        type:String,
        enum:["admin","user","publisher"],
        default:"user"
    },
    status:{
        type:String,
        enum:["active","pending"],
        default:"pending"
    },
    verifyToken:String,
    resetToken:String,
    resetTokenExpire:Date
},{timestamps:true})


const User = mongoose.model("User",userSchema)

module.exports= User
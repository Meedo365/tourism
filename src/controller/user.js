const User = require("../models/userSchema")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

// desc => create a new user
// route => POST/api/v1/users

const register = asyncHandler(async(req,res,next)=>{
    let {name,email,password,role} = req.body
   
    // check if email already exist
    const findUser =await User.findOne({email})
   
    if(findUser) return next(new ErrorResponse(`The email ${email} already exist`,404))
    
    //    hash the password
    password = await bcrypt.hash(password,12)

    // every account opened by admin do not need to confirm email
   
    const user = await User.create({name,email,password,role,status:"active"})
   
    // const token = jwt.sign({id:user._id,email:user.emai},process.env.JWT_SECRET,{expiresIn:"30d"})
   
    // send cookie and token
    sendCookie(user,201,res)
   
    // res.status(201).json({success:true,token})

})

// send cookie function
const sendCookie = (user,statusCode,res)=>{
 
    const token = jwt.sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:"30d"})
 
    const options = ({
     expires:new Date(Date.now()+2592000),
     httpOnly:true
 })

 res.status(statusCode)
 .cookie("token",token,options)
 .json({
     success:true,
     token
 })
}

//desc => get a single user
// route => GET/api/v1/users/:id

const getUser = asyncHandler(async(req,res,next)=>{
    
    const id = req.params.id
   
    // get a user from DB
    const user = await User.findById(id)
   
    if(!user) return next(new ErrorResponse(`no user with id ${id}`,404))
   
    res.status(200).json({success:true,data:user})
})


// desc =>delete a single user
// route => DELETE/api/v1/users/:id

const deleteuser = asyncHandler(async(req,res,next)=>{
    const id = req.params.id

    const user =await User.findByIdAndDelete(id)

    if(!user) return next(new ErrorResponse(`no user with id ${id}`,404))

    res.status(200).json({success:true,data:{}})
})


// desc => update a single user
// route => PUT/api/v1/users/:id

const updateUser = asyncHandler(async(req,res,next)=>{
    const id = req.params.id

    const {name,email} = req.body

    const field = {name,email}

    const user =await User.findByIdAndUpdate(id,field,{new:true})

    if(!user) return next(new ErrorResponse(`no user with id ${id}`,404))

    res.status(200).json({success:true,data:user})

})

//desc => get a single user
// route => GET/api/v1/users/:id

const getAllUser = asyncHandler(async(req,res,next)=>{
    const users = await User.find()
    res.status(200).json({success:true,count:users.length,data:users})
})

module.exports = {register,getUser,deleteuser,updateUser,getAllUser}
const User = require("../models/userSchema")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middleware/asyncHandler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")


// desc => create a new user
// route => POST/api/v1/auth/

const register = asyncHandler(async(req,res,next)=>{
    let {name,email,password,role} = req.body
   
    // check if email already exist
    const findUser =await User.findOne({email})
   
    if(findUser) return next(new ErrorResponse(`The email ${email} already exist`,404))
    //    hash the password
    password = await bcrypt.hash(password,12)


    // generate token to confirm mail 
     const verifyToken = jwt.sign({email},process.env.JWT_SECRET)
   
    const user = await User.create({name,email,password,role,verifyToken})


     //   create a message 
     const message = `click on the link to verify your :\n\n ${req.protocol}://${req.get("host")}/api/v1/auth/verifymail/${user.verifyToken}`
  
     //    send token to mail
     try {
        await sendMail({
            email:user.email,
            subject:"verify email",
            message
        }) 
     } catch (error) {
         console.log(error.message)
         next(new ErrorResponse("message could not be sent",500))
         
     }
   
     res.status(201).json({success:true,msg:"account created,verify your email",data:user})
   

})


// desc => login user
// route => POST/api/v1/auth/login
const logIn = asyncHandler(async(req,res,next)=>{
   
    const {email,password} = req.body

    //    check for empty field(email,password)
    if(!email||!password) return next(new ErrorResponse(`enter email and password`,404))
   
   //    get a user from DB
    const user =await User.findOne({email}).select("+password")

    // if no user is found
    if(!user) return next(new ErrorResponse(`Invalid credentials`,404))

   // compare plain password and hashed password
    const checkPassword =await bcrypt.compare(password,user.password)
   
    //  if no matching password 
    if(!checkPassword) return next(new ErrorResponse(`Invalid credentials`,404))

    
     // check if mail is active
     if(user.status !== "active") return next(new ErrorResponse(`verify your email ${email}`,401))
   
   
     // send cookie and token
    sendCookie(user,200,res)
})

const sendCookie = (user,statusCode,res)=>{
 
    const token = jwt.sign({id:user._id,email:user.email,role:user.role},process.env.JWT_SECRET,{expiresIn:"30d"})
 
    const options = ({
     expires:new Date(Date.now()+2592000000),
     httpOnly:true
 })

 res.status(statusCode)
 .cookie("token",token,options)
 .json({
     success:true,
     token
 })
}


// desc => delete user
// route => DELETE/api/v1/auth
const delet = asyncHandler(async(req,res,next)=>{
   
    const id = req.user.id
   
    // find a user and delete
    await User.findByIdAndDelete(id)
    
    res.status(200).json({success:true,msg:`successfully deleted account${req.user.email}`})
})


// desc => change password
// route => PUT/api/v1/auth/changepassword
const changePassword = asyncHandler(async(req,res,next)=>{
   
    const id = req.user.id
   
    // find a user
    const user = await User.findById(id).select("+password")
  
    let {password,newPassword} = req.body
  
    // compare user password to hashed passwprd
    const checkPassword =await bcrypt.compare(password,user.password)
   
    // no matching password
    if(!checkPassword)return next(new ErrorResponse("Invalid password",400))
  
    // hash new password   
    newPassword = await bcrypt.hash(newPassword,12)

    // update new password
   await User.findByIdAndUpdate(id,{password:newPassword},{new:true})

   res.status(200).json({success:true,msg:`password successfully changed`})
})


// desc => get me
// route => GET/api/v1/auth
const getUser = asyncHandler(async(req,res,next)=>{
    
    const id = req.user.id
   
    // get a user from DB
    const user = await User.findById(id)
   
    res.status(200).json({success:true,data:user})
})


//desc => generate token for reset password
// route => POST/api/v1/auth/resetpassword
const generateToken = asyncHandler(async(req,res,next)=>{
   
    const {email} = req.body
   
    const user =await User.findOne({email})
  
    // check if user exist 
    if(!user)return next(new ErrorResponse(`${email} does not exist`,404))
   
    const resetToken = jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET)
   
    user.resetToken = resetToken
   
    // expires in 10 minutes
    user.resetTokenExpire = Date.now()+600000
   
    await user.save()
  

    //   create a message 
    const message = `click on the link to reset password :\n\n ${req.protocol}://${req.get("host")}/api/v1/user/resettoken/${user.resetToken}`
  
    //    send token to mail
    try {
       await sendMail({
           email:user.email,
           subject:"password reset token",
           message
       }) 
    } catch (error) {
        console.log(error.message)
        user.resetToken = undefined
        user.resetTokenExpire = undefined
        await user.save()
        next(new ErrorResponse("message could not be sent",500))
        
    }
    
    res.status(200).json({success:true,message:"token sent"})


})


//desc => reset password
// route => PUT/api/v1/auth/resetpassword/:token
const resetPassword = asyncHandler(async(req,res,next)=>{
    const token = req.params.token
   
    let password = req.body.password
 
    //    get a user with sent token and check if still valid
    const user =await User.findOne({resetToken:token,resetTokenExpire:{$gt:Date.now()}})
 
    // check if token is valid   
    if(!user) return next(new ErrorResponse("Invalid token",400))
    
    //  hash new password  
    password =await bcrypt.hash(password,12)
  
    //  set new password 
    user.password = password
   
    // delete resettoken and resettokenexpire
    user.resetToken = undefined
   
    user.resetTokenExpire = undefined
  
    //  save modifications
    await user.save()
   
    res.status(201).json({success:true,msg:"password reset successful"})
})

// desc => create a new user
// route => PUT/api/v1/auth

const updateUser = asyncHandler(async(req,res,next)=>{
    const id = req.user.id

    const {name,email} = req.body

    const field = {name,email}

     // check if email already exist
    if(email){
        const findUser =await User.findOne({email})
   
     if(findUser) return next(new ErrorResponse(`The email ${email} already exist`,400))
    } 

    const user =await User.findByIdAndUpdate(id,field,{new:true})

    if(!user) return next(new ErrorResponse(`no user with id ${id}`,404))

    if(email){
        user.status = "pending"
        
        user.verifyToken = jwt.sign({id:user._id,email:user.email},process.env.JWT_SECRET)
         
        await user.save()

         //   create a message 
    const message = `click on the link to reset password :\n\n ${req.protocol}://${req.get("host")}/api/v1/user/verifymail/${user.verifyToken}`
  
    //    send token to mail
    try {
       await sendMail({
           email:user.email,
           subject:"verify your new email",
           message
       }) 
    } catch (error) {
        console.log(error.message)
        user.verifyMail = undefined
        await user.save()
        next(new ErrorResponse("message could not be sent",500))
        
    }
     return res.status(200).json({success:true,data:user})
    }

    res.status(200).json({success:true,data:user})
})

const verifyMail = asyncHandler(async(req,res,next)=>{
    const token = req.params.token

    const user = await User.findOne({verifyToken:token})
    
    if(!user) return next(new ErrorResponse(`invalid token`),404)

    // set status to active
    user.status = "active"
    
    // remove token from database
    user.verifyToken = undefined
    
    user.save()

    res.status(200).json({success:true,msg:`email verified`})
})


// desc => logout user/clear cookies
// route => GET/api/v1/auth/logout

const logout = asyncHandler(async(req,res,next)=>{
    res.cookie("token","none",{
        expires:new Date(Date.now()+10000),
        httpOnly:true
    })
    res.status(200).json({success:true,data:{}})
})



module.exports = {register,logIn,delet,changePassword,getUser,generateToken,resetPassword,updateUser,verifyMail,logout}
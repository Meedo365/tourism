const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/errorResponse");
require("dotenv").config()

const authorize = (req,res,next)=>{
    let token;
    const authHeader = req.headers.authorization
    if(authHeader&&authHeader.startsWith("Bearer")){
         token = authHeader.split(" ")[1]
    }
    if(req.cookies.token){
        token = req.cookies.token
    }
    if(!token) return next(new ErrorResponse("unauthorize user",401))
    
    const verified = jwt.verify(token,process.env.JWT_SECRET)
    req.user = verified
    next()
}


const accesss = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new ErrorResponse(`the ${req.user.role} is not authorized to visit this route`,403))
        }
        next()
    }
}

module.exports = {authorize,accesss}
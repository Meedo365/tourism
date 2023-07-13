const {register,logIn,delet,changePassword,getUser, generateToken, resetPassword, updateUser, verifyMail, logout} = require("../controller/auth")
const  {authorize} = require("../middleware/auth")
const express = require('express')



const router = express.Router()

router.route("/")

.post(register)
.delete(authorize,delet)
.get(authorize,getUser)
.put(authorize,updateUser)
router.post("/login",logIn)
router.put("/changepassword",authorize,changePassword)
router.post("/resetpassword",generateToken)
router.put("/resetpassword/:token",resetPassword)
router.get("/verifymail/:token",verifyMail)
router.get("/logout",logout)





module.exports = router
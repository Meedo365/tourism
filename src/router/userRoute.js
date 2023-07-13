const  {register,getUser,deleteuser,updateUser,getAllUser} = require("../controller/user")
const  {authorize,accesss} = require("../middleware/auth")
const express = require('express')



const router = express.Router()
router.use(authorize)
router.use(accesss("admin"))

router.route("/:id")
.get(getUser)
.delete(deleteuser)
.put(updateUser)

router.route("/")
.get(getAllUser)
.post(register)

module.exports = router
import jwt from "jsonwebtoken"
import { asyncHandler } from "../utils/asynHandler.js"
import { User } from "../models/User.js"

export const authProvider = asyncHandler(async(req , res , next) => {
  try {
    const token = req.cookies?.accesstoken
    if(!token){
      return res.status(401).json({
        success:false,
        message:"user was not login"
      })
    }
    const decodedtoken = jwt.verify(token , process.env.JWT_ACCESS_TOKEN)
    const user = await User.findById(decodedtoken._id)
    if(!user){
      return res.status(401).json({
        success:false,
        message:"user not uthorized"
      })
    }
  
    return res.status(200).json({
        success:true,
        message:"userfound",
        user
    })
  } catch (error) {
    throw new Error("invlid creadentials")
    
  }
})
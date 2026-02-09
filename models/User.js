import mongoose from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profileImage: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

userSchema.pre("save" , async function(next){
  if(!this.isModified("password")) return next()
    this.password = await bcrypt.hash(this.password , 10)
} )

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password , this.password)
}

userSchema.methods.generateAccesstoken = function(){
return jwt.sign({
  _id:this._id,
  username:this.username,
  email:this.email,
  bio:this.bio,
  profileImage:this.profileImage
},
process.env.JWT_ACCESS_TOKEN,
{expiresIn:"2d"}
)
}

userSchema.methods.generateRefreshtoken = function(){
return jwt.sign({
  _id:this._id,
  username:this.username,
},
process.env.JWT_REFRESH_TOKEN,
{expiresIn:"2d"}
)
}
export const User = mongoose.model("User" , userSchema)

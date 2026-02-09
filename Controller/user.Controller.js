import {User} from "../models/User.js"
import {asyncHandler} from "../utils/asynHandler.js"
import uploadCloudinary from "../utils/cloudinary.js"

const generateAccessTokenRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
  
    const accesstoken = user.generateAccesstoken();
    const refreshtoken = user.generateRefreshtoken();
  
    user.refreshtoken = refreshtoken;
  
    await user.save({ validateBeforeSave: false });
  
    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new Error("not generated")
    
  }
};


const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, bio } = req.body;
  console.log(username , email , password , bio)

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Username, email and password are required",
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({
      success: false,
      message: "User already exists",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Profile image is required",
    });
  }

  const uploadInCloudinary = await uploadCloudinary(req.file.path);
  console.log(uploadInCloudinary)
  if (!uploadInCloudinary) {
    return res.status(500).json({
      success: false,
      message: "Image upload failed",
    });
  }

  const user = await User.create({
    username,
    email,
    password, // hashed via model middleware
    bio,
    profileImage: uploadInCloudinary.url,
  });

  return res.status(201).json({
    success: true,
    message: "Registered successfully",
    user,
  });
});


const logginUser = asyncHandler(async(req , res) => {
    const { email , password} = req.body
    console.log(email , password)
    if( !email || !password){
        return res.status(401).json({
            success:false,
            message:"All feilds are required"
        })
    }

    const user = await User.findOne({email})
    if(!user){
        return res.status(402).json({
            success:false,
            message:"user not found"
        })
    }
    const isPasswordCheck = await user.isPasswordCorrect(password) 
    if(!isPasswordCheck){
        return res.status(401).json({
            success:false,
            message:"Passowrd not correct"
        })
    }

    const {accesstoken , refreshtoken} = await generateAccessTokenRefreshToken(user._id)

  const option = {
  httpOnly: true,
  secure: true,
  sameSite: "none"
}


    return res.status(200)
    .cookie("accesstoken" , accesstoken , option)
    .cookie("refreshtoken" , refreshtoken , option)
    .json({
        success:true,
        message:"Loggin Successfully"
    })
})

const logout = asyncHandler(async(req , res) => {
  if(!req.user){
    return res.status(401).json({
      success:false,
      message:"unthorized"
    })
  }

  await User.findByIdAndUpdate(req.user._id , {
    $set:{
      refreshtoken:null
    }
  },
  {new:true}
)

const option = {
  httpOnly: true,
  secure: true,
  sameSite: "none"
}

return res.status(200)
.clearCookie("accesstoken" , option)
.clearCookie("refreshtoken" , option)
.json({
  success:true,
  message:"Logout successfully"
})
})

export {
    registerUser,
    logginUser,
    logout
}


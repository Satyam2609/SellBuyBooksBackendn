import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asynHandler.js";
import { User } from "../models/User.js";

export const jwtverify = asyncHandler(async (req, res, next) => {
  try {
    let token;

    // 🔥 1. Cookie se token (Web)
    if (req.cookies?.accesstoken) {
      token = req.cookies.accesstoken;
    }

    // 🔥 2. Header se token (Mobile)
    else if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ❌ Agar dono me nahi mila
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - token missing",
      });
    }

    const decodedtoken = jwt.verify(token, process.env.JWT_ACCESS_TOKEN);

    const user = await User.findById(decodedtoken._id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authorized",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
});
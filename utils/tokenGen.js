import jwt from "jsonwebtoken";
export const generateAccessToken = async (user)=>{
    return jwt.sign(
        {
            _id: user._id,
            name: user.name,
            mobile: user.mobile
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
  }
  
  export const generateRefreshToken = async (user)=>{
    return jwt.sign(
        {
            _id: user._id,
            
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
  }
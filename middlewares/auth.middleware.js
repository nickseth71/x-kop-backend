import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json(new ApiError(401, "Unauthorized request"));
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return res
        .status(401)
        .json(new ApiError(401, "Invalid or expired access token"));
    }

    const user = await User.findById(decodedToken._id)
      .populate({
        path: "userRoleId",
        select: "-createdAt -updatedAt -__v",
      })
      .select("-refreshToken -ip -__v");

    if (!user) {
      return res.status(401).json(new ApiError(401, "User not found"));
    }
    const roleData = {
      UserType: user.userRoleId.UserType,
      IsActive: user.userRoleId.IsActive,
    };
    req.user = {
      ...user.toObject(),
      role: roleData,
      userRoleId: user.userRoleId._id,
    };
    next();
  } catch (error) {
    return res
      .status(401)
      .json(new ApiError(401, error?.message || "Invalid access token"));
  }
});

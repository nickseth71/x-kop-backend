import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";

import UserRoleMaster from "./../models/user.role.model.js";

const createUserRole = async (req, res) => {
  try {
    const data = req.body;
    const newUserRole = await UserRoleMaster.create({ UserType:data.UserType,IsActive:true });
    return res.status(201).json(new ApiResponse(200,newUserRole,"User role created successfully!"));
   
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error!"));
  }
};

export { createUserRole };

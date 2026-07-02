import mongoose from "mongoose";
import { User } from "../models/user.model";

export const loggedInUserInfo = async (userId) => {
    try {
      const objectId = new mongoose.Types.ObjectId(userId);
      const userInfoWithWallet = await User.aggregate([
        {
          $match: {
            _id: objectId,
          },
        },
        {
          $lookup: {
            from: "userrolemasters",
            localField: "userRoleId",
            foreignField: "_id",
            as: "userRole",
          },
        },
        {
          $unwind: "$userRole",
        },
        {
          $lookup: {
            from: "wallets",
            localField: "_id",
            foreignField: "userId",
            as: "wallet",
          },
        },
        {
          $unwind: {
            path: "$wallet",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            ip: 0,
            __v: 0,
            userRoleId: 0,
            refreshToken: 0,
            "userRole.createdAt": 0,
            "userRole.updatedAt": 0,
            "userRole.__v": 0,
            "userRole._id": 0,
            "wallet.__v": 0,
            "wallet._id": 0,
          },
        },
      ]);
  
      return userInfoWithWallet;
    } catch (error) {
      console.error("Error fetching user info with wallet data:", error);
      throw new Error("An error occurred while fetching user info with wallet data.");
    }
  };
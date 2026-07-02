// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "./../utils/ApiError.js";
// import { ApiResponse } from "./../utils/ApiResponse.js";
// import User from "./../models/user.model.js";
// import UserRoleMaster from "./../models/user.role.model.js";
// import { generateOTP } from "./../utils/otp.util.js";
// import jwt from "jsonwebtoken";
//  import UserHistory from "../models/user.history.model.js";
// import {
//   generateAccessToken,
//   generateRefreshToken,
// } from "../utils/tokenGen.js";
// import mongoose from "mongoose";
// const ObjectId = mongoose.Types.ObjectId;
// import { createOfficerDetails } from "./officerDetails.controller.js";
// import OfficerDetails from "../models/officerDetails.model.js";
// import Consultation from "../models/Consultation.model.js";
// import ConsultaionType from "../models/consultationType.model.js";
// import SchedulingModel from "../models/Scheduling.model.js";
// import Chat from "../models/chat.model.js";
// import ConsultationPaymentDetails from "../models/consultationPaymentDetails.model.js";

// import deleteFilesFromS3 from "./../helper/deleteFilesFromS3.js"
//    ///////////////////////////////////////////////////// Current logged In User functions ///////////////////////////////////////////////

// const loggedInUserInfo = async (userId)=>{
// let userData = await User.aggregate([
//   {
//     $match: {
//       _id: userId,
//     },
//   },
//   {
//     $lookup: {
//       from: "userrolemasters",
//       localField: "userRoleId",
//       foreignField: "_id",
//       as: "userRole",
//     },
//   },
//   {
//     $unwind: "$userRole",
//   },

//   {
//     $project: {
//       ip: 0,
//       __v:0,
//       userRoleId:0,
//       refreshToken: 0,
//       "userRole.createdAt": 0,
//       "userRole.updatedAt": 0,
//       "userRole.__v": 0,
//       "userRole._id": 0,
//     },
//   },
// ]);

// // if(userData[0]?.consultations?.length){
// //   const consultation_users = await Consultation.find({ _id: { $in: userData[0].consultations } })
// //   .populate({
// //     path: 'officer',
// //     select: 'name email mobile avatar officerDetails',
// //     populate: [
// //       {
// //         path: 'officerDetails',
// //         select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
// //         populate: {
// //           path: 'ConsultationTypeID',
// //           model: 'ConsultaionType',
// //           select: 'ConsultationTypeName FeePerMinute',
// //         }
// //       }
// //     ]
// //   })
// //   .exec();
// //   userData[0].consultations = consultation_users;
// // }

// // if(userData[0].schedules.length){
// //   const schedules_users = await SchedulingModel.find({ _id: { $in: userData[0].schedules } })
// //   .populate({
// //     path: 'officer',
// //     select: 'name email mobile id avatar officerDetails',
// //     populate: [
// //       {
// //         path: 'officerDetails',
// //         select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
// //         populate: {
// //           path: 'ConsultationTypeID',
// //           model: 'ConsultaionType',
// //           select: 'ConsultationTypeName FeePerMinute',
// //         }
// //       }
// //     ]
// //   })
// //   .exec();
// //   userData[0].schedules = schedules_users;

// // }

// // if(userData[0].chats.length){
// //   const chats_users = await Chat.find({ _id: { $in: userData[0].chats } })
// //   .populate({
// //     path: 'participants',
// //     select: 'name email mobile id avatar officerDetails',
// //     populate: {
// //           path: 'officerDetails',
// //           select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
// //           populate: {
// //             path: 'ConsultationTypeID',
// //             model: 'ConsultaionType',
// //             select: 'ConsultationTypeName FeePerMinute',
// //           }
// //         }
// //   })

// //   // .populate({
// //   //   path: 'messages',
// //   // })
// //   .exec();
// //   userData[0].chats = chats_users;

// // }

// // if(userData[0].transactions.length){
// //     const transactions_users = await ConsultationPaymentDetails.find({ _id: { $in: userData[0].transactions } });
// //     userData[0].transactions=transactions_users;
// // }

// return  userData;
// }

// const loggedInOfficerInfo = async (userId) => {

// const officerData = await User.aggregate([
//     {
//       $match: {
//         _id: userId,
//       },
//     },
//     {
//       $lookup: {
//         from: "userrolemasters",
//         localField: "userRoleId",
//         foreignField: "_id",
//         as: "userRole",
//       },
//     },
//     {
//       $unwind: "$userRole",
//     },
//     {
//       $lookup: {
//         from: "officerdetails",
//         localField: "officerDetails",
//         foreignField: "_id",
//         as: "officerDetails",
//       },
//     },
//     {
//       $unwind: "$officerDetails",
//     },
//     {
//       $lookup:{
//         from:"consultationpaymentdetails",
//         localField:"transactions",
//         foreignField:"_id",
//         as:"transactions"
//       }
//     },
//     {
//       $project: {
//         ip: 0,
//         // _id: 0,
//         __v: 0,
//         userRoleId: 0,
//         refreshToken: 0,
//         "userRole.createdAt": 0,
//         "userRole.updatedAt": 0,
//         "userRole.__v": 0,
//         "userRole._id": 0,
//         "officerDetails.Officer":0,
//       },
//     },
//   ]);

//   if (officerData[0]?.officerDetails) {
//     const consultationType = await ConsultaionType.findById(officerData[0].officerDetails.ConsultationTypeID);
//     officerData[0].officerDetails.ConsultationTypeID = consultationType;
//   }

//   // if(officerData[0]?.consultations?.length){
//   //   const consultation_users = await Consultation.find({ _id: { $in: officerData[0].consultations } })
//   //   .populate({
//   //     path: 'customer',
//   //     select: 'name email mobile id avatar',
//   //   })
//   //   // .populate({
//   //   //   path: 'officer',
//   //   //   select: 'name email mobile id avatar officerDetails',
//   //   //   populate: [
//   //   //     {
//   //   //       path: 'officerDetails',
//   //   //       select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
//   //   //       populate: {
//   //   //         path: 'ConsultationTypeID',
//   //   //         model: 'ConsultaionType',
//   //   //         select: 'ConsultationTypeName FeePerMinute',
//   //   //       }
//   //   //     }
//   //   //   ]
//   //   // })
//   //   .exec();
//   //   officerData[0].consultations = consultation_users;
//   // }

//   // if(officerData[0]?.schedules?.length){
//   //   const schedules_users = await SchedulingModel.find({ _id: { $in: officerData[0].schedules } })
//   //   .populate({
//   //     path: 'customer',
//   //     select: 'name email mobile id avatar',
//   //   })
//   //   // .populate({
//   //   //   path: 'officer',
//   //   //   select: 'name email mobile id avatar officerDetails',
//   //   //   populate: [
//   //   //     {
//   //   //       path: 'officerDetails',
//   //   //       select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
//   //   //       populate: {
//   //   //         path: 'ConsultationTypeID',
//   //   //         model: 'ConsultaionType',
//   //   //         select: 'ConsultationTypeName FeePerMinute',
//   //   //       }
//   //   //     }
//   //   //   ]
//   //   // })
//   //   .exec();
//   //   officerData[0].schedules = schedules_users;

//   // }
//   // if(officerData[0]?.chats?.length){
//   //   const chats_users = await Chat.find({ _id: { $in: officerData[0].chats } })
//   //   .populate({
//   //     path: 'participants',
//   //     select: 'name email mobile id avatar officerDetails',
//   //     populate: {
//   //           path: 'officerDetails',
//   //           select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
//   //           populate: {
//   //             path: 'ConsultationTypeID',
//   //             model: 'ConsultaionType',
//   //             select: 'ConsultationTypeName FeePerMinute',
//   //           }
//   //         }
//   //   })

//   //   // .populate({
//   //   //   path: 'messages',
//   //   // })
//   //   // .populate({
//   //   //   path: 'officer',
//   //   //   select: 'name email mobile id avatar officerDetails',
//   //   //   populate: [
//   //   //     {
//   //   //       path: 'officerDetails',
//   //   //       select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
//   //         // populate: {
//   //         //   path: 'ConsultationTypeID',
//   //         //   model: 'ConsultaionType',
//   //         //   select: 'ConsultationTypeName FeePerMinute',
//   //         // }
//   //   //     }
//   //   //   ]
//   //   // })
//   //   .exec();
//   //   officerData[0].chats = chats_users;

//   // }

// //   if(officerData[0]?.transactions?.length){
// //     const transactions_users = await ConsultationPaymentDetails.find({ _id: { $in: officerData[0].transactions } });
// //     officerData[0].transactions=transactions_users;
// // }
//   return officerData;
// };

// const generateAccessAndRefereshTokens = async (
//   userId,
//   type = "withoutRefresh"
// ) => {
//   try {
//     const user = await User.findById(userId);

//     const accessToken = await generateAccessToken(user);
//     const refreshToken = await generateRefreshToken(user);
//     user.refreshToken = refreshToken;
//     if (type === "withoutRefresh") {
//       (user.loginTimeDate = new Date()),
//         (user.OTP = undefined),
//         (user.OTPExpiry = undefined);
//     }
//     await user.save({ validateBeforeSave: false });

//     return { accessToken, refreshToken };
//   } catch (error) {

//     return res.status(500).json(new ApiError(500,
//       "Something went wrong while generating referesh and access token"));
//   }
// };

//    ///////////////////////////////////////////////////// Signup User functions ///////////////////////////////////////////////

// const signUpUser = asyncHandler(async (req, res) => {
//   try {
//     let ip = req.headers["x-forwarded-for"] || req.ip;
//     const { name, mobile, type = "user" } = req.body;
//     const existedUser = await User.findOne({ mobile });
//     if (existedUser) {
//       return res.status(409).json(new ApiError(409, "User with mobile number already exists"));
//     }
//     let userRoleType = "User";
//     if (type && type === "officer") {
//       userRoleType = "Officer";
//     }
//     const userRole = await UserRoleMaster.findOne({ UserType: userRoleType });

//     if (!userRole) {
//       return res.status(404).json(new ApiError(404, "User role not found"));
//     }

//     const OTP = await generateOTP(4);

//     const userCreateRes = await User({
//       name,
//       mobile,
//       ip,
//       OTP,
//       OTPExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000),
//       userRoleId: userRole._id,
//       isActive:true
//     });

//     await userCreateRes.save();

//     const message = `${userRoleType} registered successfully!`;
//     return res.status(201).json(new ApiResponse(200, { isOTP: true, mobile }, message));
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return res
//         .status(error.statusCode)
//         .json(new ApiResponse(error.statusCode, null, error.message));
//     } else {
//       return res
//         .status(500)
//         .json(
//           new ApiResponse(
//             500,
//             null,
//             "Something went wrong while registering the user"
//           )
//         );
//     }
//   }
// });

//    ///////////////////////////////////////////////////// Login User functions ///////////////////////////////////////////////

// const signInUser = asyncHandler(async (req, res) => {
//   const { mobile,role="user" } = req.body;
//   let ip = req.headers["x-forwarded-for"] || req.ip;
//   try {
//     const user = await User.findOne({ mobile }).populate("userRoleId");
//     if (!user) {
//         return res.status(404).json(new ApiError(404,"user not found!"));
//     }

//     const otp = await generateOTP(4);

//     if(role=="officer" && user.userRoleId.UserType=="Officer"){

//       user.OTP = otp;
//       user.ip = ip;
//       user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//       await user.save();
//      return res
//         .status(200)
//         .json(
//           new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
//         );
//       }

//     if(role=="user" && user.userRoleId.UserType=="User"){
//       user.OTP = otp;
//       user.ip = ip;
//       user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//       await user.save();
//      return res
//         .status(200)
//         .json(
//           new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
//         );
//       }

//       if(role=="admin" && user.userRoleId.UserType=="Admin"){
//         user.OTP = otp;
//         user.ip = ip;
//         user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//         await user.save();
//        return res
//           .status(200)
//           .json(
//             new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
//           );
//         }

//         return res
//         .status(404)
//         .json(
//           new ApiError(404, "User not valid")
//         );

//   } catch (error) {
//     return res.status(500).json(new ApiError(500,"Internal Server Error"));
//   }
// });

//    ///////////////////////////////////////////////////// Verify  User functions ///////////////////////////////////////////////

// const verifyPhoneOtp = asyncHandler(async (req, res) => {
//   const { mobile, otp } = req.body;
//   try {
//     const user = await User.aggregate([
//       {
//         $match: {
//           mobile,
//         },
//       },
//       {
//         $lookup: {
//           from: "userrolemasters",
//           localField: "userRoleId",
//           foreignField: "_id",
//           as: "userRole",
//         },
//       },
//       {
//         $unwind: "$userRole",
//       },
//       {
//         $project: {
//           ip: 0,
//           userRoleId: 0,
//           refreshToken: 0,
//           "userRole.createdAt": 0,
//           "userRole.updatedAt": 0,
//           "userRole.__v": 0,
//         },
//       },
//     ]);

//     if (!user.length) {
//       return res.status(404).json(new ApiError(404, "User not found!"));
//     }

//     const userData = user[0];
//     if (userData.OTP === parseInt(otp) && userData.OTPExpiry > new Date()) {
//       const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userData._id);

//       const options = {
//         httpOnly: true,
//         secure: true,
//       };

//       let loggedInUser;

//       if (userData.userRole.UserType === "Officer") {
//         await createOfficerDetails(userData._id);
//         loggedInUser = await loggedInOfficerInfo(userData._id);
//       } else {
//         loggedInUser = await loggedInUserInfo(userData._id);
//       }

//       return res
//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(
//           new ApiResponse(
//             200,
//             {
//               loggedInUser, // Return the proper loggedInUser variable
//               accessToken,
//               refreshToken,
//             },
//             "User logged In Successfully"
//           )
//         );
//     } else {
//       return res.status(400).json(new ApiError(400, "Invalid OTP or OTP expired"));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(new ApiError(500, "Internal Server Error"));
//   }
// });

//    ///////////////////////////////////////////////////// LogOut User functions ///////////////////////////////////////////////

// const logoutUser = asyncHandler(async (req, res) => {
//   try {
//     const out_time = new Date();
//     const user_dd = await User.findByIdAndUpdate(
//       req.user._id,
//       { $set: { logoutTimeDate: out_time}, $unset: { refreshToken: 1 } },
//       { new: true }
//     );

//     await UserHistory.create({
//       userId: user_dd._id,
//       name: user_dd.name,
//       mobile: user_dd.mobile,
//       email: user_dd.email !== undefined ? user_dd.email : "",
//       loginTimeDate: user_dd.loginTimeDate,
//       logoutTimeDate: out_time,
//       ip: user_dd.ip,
//     });

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     return res
//       .status(200)
//       .clearCookie("accessToken", options)
//       .clearCookie("refreshToken", options)
//       .json(new ApiResponse(200, {}, "User logged Out"));
//   } catch (error) {
//     // Handle error, perhaps by logging it or sending an error response
//     console.error(error);
//     return res.status(500).json(new ApiResponse(500, {}, "Internal Server Error"));
//   }
// });

//  ///////////////////////////////////////////////////// Refresh Access Token User functions ///////////////////////////////////////////////
// const refreshAccessToken = asyncHandler(async (req, res) => {

//   const incomingRefreshToken =
//     req.cookies.refreshToken || req.body.refreshToken;

//   if (!incomingRefreshToken) {
//     return res.status(401).json(new ApiError(401, "unauthorized request"));
//   }

//   try {
//     const decodedToken = jwt.verify(
//       incomingRefreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     const user = await User.findById(decodedToken?._id);

//     if (!user) {
//       return res.status(401).json(new ApiError(401, "Invalid refresh token"));
//     }

//     if (incomingRefreshToken !== user?.refreshToken) {

//       return res.status(401).json(new ApiError(401, "Refresh token is expired or used"));
//     }

//     const options = {
//       httpOnly: true,
//       secure: true,
//     };

//     const newGeToken = await generateAccessAndRefereshTokens(user._id);
//     return res
//       .status(200)
//       .cookie("accessToken", newGeToken.accessToken, options)
//       .cookie("refreshToken", newGeToken.refreshToken, options)
//       .json(
//         new ApiResponse(
//           200,
//           {
//             accessToken: newGeToken.accessToken,
//             refreshToken: newGeToken.refreshToken,
//           },
//           "Access token refreshed"
//         )
//       );
//   } catch (error) {
//     return res.status(401).json(new ApiError(401, error?.message || "Invalid refresh token"));

//   }
// });

// ///////////////////////////////////////////////////// Get Current User Info ///////////////////////////////////////////////

// const getCurrentUser = asyncHandler(async (req, res) => {

//   let user;
//   if(req.user.role.UserType=="Officer"){
//     user = await loggedInOfficerInfo(req.user._id);
//   } else{
//     user = await loggedInUserInfo(req.user._id);
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, { user: user[0] }, "User fetched successfully"));
// });

// ////////////////////////////////////////////////////// Wallet Update ///////////////////////////////////////////////////
// const updateWallet = async (req, res) => {
//   const {amount, type, description } = req.body;

//   const userId = req.user?._id;

//   if (!mongoose.Types.ObjectId.isValid(userId)) {
//     return res.status(400).json({ error: 'Invalid user ID' });
//   }

//   if (!amount || (type !== 'credit' && type !== 'debit')) {
//     return res.status(400).json({ error: 'Invalid amount or type' });
//   }

//   try {
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     let newBalance;
//     if (type === 'credit') {
//       newBalance = user.wallet + amount;
//     } else if (type === 'debit') {
//       if (user.wallet < amount) {
//         return res.status(400).json({ error: 'Insufficient funds' });
//       }
//       newBalance = user.wallet - amount;
//     }

//     user.wallet = newBalance;

//     // Log the transaction
//     user.walletTransactions.push({
//       amount,
//       type,
//       description
//     });

//     await user.save();
//     const loggedInUser = await loggedInUserInfo(req.user?._id);

//     return res
//     .status(200)
//     .json(new ApiResponse(200, loggedInUser, "Wallet updated successfully"));

//   } catch (error) {
//     return res
//     .status(500)
//     .json(new ApiResponse(500, null, "Something went wrong!"));
//   }
// };

// ///////////////////////////////////////////////////// Update User Info ///////////////////////////////////////////////

// const updateUserDetailsAdmin = asyncHandler(async (req, res) => {
//   const req_data = req.body;

//   try {
//     const admin = await User.findById(req.user._id).populate('userRoleId');
//     if (!admin || admin.userRoleId.UserType !== "Admin") {
//       return res.status(404).json(new ApiError(404, "User is not Authorized."));
//     }

//     if (!req_data || Object.keys(req_data).length === 0) {
//       return res.status(400).json(new ApiError(400, "Please provide the required fields."));
//     }

//     let user;
//     let loggedInUser;

//     if (req_data.userData) {
//       user = await User.findByIdAndUpdate(
//         req_data.userId,
//         { $set: req_data.userData },
//         { new: true }
//       );
//       if (!user) {
//         return res.status(404).json(new ApiError(404, "User not found."));
//       }

//       const user_dta = await User.findById(req_data.userId);

//       if (user_dta?.officerDetails && req_data.officer_details) {
//         user = await OfficerDetails.findByIdAndUpdate(
//           user_dta.officerDetails,
//           { $set: req_data.officer_details },
//           { new: true }
//         );
//         if (!user) {
//           return res.status(404).json(new ApiError(404, "Officer details not found."));
//         }
//         loggedInUser = await loggedInOfficerInfo(new ObjectId(req_data.userId));
//       } else{
//         loggedInUser = await loggedInUserInfo(new ObjectId(req_data.userId));
//       }
//     }

//     if (!loggedInUser) {
//       return res.status(400).json(new ApiError(400, "Failed to update user details."));
//     }

//     return res.status(200).json(new ApiResponse(200, loggedInUser, "Account details updated successfully"));
//   } catch (error) {
//     console.error("Update Error:", error);
//     return res.status(500).json(new ApiError(500, "Internal Server Error!"));
//   }
// });

// const updateAccountDetails = asyncHandler(async (req, res) => {
//   const req_data = req.body;

//   try {

//     if (Object.keys(req_data).length === 0 && req_data.constructor === Object) {
//       return res.status(400).json(new ApiError(400, "Please provide the required fields."));
//     }

//     if (!req_data.userData?.name || !req_data.userData?.mobile) {
//       return res.status(400).json(new ApiError(400, "Please provide the required fields."));
//     }

//     let user;

//     if(req_data.userData){
//       user = await User.findByIdAndUpdate(
//         req.user?._id,
//         {
//           $set: req_data.userData,
//         },
//         // { new: true }
//       );
//     }
//     if(req_data?.officerDetails){
//         user = await OfficerDetails.findOneAndUpdate(
//           { Officer: req.user?._id },
//           { $set: req_data.officerDetails },
//           // { new: true }
//         );
//       }

//     if(user == undefined){
//       return res.status(404).json(new ApiError(404,"user not found"))
//     }
//     let loggedInUser;
//     if (req_data?.officerDetails) {
//       loggedInUser = await loggedInOfficerInfo(new ObjectId(req.user?._id));
//     } else{
//       loggedInUser = await loggedInUserInfo(req.user?._id);
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, loggedInUser, "Account details updated successfully"));
//   } catch (error) {
//     console.error("Update Error:", error);
//     return res.status(500).json(new ApiError(500, "Internal Server Error!"));
//   }
// });

// const updateUserAvatar = asyncHandler(async (req, res) => {
//   try {
//     const avatarLocalPath = req.file.location;

//     if (!avatarLocalPath) {
//       return res.status(400).json(new ApiError(400, "Error while uploading on avatar"));
//     }

//     const user = await User.findById(req.user?._id);

//     if(user?.avatar!="https://x-kop-bucket.s3.ap-south-1.amazonaws.com/user-png-33842.png"){
//       deleteFilesFromS3(user?.avatar);
//     }

//     await User.findByIdAndUpdate(
//       req.user?._id,
//       {
//         $set: {
//           avatar: avatarLocalPath,
//         },
//       },
//       { new: true }
//     );

//     let loggedInUser;
//     if (user?.officerDetails && user.officer_details) {
//       loggedInUser = await loggedInOfficerInfo(req.user?._id);
//     } else{
//       loggedInUser = await loggedInUserInfo(req.user?._id);
//     }

//     return res
//       .status(200)
//       .json(new ApiResponse(200, loggedInUser, "Avatar image updated successfully"));
//   } catch (error) {
//     return res
//       .status(500)
//       .json(new ApiResponse(500, null, "Something went wrong!"));
//   }
// });

// const getAllUser = asyncHandler(async (req, res) => {
//   if (req.user.role.UserType !== "Admin") {
//     return res.status(404).json(new ApiResponse(404, {}, "This User not Allowed To Access Data"));
//   }

//   const page = parseInt(req.query.page) || 1;
//   const perPage = parseInt(req.query.perPage) || 10;
//   const skip = (page - 1) * perPage;

//   const users = await User.aggregate([
//     {
//       $lookup: {
//         from: "userrolemasters",
//         localField: "userRoleId",
//         foreignField: "_id",
//         as: "role"
//       }
//     },
//     {
//       $skip: skip
//     },
//     {
//       $limit: perPage
//     },
//     {
//       $unwind: "$role",
//     },
//     {
//       $project: {
//         ip: 0,
//         __v:0,
//         refreshToken: 0,
//         OTP:0,
//         OTPExpiry:0,
//         userRoleId:0,
//         "role.createdAt": 0,
//         "role.updatedAt": 0,
//         "role.__v": 0,
//         "role._id": 0,

//       }
//     }
//   ]);

//   const totalUsers = await User.countDocuments();

//   return res.status(200).json(new ApiResponse(200, {users, totalUsers }, "Successfully fetched data."));
// });

// const GetSingleUser = asyncHandler(async (req, res) => {
//   try {

//     const admin = await User.findById(req.user._id).populate('userRoleId');
//     if(admin.userRoleId.UserType != "Admin"){
//      return res.status(404).json(new ApiError(404,"User is not Authorized."))
//     }
//     let user = await User.findById(req.params.id)
//       .populate({
//         path: 'userRoleId',
//         select: '-createdAt -updatedAt -__v -_id',
//         model: 'UserRoleMaster', // Ensure this is the correct model name
//         as: 'role',
//       })
//       .populate({
//         path: 'officerDetails',
//         select: '-Officer', // Exclude the Officer field
//         model: 'OfficerDetails'})
//       .lean();  // Convert Mongoose document to a plain JavaScript object

//     // Remove refreshToken
//     delete user.refreshToken;

//     // Remove UserType from the populated userRoleId field
//     // if (user.userRoleId) {
//     //   delete user.userRoleId.UserType;
//     // }

//     return res.status(200).json(new ApiResponse(200,user,"" ));
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json(new ApiError(500,'An error occurred while retrieving the user.'));
//   }
// });

// const updateOfficerIdProofDoc = asyncHandler(async (req, res) => {
//   const fileUrls = req.files.map((file) => file.location);

//   if (!req.files || req.files.length === 0) {
//     return res.status(400).send({ message: 'No files uploaded.' });
//   }
//   try {
//     const officer = await OfficerDetails.findOne({ Officer: req.user?._id });

//     if (!officer) {
//       return res.status(404).json(new ApiError(404, "Officer not found"));
//     }

//     if (officer.IDProofDocument && officer.IDProofDocument.length > 0) {
//       await deleteFilesFromS3(officer.IDProofDocument);
//     }

//      await OfficerDetails.findOneAndUpdate(
//       { Officer: req.user?._id },
//       { $set: { IDProofDocument: fileUrls } },

//     );

//     const loggedInUser = await loggedInOfficerInfo(new ObjectId(req.user?._id));

//     return res.status(200).json(new ApiResponse(200, loggedInUser, "Document successfully uploaded"));
//   } catch (error) {
//     console.error("Error updating officer ID proof document:", error);
//     return res.status(500).json(new ApiError(500, "Something went wrong!"));
//   }
// });

// export {
//   signUpUser,
//   signInUser,
//   verifyPhoneOtp,
//   logoutUser,
//   refreshAccessToken,
//   getCurrentUser,
//   updateAccountDetails,
//   updateUserAvatar,
//   getAllUser,
//   updateWallet,
//   updateUserDetailsAdmin,
//   GetSingleUser,
//   updateOfficerIdProofDoc
// };

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import User from "./../models/user.model.js";
import UserRoleMaster from "./../models/user.role.model.js";
import { generateOTP } from "./../utils/otp.util.js";
import jwt from "jsonwebtoken";
import UserHistory from "../models/user.history.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/tokenGen.js";
import mongoose from "mongoose";
const ObjectId = mongoose.Types.ObjectId;
import { createOfficerDetails } from "./officerDetails.controller.js";
import OfficerDetails from "../models/officerDetails.model.js";
import Consultation from "../models/Consultation.model.js";
import ConsultaionType from "../models/consultationType.model.js";
import SchedulingModel from "../models/Scheduling.model.js";
import Chat from "../models/chat.model.js";
import ConsultationPaymentDetails from "../models/consultationPaymentDetails.model.js";
import axios from "axios";

import deleteFilesFromS3 from "./../helper/deleteFilesFromS3.js";
///////////////////////////////////////////////////// Current logged In User functions ///////////////////////////////////////////////

const loggedInUserInfo = async (userId) => {
  let userData = await User.aggregate([
    {
      $match: {
        _id: userId,
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
      $project: {
        ip: 0,
        __v: 0,
        userRoleId: 0,
        refreshToken: 0,
        "userRole.createdAt": 0,
        "userRole.updatedAt": 0,
        "userRole.__v": 0,
        "userRole._id": 0,
      },
    },
  ]);

  // if(userData[0]?.consultations?.length){
  //   const consultation_users = await Consultation.find({ _id: { $in: userData[0].consultations } })
  //   .populate({
  //     path: 'officer',
  //     select: 'name email mobile avatar officerDetails',
  //     populate: [
  //       {
  //         path: 'officerDetails',
  //         select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //         populate: {
  //           path: 'ConsultationTypeID',
  //           model: 'ConsultaionType',
  //           select: 'ConsultationTypeName FeePerMinute',
  //         }
  //       }
  //     ]
  //   })
  //   .exec();
  //   userData[0].consultations = consultation_users;
  // }

  // if(userData[0].schedules.length){
  //   const schedules_users = await SchedulingModel.find({ _id: { $in: userData[0].schedules } })
  //   .populate({
  //     path: 'officer',
  //     select: 'name email mobile id avatar officerDetails',
  //     populate: [
  //       {
  //         path: 'officerDetails',
  //         select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //         populate: {
  //           path: 'ConsultationTypeID',
  //           model: 'ConsultaionType',
  //           select: 'ConsultationTypeName FeePerMinute',
  //         }
  //       }
  //     ]
  //   })
  //   .exec();
  //   userData[0].schedules = schedules_users;

  // }

  // if(userData[0].chats.length){
  //   const chats_users = await Chat.find({ _id: { $in: userData[0].chats } })
  //   .populate({
  //     path: 'participants',
  //     select: 'name email mobile id avatar officerDetails',
  //     populate: {
  //           path: 'officerDetails',
  //           select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //           populate: {
  //             path: 'ConsultationTypeID',
  //             model: 'ConsultaionType',
  //             select: 'ConsultationTypeName FeePerMinute',
  //           }
  //         }
  //   })

  //   // .populate({
  //   //   path: 'messages',
  //   // })
  //   .exec();
  //   userData[0].chats = chats_users;

  // }

  // if(userData[0].transactions.length){
  //     const transactions_users = await ConsultationPaymentDetails.find({ _id: { $in: userData[0].transactions } });
  //     userData[0].transactions=transactions_users;
  // }

  return userData;
};

const loggedInOfficerInfo = async (userId) => {
  const officerData = await User.aggregate([
    {
      $match: {
        _id: userId,
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
        from: "officerdetails",
        localField: "officerDetails",
        foreignField: "_id",
        as: "officerDetails",
      },
    },
    {
      $unwind: "$officerDetails",
    },
    {
      $lookup: {
        from: "consultationpaymentdetails",
        localField: "transactions",
        foreignField: "_id",
        as: "transactions",
      },
    },
    {
      $project: {
        ip: 0,
        // _id: 0,
        __v: 0,
        userRoleId: 0,
        refreshToken: 0,
        "userRole.createdAt": 0,
        "userRole.updatedAt": 0,
        "userRole.__v": 0,
        "userRole._id": 0,
        "officerDetails.Officer": 0,
      },
    },
  ]);

  if (officerData[0]?.officerDetails) {
    const consultationType = await ConsultaionType.findById(
      officerData[0].officerDetails.ConsultationTypeID
    );
    officerData[0].officerDetails.ConsultationTypeID = consultationType;
  }

  // if(officerData[0]?.consultations?.length){
  //   const consultation_users = await Consultation.find({ _id: { $in: officerData[0].consultations } })
  //   .populate({
  //     path: 'customer',
  //     select: 'name email mobile id avatar',
  //   })
  //   // .populate({
  //   //   path: 'officer',
  //   //   select: 'name email mobile id avatar officerDetails',
  //   //   populate: [
  //   //     {
  //   //       path: 'officerDetails',
  //   //       select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //   //       populate: {
  //   //         path: 'ConsultationTypeID',
  //   //         model: 'ConsultaionType',
  //   //         select: 'ConsultationTypeName FeePerMinute',
  //   //       }
  //   //     }
  //   //   ]
  //   // })
  //   .exec();
  //   officerData[0].consultations = consultation_users;
  // }

  // if(officerData[0]?.schedules?.length){
  //   const schedules_users = await SchedulingModel.find({ _id: { $in: officerData[0].schedules } })
  //   .populate({
  //     path: 'customer',
  //     select: 'name email mobile id avatar',
  //   })
  //   // .populate({
  //   //   path: 'officer',
  //   //   select: 'name email mobile id avatar officerDetails',
  //   //   populate: [
  //   //     {
  //   //       path: 'officerDetails',
  //   //       select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //   //       populate: {
  //   //         path: 'ConsultationTypeID',
  //   //         model: 'ConsultaionType',
  //   //         select: 'ConsultationTypeName FeePerMinute',
  //   //       }
  //   //     }
  //   //   ]
  //   // })
  //   .exec();
  //   officerData[0].schedules = schedules_users;

  // }
  // if(officerData[0]?.chats?.length){
  //   const chats_users = await Chat.find({ _id: { $in: officerData[0].chats } })
  //   .populate({
  //     path: 'participants',
  //     select: 'name email mobile id avatar officerDetails',
  //     populate: {
  //           path: 'officerDetails',
  //           select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //           populate: {
  //             path: 'ConsultationTypeID',
  //             model: 'ConsultaionType',
  //             select: 'ConsultationTypeName FeePerMinute',
  //           }
  //         }
  //   })

  //   // .populate({
  //   //   path: 'messages',
  //   // })
  //   // .populate({
  //   //   path: 'officer',
  //   //   select: 'name email mobile id avatar officerDetails',
  //   //   populate: [
  //   //     {
  //   //       path: 'officerDetails',
  //   //       select: 'JobTitle OfficerCode EmergencyContact ConsultationTypeID',
  //         // populate: {
  //         //   path: 'ConsultationTypeID',
  //         //   model: 'ConsultaionType',
  //         //   select: 'ConsultationTypeName FeePerMinute',
  //         // }
  //   //     }
  //   //   ]
  //   // })
  //   .exec();
  //   officerData[0].chats = chats_users;

  // }

  //   if(officerData[0]?.transactions?.length){
  //     const transactions_users = await ConsultationPaymentDetails.find({ _id: { $in: officerData[0].transactions } });
  //     officerData[0].transactions=transactions_users;
  // }
  return officerData;
};

const generateAccessAndRefereshTokens = async (
  userId,
  type = "withoutRefresh"
) => {
  try {
    const user = await User.findById(userId);

    const accessToken = await generateAccessToken(user);
    const refreshToken = await generateRefreshToken(user);
    user.refreshToken = refreshToken;
    if (type === "withoutRefresh") {
      (user.loginTimeDate = new Date()),
        (user.OTP = undefined),
        (user.OTPExpiry = undefined);
    }
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiError(
          500,
          "Something went wrong while generating referesh and access token"
        )
      );
  }
};

///////////////////////////////////////////////////// Signup User functions ///////////////////////////////////////////////

// const signUpUser = asyncHandler(async (req, res) => {
//   try {
//     let ip = req.headers["x-forwarded-for"] || req.ip;
//     const { name, mobile, type = "user" } = req.body;
//     const existedUser = await User.findOne({ mobile });
//     if (existedUser) {
//       return res.status(409).json(new ApiError(409, "User with mobile number already exists"));
//     }
//     let userRoleType = "User";
//     if (type && type === "officer") {
//       userRoleType = "Officer";
//     }
//     const userRole = await UserRoleMaster.findOne({ UserType: userRoleType });

//     if (!userRole) {
//       return res.status(404).json(new ApiError(404, "User role not found"));
//     }

//     const OTP = await generateOTP(4);

//     const userCreateRes = await User({
//       name,
//       mobile,
//       ip,
//       OTP,
//       OTPExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000),
//       userRoleId: userRole._id,
//       isActive:true
//     });

//     await userCreateRes.save();

//     const message = `${userRoleType} registered successfully!`;
//     return res.status(201).json(new ApiResponse(200, { isOTP: true, mobile }, message));
//   } catch (error) {
//     if (error instanceof ApiError) {
//       return res
//         .status(error.statusCode)
//         .json(new ApiResponse(error.statusCode, null, error.message));
//     } else {
//       return res
//         .status(500)
//         .json(
//           new ApiResponse(
//             500,
//             null,
//             "Something went wrong while registering the user"
//           )
//         );
//     }
//   }
// });

//    ///////////////////////////////////////////////////// Login User functions ///////////////////////////////////////////////

// const signInUser = asyncHandler(async (req, res) => {
//   const { mobile,role="user" } = req.body;
//   let ip = req.headers["x-forwarded-for"] || req.ip;
//   try {
//     const user = await User.findOne({ mobile }).populate("userRoleId");
//     if (!user) {
//         return res.status(404).json(new ApiError(404,"user not found!"));
//     }

//     const otp = await generateOTP(4);

//     if(role=="officer" && user.userRoleId.UserType=="Officer"){

//       user.OTP = otp;
//       user.ip = ip;
//       user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//       await user.save();
//      return res
//         .status(200)
//         .json(
//           new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
//         );
//       }

//     if(role=="user" && user.userRoleId.UserType=="User"){
//       user.OTP = otp;
//       user.ip = ip;
//       user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//       await user.save();
//      return res
//         .status(200)
//         .json(
//           new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
//         );
//       }

//       if(role=="admin" && user.userRoleId.UserType=="Admin"){
//         user.OTP = otp;
//         user.ip = ip;
//         user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//         await user.save();
//        return res
//           .status(200)
//           .json(
//             new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
//           );
//         }

//         return res
//         .status(404)
//         .json(
//           new ApiError(404, "User not valid")
//         );

//   } catch (error) {
//     return res.status(500).json(new ApiError(500,"Internal Server Error"));
//   }
// });

///////////////////////////////////////////////////// Verify  User functions ///////////////////////////////////////////////

// const verifyPhoneOtp = asyncHandler(async (req, res) => {
//   const { mobile, otp } = req.body;
//   try {
//     const user = await User.aggregate([
//       {
//         $match: {
//           mobile,
//         },
//       },
//       {
//         $lookup: {
//           from: "userrolemasters",
//           localField: "userRoleId",
//           foreignField: "_id",
//           as: "userRole",
//         },
//       },
//       {
//         $unwind: "$userRole",
//       },
//       {
//         $project: {
//           ip: 0,
//           userRoleId: 0,
//           refreshToken: 0,
//           "userRole.createdAt": 0,
//           "userRole.updatedAt": 0,
//           "userRole.__v": 0,
//         },
//       },
//     ]);

//     if (!user.length) {
//       return res.status(404).json(new ApiError(404, "User not found!"));
//     }

//     const userData = user[0];
//     if (userData.OTP === parseInt(otp) && userData.OTPExpiry > new Date()) {
//       const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(userData._id);

//       const options = {
//         httpOnly: true,
//         secure: true,
//       };

//       let loggedInUser;

//       if (userData.userRole.UserType === "Officer") {
//         await createOfficerDetails(userData._id);
//         loggedInUser = await loggedInOfficerInfo(userData._id);
//       } else {
//         loggedInUser = await loggedInUserInfo(userData._id);
//       }

//       return res
//         .status(200)
//         .cookie("accessToken", accessToken, options)
//         .cookie("refreshToken", refreshToken, options)
//         .json(
//           new ApiResponse(
//             200,
//             {
//               loggedInUser, // Return the proper loggedInUser variable
//               accessToken,
//               refreshToken,
//             },
//             "User logged In Successfully"
//           )
//         );
//     } else {
//       return res.status(400).json(new ApiError(400, "Invalid OTP or OTP expired"));
//     }
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json(new ApiError(500, "Internal Server Error"));
//   }
// });

///////////////////////////////////////////////////////// This is function which i had commented ////////////////
const signUpUser = asyncHandler(async (req, res) => {
  try {
    let ip = req.headers["x-forwarded-for"] || req.ip;
    const { name, mobile, type = "user" } = req.body;
    const existedUser = await User.findOne({ mobile });
    if (existedUser) {
      return res
        .status(409)
        .json(new ApiError(409, "User with mobile number already exists"));
    }
    let userRoleType = "User";
    if (type && type === "officer") {
      userRoleType = "Officer";
    }
    const userRole = await UserRoleMaster.findOne({ UserType: userRoleType });

    if (!userRole) {
      return res.status(404).json(new ApiError(404, "User role not found"));
    }

    // Send OTP using MSG91
    // const otpResponse = await axios.post("https://control.msg91.com/api/v5/otp", {
    //   authkey: process.env. || "425123AtlqUHkZB7167d01456P1",
    //   template_id: process.env.MSG91_TEMPLATE_ID || "67d0166cd6fc05306a4e2093",
    //   mobile: `91${mobile}`, // Prefix country code for India
    //   otp_length: 4,
    // });

    // if (otpResponse.data.type !== "success") {
    //   return res.status(500).json(new ApiError(500, "Failed to send OTP"));
    // }

    // Send OTP using MSG91
    try {
      const otpResponse = await axios.post(
        "https://control.msg91.com/api/v5/otp",
        {
          authkey: process.env.MSG91_AUTH_KEY || "425123AtlqUHkZB7167d01456P1",
          template_id:
            process.env.MSG91_TEMPLATE_ID || "67d0166cd6fc05306a4e2093",
          mobile: `91${mobile}`,
          otp_length: 4,
        }
      );

      console.log("OTP Response Data:", otpResponse.data); // Log MSG91 response

      if (otpResponse.data.type !== "success") {
        return res
          .status(500)
          .json(
            new ApiError(
              500,
              `Failed to send OTP: ${
                otpResponse.data.message || "Unknown error"
              }`
            )
          );
      }
    } catch (error) {
      console.error("OTP API Error:", error.response?.data || error.message); // Log error details
      return res
        .status(500)
        .json(new ApiError(500, "Failed to send OTP due to API error"));
    }

    const userCreateRes = await User({
      name,
      mobile,
      ip,
      OTPExpiry: new Date(Date.now() + 2 * 60 * 60 * 1000),
      userRoleId: userRole._id,
      isActive: true,
    });

    await userCreateRes.save();

    const message = `${userRoleType} registered successfully!`;
    return res
      .status(201)
      .json(new ApiResponse(200, { isOTP: true, mobile }, message));
  } catch (error) {
    return res
      .status(500)
      .json(
        new ApiResponse(
          500,
          null,
          "Something went wrong while registering the user"
        )
      );
  }
});

///////////////////////////////////////////////////// Login User functions ///////////////////////////////////////////////

// const signInUser = asyncHandler(async (req, res) => {
//   const { mobile, role = "user" } = req.body;
//   let ip = req.headers["x-forwarded-for"] || req.ip;
//   try {
//     const user = await User.findOne({ mobile }).populate("userRoleId");
//     if (!user) {
//       return res.status(404).json(new ApiError(404, "user not found!"));
//     }

//     // Send OTP using MSG91
//     const otpResponse = await axios.post("https://control.msg91.com/api/v5/otp", {
//       authkey: process.env. || "425123AtlqUHkZB7167d01456P1",
//       template_id: process.env.MSG91_TEMPLATE_ID || "67d0166cd6fc05306a4e2093",
//       mobile: `91${mobile}`,
//       otp_length: 4,
//     });

//     if (otpResponse.data.type !== "success") {
//       return res.status(500).json(new ApiError(500, "Failed to send OTP"));
//     }

//     user.ip = ip;
//     user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000);
//     await user.save();

//     return res.status(200).json(new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully"));

//   } catch (error) {
//     return res.status(500).json(new ApiError(500, "Internal Server Error"));
//   }
// });

///////////////////////////////////////////////////////// This is function which i had commented ////////////////

const signInUser = asyncHandler(async (req, res) => {
  const { mobile, role = "user" } = req.body;
  const ip = req.headers["x-forwarded-for"] || req.ip;

  try {
    const user = await User.findOne({ mobile }).populate("userRoleId");

    if (!user) {
      return res.status(404).json(new ApiError(404, "User not found!"));
    }

    const userType = user.userRoleId?.UserType?.toLowerCase(); // Normalize user role

    if (userType !== role.toLowerCase()) {
      return res
        .status(403)
        .json(new ApiError(403, "User role mismatch or not authorized"));
    }

    // Generate OTP
    const otp = await generateOTP(4);

    // Send OTP using MSG91
    const otpResponse = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      {
        authkey: process.env.MSG91_AUTH_KEY || "425123AtlqUHkZB7167d01456P1",
        template_id:
          process.env.MSG91_TEMPLATE_ID || "67d0166cd6fc05306a4e2093",
        mobile: `91${mobile}`,
        otp_length: 4,
      }
    );

    console.log("OTP API Response:", otpResponse.data);

    if (otpResponse.data.type !== "success") {
      return res
        .status(500)
        .json(
          new ApiError(
            500,
            `Failed to send OTP: ${otpResponse.data.message || "Unknown error"}`
          )
        );
    }

    // Save OTP and user info
    user.OTP = otp;
    user.ip = ip;
    user.OTPExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours expiry
    await user.save();

    return res
      .status(200)
      .json(
        new ApiResponse(200, { isOTP: true, mobile }, "OTP sent successfully")
      );
  } catch (error) {
    console.error("OTP Sending Error:", error.response?.data || error.message);
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

///////////////////////////////////////////////////// Verify  User functions ///////////////////////////////////////////////
///////////////////////////////////////////////////////// This is function which i had commented ////////////////

const verifyPhoneOtp = asyncHandler(async (req, res) => {
  const { mobile, otp } = req.body;
  try {
    // Verify OTP using MSG91 API
    const otpVerificationResponse = await axios.post(
      "https://control.msg91.com/api/v5/otp/verify",
      {
        authkey: process.env.MSG91_AUTH_KEY || "425123AtlqUHkZB7167d01456P1",
        mobile: `91${mobile}`,
        otp,
      }
    );

    if (otpVerificationResponse.data.type !== "success") {
      return res
        .status(400)
        .json(new ApiError(400, "Invalid OTP or OTP expired"));
    }

    const user = await User.aggregate([
      {
        $match: { mobile },
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
        $project: {
          ip: 0,
          userRoleId: 0,
          refreshToken: 0,
          "userRole.createdAt": 0,
          "userRole.updatedAt": 0,
          "userRole.__v": 0,
        },
      },
    ]);

    if (!user.length) {
      return res.status(404).json(new ApiError(404, "User not found!"));
    }

    const userData = user[0];
    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      userData._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    let loggedInUser;

    if (userData.userRole.UserType === "Officer") {
      await createOfficerDetails(userData._id);
      loggedInUser = await loggedInOfficerInfo(userData._id);
    } else {
      loggedInUser = await loggedInUserInfo(userData._id);
    }

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            loggedInUser,
            accessToken,
            refreshToken,
          },
          "User logged In Successfully"
        )
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error"));
  }
});

///////////////////////////////////////////////////// LogOut User functions ///////////////////////////////////////////////

const logoutUser = asyncHandler(async (req, res) => {
  try {
    const out_time = new Date();
    const user_dd = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { logoutTimeDate: out_time }, $unset: { refreshToken: 1 } },
      { new: true }
    );

    await UserHistory.create({
      userId: user_dd._id,
      name: user_dd.name,
      mobile: user_dd.mobile,
      email: user_dd.email !== undefined ? user_dd.email : "",
      loginTimeDate: user_dd.loginTimeDate,
      logoutTimeDate: out_time,
      ip: user_dd.ip,
    });

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged Out"));
  } catch (error) {
    // Handle error, perhaps by logging it or sending an error response
    console.error(error);
    return res
      .status(500)
      .json(new ApiResponse(500, {}, "Internal Server Error"));
  }
});

///////////////////////////////////////////////////// Refresh Access Token User functions ///////////////////////////////////////////////
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return res.status(401).json(new ApiError(401, "unauthorized request"));
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      return res.status(401).json(new ApiError(401, "Invalid refresh token"));
    }

    if (incomingRefreshToken !== user?.refreshToken) {
      return res
        .status(401)
        .json(new ApiError(401, "Refresh token is expired or used"));
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const newGeToken = await generateAccessAndRefereshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", newGeToken.accessToken, options)
      .cookie("refreshToken", newGeToken.refreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken: newGeToken.accessToken,
            refreshToken: newGeToken.refreshToken,
          },
          "Access token refreshed"
        )
      );
  } catch (error) {
    return res
      .status(401)
      .json(new ApiError(401, error?.message || "Invalid refresh token"));
  }
});

///////////////////////////////////////////////////// Get Current User Info ///////////////////////////////////////////////

const getCurrentUser = asyncHandler(async (req, res) => {
  let user;
  if (req.user.role.UserType == "Officer") {
    user = await loggedInOfficerInfo(req.user._id);
  } else {
    user = await loggedInUserInfo(req.user._id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { user: user[0] }, "User fetched successfully"));
});

////////////////////////////////////////////////////// Wallet Update ///////////////////////////////////////////////////
const updateWallet = async (req, res) => {
  const { amount, type, description } = req.body;

  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: "Invalid user ID" });
  }

  if (!amount || (type !== "credit" && type !== "debit")) {
    return res.status(400).json({ error: "Invalid amount or type" });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let newBalance;
    if (type === "credit") {
      newBalance = user.wallet + amount;
    } else if (type === "debit") {
      if (user.wallet < amount) {
        return res.status(400).json({ error: "Insufficient funds" });
      }
      newBalance = user.wallet - amount;
    }

    user.wallet = newBalance;

    // Log the transaction
    user.walletTransactions.push({
      amount,
      type,
      description,
    });

    await user.save();
    const loggedInUser = await loggedInUserInfo(req.user?._id);

    return res
      .status(200)
      .json(new ApiResponse(200, loggedInUser, "Wallet updated successfully"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Something went wrong!"));
  }
};

///////////////////////////////////////////////////// Update User Info ///////////////////////////////////////////////

const updateUserDetailsAdmin = asyncHandler(async (req, res) => {
  const req_data = req.body;

  try {
    const admin = await User.findById(req.user._id).populate("userRoleId");
    if (!admin || admin.userRoleId.UserType !== "Admin") {
      return res.status(404).json(new ApiError(404, "User is not Authorized."));
    }

    if (!req_data || Object.keys(req_data).length === 0) {
      return res
        .status(400)
        .json(new ApiError(400, "Please provide the required fields."));
    }

    let user;
    let loggedInUser;

    if (req_data.userData) {
      user = await User.findByIdAndUpdate(
        req_data.userId,
        { $set: req_data.userData },
        { new: true }
      );
      if (!user) {
        return res.status(404).json(new ApiError(404, "User not found."));
      }

      const user_dta = await User.findById(req_data.userId);

      if (user_dta?.officerDetails && req_data.officer_details) {
        user = await OfficerDetails.findByIdAndUpdate(
          user_dta.officerDetails,
          { $set: req_data.officer_details },
          { new: true }
        );
        if (!user) {
          return res
            .status(404)
            .json(new ApiError(404, "Officer details not found."));
        }
        loggedInUser = await loggedInOfficerInfo(new ObjectId(req_data.userId));
      } else {
        loggedInUser = await loggedInUserInfo(new ObjectId(req_data.userId));
      }
    }

    if (!loggedInUser) {
      return res
        .status(400)
        .json(new ApiError(400, "Failed to update user details."));
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          loggedInUser,
          "Account details updated successfully"
        )
      );
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error!"));
  }
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const req_data = req.body;

  try {
    if (Object.keys(req_data).length === 0 && req_data.constructor === Object) {
      return res
        .status(400)
        .json(new ApiError(400, "Please provide the required fields."));
    }

    if (!req_data.userData?.name || !req_data.userData?.mobile) {
      return res
        .status(400)
        .json(new ApiError(400, "Please provide the required fields."));
    }

    let user;

    if (req_data.userData) {
      user = await User.findByIdAndUpdate(
        req.user?._id,
        {
          $set: req_data.userData,
        }
        // { new: true }
      );
    }
    if (req_data?.officerDetails) {
      user = await OfficerDetails.findOneAndUpdate(
        { Officer: req.user?._id },
        { $set: req_data.officerDetails }
        // { new: true }
      );
    }

    if (user == undefined) {
      return res.status(404).json(new ApiError(404, "user not found"));
    }
    let loggedInUser;
    if (req_data?.officerDetails) {
      loggedInUser = await loggedInOfficerInfo(new ObjectId(req.user?._id));
    } else {
      loggedInUser = await loggedInUserInfo(req.user?._id);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          loggedInUser,
          "Account details updated successfully"
        )
      );
  } catch (error) {
    console.error("Update Error:", error);
    return res.status(500).json(new ApiError(500, "Internal Server Error!"));
  }
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  try {
    const avatarLocalPath = req.file.location;

    if (!avatarLocalPath) {
      return res
        .status(400)
        .json(new ApiError(400, "Error while uploading on avatar"));
    }

    const user = await User.findById(req.user?._id);

    if (
      user?.avatar !=
      "https://x-kop-bucket.s3.ap-south-1.amazonaws.com/user-png-33842.png"
    ) {
      deleteFilesFromS3(user?.avatar);
    }

    await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: {
          avatar: avatarLocalPath,
        },
      },
      { new: true }
    );

    let loggedInUser;
    if (user?.officerDetails && user.officer_details) {
      loggedInUser = await loggedInOfficerInfo(req.user?._id);
    } else {
      loggedInUser = await loggedInUserInfo(req.user?._id);
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, loggedInUser, "Avatar image updated successfully")
      );
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Something went wrong!"));
  }
});

const getAllUser = asyncHandler(async (req, res) => {
  if (req.user.role.UserType !== "Admin") {
    return res
      .status(404)
      .json(new ApiResponse(404, {}, "This User not Allowed To Access Data"));
  }

  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const skip = (page - 1) * perPage;

  const users = await User.aggregate([
    {
      $lookup: {
        from: "userrolemasters",
        localField: "userRoleId",
        foreignField: "_id",
        as: "role",
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: perPage,
    },
    {
      $unwind: "$role",
    },
    {
      $project: {
        ip: 0,
        __v: 0,
        refreshToken: 0,
        OTP: 0,
        OTPExpiry: 0,
        userRoleId: 0,
        "role.createdAt": 0,
        "role.updatedAt": 0,
        "role.__v": 0,
        "role._id": 0,
      },
    },
  ]);

  const totalUsers = await User.countDocuments();

  return res
    .status(200)
    .json(
      new ApiResponse(200, { users, totalUsers }, "Successfully fetched data.")
    );
});

const GetSingleUser = asyncHandler(async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).populate("userRoleId");
    if (admin.userRoleId.UserType != "Admin") {
      return res.status(404).json(new ApiError(404, "User is not Authorized."));
    }
    let user = await User.findById(req.params.id)
      .populate({
        path: "userRoleId",
        select: "-createdAt -updatedAt -__v -_id",
        model: "UserRoleMaster", // Ensure this is the correct model name
        as: "role",
      })
      .populate({
        path: "officerDetails",
        select: "-Officer", // Exclude the Officer field
        model: "OfficerDetails",
      })
      .lean(); // Convert Mongoose document to a plain JavaScript object

    // Remove refreshToken
    delete user.refreshToken;

    // Remove UserType from the populated userRoleId field
    // if (user.userRoleId) {
    //   delete user.userRoleId.UserType;
    // }

    return res.status(200).json(new ApiResponse(200, user, ""));
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json(new ApiError(500, "An error occurred while retrieving the user."));
  }
});

const updateOfficerIdProofDoc = asyncHandler(async (req, res) => {
  const fileUrls = req.files.map((file) => file.location);

  if (!req.files || req.files.length === 0) {
    return res.status(400).send({ message: "No files uploaded." });
  }
  try {
    const officer = await OfficerDetails.findOne({ Officer: req.user?._id });

    if (!officer) {
      return res.status(404).json(new ApiError(404, "Officer not found"));
    }

    if (officer.IDProofDocument && officer.IDProofDocument.length > 0) {
      await deleteFilesFromS3(officer.IDProofDocument);
    }

    await OfficerDetails.findOneAndUpdate(
      { Officer: req.user?._id },
      { $set: { IDProofDocument: fileUrls } }
    );

    const loggedInUser = await loggedInOfficerInfo(new ObjectId(req.user?._id));

    return res
      .status(200)
      .json(
        new ApiResponse(200, loggedInUser, "Document successfully uploaded")
      );
  } catch (error) {
    console.error("Error updating officer ID proof document:", error);
    return res.status(500).json(new ApiError(500, "Something went wrong!"));
  }
});

export {
  signUpUser,
  signInUser,
  verifyPhoneOtp,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  getAllUser,
  updateWallet,
  updateUserDetailsAdmin,
  GetSingleUser,
  updateOfficerIdProofDoc,
};

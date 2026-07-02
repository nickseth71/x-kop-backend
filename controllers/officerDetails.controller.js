import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import OfficerDetails from "./../models/officerDetails.model.js";
import User from "../models/user.model.js";
import ConsultaionType from "../models/consultationType.model.js";

// export const createOfficerDetails = async (officerId) => {
//     try {
//       const consult_type = await ConsultaionType.findOne({});

//       if (!consult_type) {
//        return res.status(400).json(new ApiError(400,'Consultation type not found'))
//       }
//         const officerDetails = new OfficerDetails({Officer:officerId,ConsultationTypeID:consult_type._id});
//         await officerDetails.save();
//         const user = await User.findByIdAndUpdate(
//             officerId,
//             { $set: { officerDetails: officerDetails._id } },
//             { new: true }
//         );
//         return user;
//     } catch (error) {
//       return error.message;
//     }
// }

export const createOfficerDetails = async (officerId) => {
  try {
    const consult_type = await ConsultaionType.findOne({});
    if (!consult_type) {
      return "Consultation type not found";
    }

    const existingOfficerDetails = await OfficerDetails.findOne({
      Officer: officerId,
    });

    if (existingOfficerDetails) {
      const user = await User.findById(officerId);
      return user;
    }

    const officerDetails = new OfficerDetails({
      Officer: officerId,
      ConsultationTypeID: consult_type._id,
    });

    await officerDetails.save();

    const user = await User.findByIdAndUpdate(
      officerId,
      { $set: { officerDetails: officerDetails._id } },
      { new: true }
    );

    return user;
  } catch (error) {
    return error.message;
  }
};

const loggedInOfficerInfo = async (userId) => {
  return await User.aggregate([
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
        from: "officerdetails", // Mongoose typically pluralizes and lowercases collection names
        localField: "officerDetails", // Field in User schema
        foreignField: "_id",
        as: "officerDetails",
      },
    },
    {
      $unwind: "$officerDetails",
    },
    {
      $project: {
        ip: 0,
        _id: 0,
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
};

export const getAllOfficerDetails = asyncHandler(async (req, res) => {
  try {
    const officerDetailsList = await OfficerDetails.find().populate("Absences");
    res.status(200).json(new ApiResponse(200, officerDetailsList, "success"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export const getOfficerDetailsById = asyncHandler(async (req, res) => {
  try {
    const officerDetails = await OfficerDetails.findById(
      req.params.id
    ).populate("Absences");
    if (!officerDetails) {
      return res.status(404).json({ error: "Officer not found" });
    }
    res.status(200).json(new ApiResponse(200, officerDetails, "success"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

//////////////////////////newly added function /////////////////////////
export const getOfficerDetailsByOfficerId = asyncHandler(async (req, res) => {
  try {
    const officerDetails = await OfficerDetails.findOne({
      Officer: req.params.officerId,
    }).populate("Absences");

    if (!officerDetails) {
      return res
        .status(404)
        .json(new ApiError(404, "Officer details not found"));
    }

    res.status(200).json(new ApiResponse(200, officerDetails, "success"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

export const updateOfficerDetails = asyncHandler(
  async (officerDetailId, data) => {
    try {
      const officerDetails = await OfficerDetails.findByIdAndUpdate(
        officerDetailId,
        data,
        { new: true, runValidators: true }
      );
      if (!officerDetails) {
        return "Officer not found";
      }
      return officerDetails;
    } catch (error) {
      return error.message;
    }
  }
);

export const deleteOfficerDetails = asyncHandler(async (req, res) => {
  try {
    const officerDetails = await OfficerDetails.findByIdAndDelete(
      req.params.id
    );
    if (!officerDetails) {
      return res.status(404).json(new ApiError(404, "Officer not found"));
    }
    res.status(204).json(new ApiResponse(204, null, "Officer deleted"));
  } catch (error) {
    res.status(500).json(new ApiError(500, error.message));
  }
});

// export const updateOfficerType = asyncHandler(async (req, res) => {
//     try {
//         const officerDetails = await OfficerDetails.findOneAndUpdate(
//             { Officer: req.user._id },
//             { $set: { officerType: req.body.type } },
//             { new: true, upsert: true } // 'upsert' creates a new document if none exists
//         );

//         const user = await User.findByIdAndUpdate(
//             req.user._id,
//             { $set: { officerDetails: officerDetails._id } },
//             { new: true }
//         );

//         const user_dtl = await loggedInOfficerInfo(req.user._id);

//         res.status(200).json(new ApiResponse(200,user_dtl));
//     } catch (error) {
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });
export const updateOfficerType = asyncHandler(async (officerDetailId, type) => {
  try {
    const officerDetails = await OfficerDetails.findByIdAndUpdate(
      officerDetailId,
      { $set: { ConsultationTypeID: type } },
      { new: true, upsert: true } // 'upsert' creates a new document if none exists
    );

    const user_dtl = await loggedInOfficerInfo(req.user._id);
    return user_dtl;
  } catch (error) {
    return error.message;
  }
});

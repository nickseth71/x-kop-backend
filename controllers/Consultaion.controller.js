import Consultation from "../models/Consultation.model.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import { asyncHandler } from "./../utils/asyncHandler.js";


export const getConsultaionHistoryByDate = asyncHandler(async (req, res) => {

  try {
    const { selectedDate } = req.body;
    const startOfDay = new Date(Date.UTC(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), new Date(selectedDate).getDate(), 0, 0, 0));
    const endOfDay = new Date(Date.UTC(new Date(selectedDate).getFullYear(), new Date(selectedDate).getMonth(), new Date(selectedDate).getDate(), 23, 59, 59, 999));
    

    const consult = await Consultation.find({
      officer: req.user._id,
      startCallTime: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    })
      .populate("customer", "name avatar")
      .populate("officer", "name avatar");

    res.status(200).json(new ApiResponse(200, consult, "Fetched successfully"));
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});

export const getConsultaionHistoryPaginatedList = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const consultations = await Consultation.find({ customer: req.user._id })
      .populate("customer", "name avatar")
      .populate("officer", "name avatar")
      .sort({ startCallTime: -1 }) 
      .skip(skip)
      .limit(Number(limit));

    const totalConsultations = await Consultation.countDocuments({ customer: req.user._id });
    const totalPages = Math.ceil(totalConsultations / limit);

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          consultations,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            totalPages,
            totalConsultations,
          },
        },
        "success"
      )
    );
  } catch (error) {
    return res.status(500).json(new ApiError(500, error.message));
  }
});


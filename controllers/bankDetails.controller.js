import BankDetails from "../models/bankDetails.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const createOrUpdateBankDetails = asyncHandler(async (req, res) => {
  try {
    const { bankName, accountNumber, accountHolder, ifscCode } = req.body;
    const user = req.user._id;

    const bankDetails = await BankDetails.findOneAndUpdate(
      { user },
      {
        bankName,
        accountNumber,
        accountHolder,
        ifscCode,
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    return res
      .status(201)
      .json(
        new ApiResponse(200, bankDetails, "Bank details saved successfully.")
      );
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error!"));
  }
});

export const deleteBankDetails = asyncHandler(async (req, res) => {
  try {
    const user = req.user._id;

    const bankDetails = await BankDetails.findOneAndDelete({ user });

    if (!bankDetails) {
      return res.status(404).json(new ApiError(404, "Bank details not found!"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Bank details deleted successfully."));
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error!"));
  }
});

export const getBankDetails = asyncHandler(async (req, res) => {
  try {
    const user = req.user._id;
    const bankDetails = await BankDetails.findOne({ user });
    return res
      .status(200)
      .json(
        new ApiResponse(200, bankDetails, "Bank details get successfully.")
      );
      
  } catch (error) {
    return res.status(500).json(new ApiError(500, "Internal Server Error!"));
  }
});

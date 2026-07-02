import SettingsModel from "../models/settings.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "./../utils/ApiResponse.js";

export const addSettings = asyncHandler(async (req, res) => {
    try {
        const user = req.user; 
        const { commissionPrice } = req.body;
        const getsettings = await SettingsModel.findOne();
        let settings;
        if (!getsettings) {
            settings = await SettingsModel.create({ commissionPrice });
        } else {
            settings = await SettingsModel.findByIdAndUpdate(
                getsettings._id, 
                { $set: { commissionPrice } }, 
                { new: true } 
            );
        }

        return res.status(201).json(new ApiResponse(201,settings,"success"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error!"));
    }
});

export const getSettings = asyncHandler(async (req,res)=>{
    try {
        let settings = await SettingsModel.findOne();
        if (!settings) {
            settings = await SettingsModel.create({ commissionPrice:0 });
        }

        return res.status(200).json(new ApiResponse(200,settings,"success"));
    } catch (error) {
        return res.status(500).json(new ApiError(500, "Internal Server Error!"));
    }
})

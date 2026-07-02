import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "./../utils/ApiError.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import Absence from './../models/absence.model.js';
import OfficerDetails from './../models/officerDetails.model.js';
import User from "../models/user.model.js";

export const createAbsence = asyncHandler(async (req, res) => {
    try {
        const untilDate = new Date(req.body.untilDate).toISOString().split('T')[0];
        const fromDate = new Date(req.body.fromDate).toISOString().split('T')[0];



        // Validate date range
        if (fromDate > untilDate) {
            return res.status(400).json(new ApiError(400, "Please enter valid dates"));
        }

        // Check if the current user is an officer
        const officer = await User.findById(req.user._id).populate('userRoleId');
        if (!officer || officer.userRoleId.UserType !== "Officer") {
            return res.status(403).json(new ApiError(403, "User is not authorized."));
        }

        // Check for overlapping absences
        const existingAbsence = await Absence.findOne({
            officer: req.user._id,
            $or: [
                {
                    $and: [
                        { fromDate: { $lte: untilDate } },
                        { untilDate: { $gte: fromDate } }
                    ]
                }
            ]
        });

        if (existingAbsence) {
            return res.status(409).json(new ApiError(409, "An overlapping absence already exists."));
        }

        // Create a new absence record
        const absence = new Absence({
            officer: req.user._id,
            reason: req.body.reason,
            fromDate,
            untilDate
        });
        
        await absence.save();

        // Update the OfficerDetails to include the new absence
        await OfficerDetails.findOneAndUpdate(
            {Officer:req.user._id},
            { $push: { Absences: absence._id } },
            { new: true }
        );

        res.status(201).json(new ApiResponse(201, absence, "Absence created successfully."));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

// Get all Absences
export const getAllAbsences = asyncHandler(async (req, res) => {
    try {
        const absences = await Absence.find().populate('officer');
        res.status(200).json(new ApiResponse(200, absences, "Success"));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

// Get Absence by ID
export const getAbsenceById = asyncHandler(async (req, res) => {
    try {
        const absence = await Absence.findById(req.params.id).populate('officer');
        if (!absence) {
            return res.status(404).json(new ApiError(404, "Absence not found"));
        }
        res.status(200).json(new ApiResponse(200, absence, "Success"));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

// Update Absence by ID
export const updateAbsence = asyncHandler(async (req, res) => {
    try {
        const absence = await Absence.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!absence) {
            return res.status(404).json(new ApiError(404, "Absence not found"));
        }
        res.status(200).json(new ApiResponse(200, absence, "Success"));
    } catch (error) {
        res.status(400).json(new ApiError(400, error.message));
    }
});

// Delete Absence by ID
export const deleteAbsence = asyncHandler(async (req, res) => {
    try {
        const absence = await Absence.findByIdAndDelete(req.params.id);

        if (!absence) {
            return res.status(404).json(new ApiError(404, "Absence not found"));
        }

        // Remove the reference from the OfficerDetails
        await OfficerDetails.findByIdAndUpdate(
            absence.officer,
            { $pull: { Absences: absence._id } }
        );

        res.status(204).json(new ApiResponse(204, null, "Absence deleted"));
    } catch (error) {
        res.status(500).json(new ApiError(500, error.message));
    }
});

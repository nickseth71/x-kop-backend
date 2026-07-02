import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import ConsultaionFeeType from "./../models/consultationFeeType.model.js";
import { ApiError } from "../utils/ApiError.js";

const getConsultationFeeType = asyncHandler(async (req, res)=>{
try {
    const getType = await ConsultaionFeeType.find({});
    return res.status(200).json(new ApiResponse(200,getType,"successfully get all consultation Type."));
} catch (error) {
    return res.status(500).json(new ApiError(500,"Internal Server Problem!"));
} 
});


const createConsultationFeeType = asyncHandler( async (req,res)=>{
   try { 
    const { ConsultationTypeID,ConsultationFee,ConsultationTime } = req.body;
    const result = await ConsultaionFeeType.create({ConsultationTypeID,ConsultationFee:parseInt(ConsultationFee),ConsultationTime,IsActive:true});
    return res.status(201).json(new ApiResponse(200,result,"Consultaion Fee Type Created Successfully!"));
   } catch (error) {
    return res.status(500).json(new ApiResponse(500,null,"Internal Server Problem!")); 
   }
});

const updateConsultationFeeTypeStatus = asyncHandler(async (req, res) => {
    try {
        const consultationFeeTypeId = req.params.id;
        const { isActive } = req.body;
        const updateStatusRes = await ConsultaionFeeType.findByIdAndUpdate(
            consultationFeeTypeId,
            { $set: { IsActive: isActive } },
            { new: true } 
        );
        if(!updateStatusRes){
            return res.status(404).json(new ApiResponse(404, null, "Consultation Fee Type Id not Found!"));
        }
        return res.status(200).json(new ApiResponse(200, updateStatusRes, "Consultation Type Update Status!"));
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Problem!"));
    }
});

const deleteConsultationFeeType = asyncHandler(async (req, res) => {
    try {
       
        const consultationTypeId  = req.params.id; 
        const result = await ConsultaionFeeType.findByIdAndDelete(consultationTypeId); 

        if (result) {
            return res.status(200).json(new ApiResponse(200, result, "Consultation Type deleted successfully!"));
        } else {
            return res.status(404).json(new ApiResponse(404, null, "Consultation Type not found!"));
        }
    } catch (error) {
        return res.status(500).json(new ApiResponse(500, null, "Internal Server Problem!"));
    }
});





export {getConsultationFeeType,createConsultationFeeType,updateConsultationFeeTypeStatus,deleteConsultationFeeType};
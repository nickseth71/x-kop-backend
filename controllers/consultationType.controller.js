import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "./../utils/ApiResponse.js";
import ConsultaionType from "./../models/consultationType.model.js";
import { ApiError } from "../utils/ApiError.js";


const getConsultationType = asyncHandler(async (req, res)=>{
try {
    const getType = await ConsultaionType.find();
    return res.status(200).json(new ApiResponse(200,getType,"successfully get all consultation Type."));
} catch (error) {
    return res.status(500).json(new ApiResponse(500,null,"Internal Server Problem!"));
}
})

/////////////////////////////newly added function /////////////////////////
const getConsultationTypeById = asyncHandler(async (req, res) => {
  try {
    const consultationTypeId = req.params.id;

    const consultationType = await ConsultaionType.findById(consultationTypeId);

    if (!consultationType) {
      return res.status(404).json(new ApiError(404, "Consultation Type not found!"));
    }

    return res
      .status(200)
      .json(new ApiResponse(200, consultationType, "Consultation Type fetched successfully!"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiError(500, "Internal Server Problem!"));
  }
});


const createConsultationType = asyncHandler(async(req,res)=>{
   try { 
    const { ConsultationTypeName,FeePerMinute } = req.body;
    const getType = await ConsultaionType.findOne({ConsultationTypeName});
    if(getType !== null){
        return res.status(400).json(new ApiError(400,"Consultaion Type Already Exist!"));
    }
    const consultationTypeData = await ConsultaionType.create({ConsultationTypeName,FeePerMinute,IsActive:true});
    if (!consultationTypeData) {
        return res.status(400).json(new ApiError(400,"Consultation Type is not Created!"));
    }
    const getTypeFinal = await ConsultaionType.find({});
    return res.status(201).json(new ApiResponse(200,getTypeFinal,"Consultaion Type Created Successfully!"));
   } catch (error) {
    return res.status(500).json(new ApiError(500,"Internal Server Problem!"));
   }
});

const updateConsultationType = asyncHandler(async (req, res) => {
    try {
        const consultationTypeId = req.params.id;
        const { IsActive, ConsultationTypeName,FeePerMinute } = req.body; 
        const updateStatusRes = await ConsultaionType.findByIdAndUpdate(
            consultationTypeId,
            { $set: { ConsultationTypeName,FeePerMinute,IsActive } }, 
            { new: true } 
        );
        if (!updateStatusRes) {
            return res.status(404).json(new ApiError(404,"Consultation Type Id Not Found!"));
        }
        const getType = await ConsultaionType.find({});
        return res.status(200).json(new ApiResponse(200, getType, "Consultation Type Update Status!"));
    } catch (error) {
        return res.status(500).json(new ApiError(500,"Internal Server Problem!"));
    }
});


const deleteConsultationType = asyncHandler(async (req, res) => {
    try {
       
        const consultationTypeId  = req.params.id; 
        const result = await ConsultaionType.findByIdAndDelete(consultationTypeId); 

        if (result) {
            const getType = await ConsultaionType.find({});
            return res.status(200).json(new ApiResponse(200, getType, "Consultation Type deleted successfully!"));
        } else {
            return res.status(404).json(new ApiError(404,"Consultation Type not found!"));
        }
    } catch (error) {
      return res.status(500).json(new ApiError(500,"Internal Server Problem!"));
    }
});





export {getConsultationType, getConsultationTypeById,createConsultationType,updateConsultationType,deleteConsultationType};
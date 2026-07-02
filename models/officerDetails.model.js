import mongoose from "mongoose";

const { Schema } = mongoose;

const officerDetailsSchema = new Schema(
  {
    Officer: {
      type: Schema.Types.ObjectId,
      ref: "User",  
    },
    ConsultationTypeID: {
      type: Schema.Types.ObjectId,
      ref: "ConsultaionType",
    },
    JobTitle: {
      type: String,
    },
    Position: {
      type: String,
    },
    OfficerCode: {
      type: String,
    },
    EmergencyContact: {
      type: String, 
    },
    IDProofDocument: [],
    IsActive: {
      type: Boolean,
    },
    Absences: [{
      type: Schema.Types.ObjectId,
      ref: "Absence",
    }],
  },
  {
    timestamps: true,
  }
);

const OfficerDetails = mongoose.model("OfficerDetails", officerDetailsSchema);

export default OfficerDetails;

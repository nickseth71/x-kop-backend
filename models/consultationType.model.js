import mongoose from "mongoose";

const { Schema } = mongoose;

const consultationTypeSchema = new Schema(
  {
    ConsultationTypeName: {
      type: String,
      required: true,
    },
    FeePerMinute:{
      type:Number,
      required:true
    },
    IsActive: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultaionType = mongoose.model(
  "ConsultaionType",
  consultationTypeSchema
);

export default ConsultaionType;

import mongoose from "mongoose";

const { Schema } = mongoose;

const consultationFeeTypeSchema = new Schema(
  {
    ConsultationTypeID: {
      type: Schema.Types.ObjectId,
      ref: "ConsultaionType",
    },
    ConsultationFee: {
      type: Number,
      required: true,
    },
    ConsultationTime: {
      type: String,
      required: true,
    },
    IsActive: {
      type: Boolean
    },
  },
  {
    timestamps: true,
  }
);

const ConsultationFeeType = mongoose.model(
  "ConsultationFeeType",
  consultationFeeTypeSchema
);

export default ConsultationFeeType;

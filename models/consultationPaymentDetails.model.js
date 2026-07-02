import mongoose from "mongoose";

const { Schema } = mongoose;

const consultationPaymentDetailsSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    method: {
      type: String,
    },
    state: {
      type: String,
      default:"INIT"
    },
    amount:{
      type: Number,
      required: true,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    transactionId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const ConsultationPaymentDetails = mongoose.model(
  "ConsultationPaymentDetails",
  consultationPaymentDetailsSchema
);

export default ConsultationPaymentDetails;

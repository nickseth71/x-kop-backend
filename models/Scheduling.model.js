import mongoose from "mongoose";

const { Schema } = mongoose;

const SchedulingSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    officer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    startTime: {
      type: Date, 
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "completed", "canceled"],
      default: "scheduled",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const SchedulingModel = mongoose.model("Scheduling", SchedulingSchema);

export default SchedulingModel;

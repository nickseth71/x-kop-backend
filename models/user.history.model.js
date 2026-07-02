import mongoose from "mongoose";

const { Schema } = mongoose;

const userHistorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    name: {
      type: String,
      required: true,
      maxLength: 70,
    },
    mobile: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    // phoneOtp: {
    //   type: Number,
    // },
    loginTimeDate: {
      type: Date,
    },
    logoutTimeDate: {
      type: Date,
    },
    ip: {
      type: String,
      required: true,
    },
    // sessionTokenExpiryDate: {
    //   type: Date,
    // },
  },
  {
    timestamps: true,
  }
);

const UserHistory = mongoose.model("UserHistory", userHistorySchema);

export default UserHistory;

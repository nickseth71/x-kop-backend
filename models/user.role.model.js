import mongoose from "mongoose";

const { Schema } = mongoose;

const userRoleSchema = new Schema(
  {
    UserType: {
      type: String,
      required: true,
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

const UserRoleMaster = mongoose.model("UserRoleMaster", userRoleSchema);

export default UserRoleMaster;

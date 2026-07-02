import mongoose from "mongoose";

const { Schema } = mongoose;

const SettingsSchema = new Schema(
    {
        commissionPrice: {
          type: Number, 
          default: 0,
          required: true, 
          min: 0, 
          max: 100,
        },
      },
      {
        timestamps: true,
      }
);

const SettingsModel = mongoose.model("Settings", SettingsSchema);

export default SettingsModel;

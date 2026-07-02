// import mongoose from "mongoose";

// const { Schema } = mongoose;

// const ConsultationSchema = new Schema(
//   {
//     customer: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     officer: {
//       type: Schema.Types.ObjectId,
//       ref: "User",
//     },
//     startCallTime: {
//       type: Date,
//     },
//     endCallTime: {
//       type: Date,
//     },
//     totalCallPrice:{
//       type: Number,
//       default:0
//     },
//     payOfficer:{
//       type: Number,
//       default:0
//     },
//     adminCommission:{
//       type: Number,
//       default:0
//     },
//     status: {
//       type: String,
//       enum: ["pending", "completed", "canceled"],
//       default: "pending",
//     },
//     isActive: {
//       type: Boolean,
//       default: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Consultation = mongoose.model("Consultation", ConsultationSchema);

// export default Consultation;



import mongoose from "mongoose";

const { Schema } = mongoose;

const ConsultationSchema = new Schema(
  {
    customer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    officer: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    startCallTime: {
      type: Date,
    },
    endCallTime: {
      type: Date,
    },
    totalCallPrice:{
      type: Number,
      default:0
    },
    payOfficer:{
      type: Number,
      default:0
    },
    adminCommission:{
      type: Number,
      default:0
    },
    status: {
      type: String,
      enum: ["pending", "completed", "canceled"],
      default: "pending",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // NEW FIELDS FOR FREE CALL FEATURE
    isFreeCall: {
      type: Boolean,
      default: false
    },
    freeMinutesUsed: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  }
);

const Consultation = mongoose.model("Consultation", ConsultationSchema); 

export default Consultation;
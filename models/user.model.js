// import mongoose, { Schema } from "mongoose";


// const walletTransactionSchema = new Schema({
//   amount: { type: Number, required: true },
//   type: { type: String, enum: ['credit', 'debit'], required: true },
//   date: { type: Date, default: Date.now },
//   description: String,
// });

// const userSchema = new Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       maxLength: 70,
//       trim: true,
//     },
//     mobile: {
//       type: String,
//       unique: true,
//       required: true,
//       trim: true,
//     },
//     email: {
//       type: String,
//       // unique: true,
//       lowercase: true,
//       trim: true,
//     },
//     avatar: {
//       type: String,
//       default:"https://x-kop-bucket.s3.ap-south-1.amazonaws.com/user-png-33842.png"
//     },
//     loginTimeDate: {
//       type: Date,
//     },
//     logoutTimeDate: {
//       type: Date,
//     },
//     ip: {
//       type: String,
//       required: true,
//     },
//     refreshToken: {
//       type: String,
//     },
//     isActive: {
//       type: Boolean,
//     },
//     isOnline: {
//       type: Boolean,
//     },
//     userRoleId: {
//       type: Schema.Types.ObjectId,
//       ref: "UserRoleMaster",
//     },
//     OTP: {
//       type: Number,
//       trim: true,
//     },
//     OTPExpiry: {
//       type: Date,
//     },
//     currentConsult:{ type: Schema.Types.ObjectId, ref: 'Consultation' },
//     chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
//     transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
//     consultations: [{ type: Schema.Types.ObjectId, ref: 'Consultation' }],
//     wallet: { type: Number, default: 0 },
//     walletTransactions: [walletTransactionSchema],
//     fcmToken:{type:String},
//     isCalling:{
//       type:Boolean,
//       default:false
//     },
//     officerDetails:{type:Schema.Types.ObjectId,ref:"OfficerDetails"},
//     schedules: [{ type: Schema.Types.ObjectId, ref: "Scheduling" }]

//   }, 
//   {
//     timestamps: true,
//   }
// );

//  const User = mongoose.model("User", userSchema);

//  export default User;



import mongoose, { Schema } from "mongoose";

const walletTransactionSchema = new Schema({
  amount: { type: Number, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  date: { type: Date, default: Date.now },
  description: String,
});

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxLength: 70,
      trim: true,
    },
    mobile: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    avatar: {
      type: String,
      default:"https://x-kop-bucket.s3.ap-south-1.amazonaws.com/user-png-33842.png"
    },
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
    refreshToken: {
      type: String,
    },
    isActive: {
      type: Boolean,
    },
    isOnline: {
      type: Boolean,
    },
    userRoleId: {
      type: Schema.Types.ObjectId,
      ref: "UserRoleMaster",
    },
    OTP: {
      type: Number,
      trim: true,
    },
    OTPExpiry: {
      type: Date,
    },
    currentConsult:{ type: Schema.Types.ObjectId, ref: 'Consultation' },
    chats: [{ type: Schema.Types.ObjectId, ref: "Chat" }],
    transactions: [{ type: Schema.Types.ObjectId, ref: "Transaction" }],
    consultations: [{ type: Schema.Types.ObjectId, ref: 'Consultation' }],
    wallet: { type: Number, default: 0 },
    walletTransactions: [walletTransactionSchema],
    fcmToken:{type:String},
    isCalling:{
      type:Boolean,
      default:false
    },
    officerDetails:{type:Schema.Types.ObjectId,ref:"OfficerDetails"},
    schedules: [{ type: Schema.Types.ObjectId, ref: "Scheduling" }],
    // NEW FIELDS FOR FREE CALL FEATURE
    freeMinutesUsed: {
      type: Number,
      default: 0
    },
    hasFreeMinutes: {
      type: Boolean,
      default: true
    },
    freeMinutesLimit: {
      type: Number,
      default: 15
    }
  }, 
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
import mongoose from "mongoose";

const { Schema } = mongoose;

const BankDetailsSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    accountHolder: {
        type: String,
        required: true,
    },
    accountNumber: {
        type: String,  
        required: true,
    },
    bankName: {
        type: String,
        required: true,
    },
    ifscCode: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
});

const BankDetails = mongoose.model("BankDetails", BankDetailsSchema);

export default BankDetails;

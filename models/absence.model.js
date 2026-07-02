import mongoose from "mongoose";

const { Schema } = mongoose;

const absenceSchema = new Schema({
    officer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    reason: {
        type: String,
        required: true,
    },
    fromDate: {
        type: Date,
        required: true,
    },
    untilDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending',
    },
    requestDate: {
        type: Date,
        default: Date.now,
    }
});

const Absence = mongoose.model("Absence", absenceSchema);

export default Absence;

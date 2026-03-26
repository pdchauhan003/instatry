import mongoose from 'mongoose';

const followStatusSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "accepted"], default: "pending" }
}, { timestamps: true });

const FollowStatus = mongoose.models.FollowStatus || mongoose.model("FollowStatus", followStatusSchema);
export default FollowStatus;

const mongoose = require('mongoose');

const followStatusSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' }
}, { timestamps: true });

followStatusSchema.index({ from: 1, to: 1 });

module.exports = mongoose.models.FollowStatus || mongoose.model("FollowStatus", followStatusSchema);

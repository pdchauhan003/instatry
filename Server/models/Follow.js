const mongoose = require('mongoose');

const followSchema = new mongoose.Schema({
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

followSchema.index({ follower: 1, following: 1 });

module.exports = mongoose.models.Follow || mongoose.model("Follow", followSchema);

const mongoose = require("mongoose");

const clearedChatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    otherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    clearedAt: { type: Date, required: true }
}, { timestamps: true });

clearedChatSchema.index({ userId: 1, otherId: 1 }, { unique: true });

module.exports = mongoose.models.ClearedChat || mongoose.model("ClearedChat", clearedChatSchema);

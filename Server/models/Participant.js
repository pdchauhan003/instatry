const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    socketId: { type: String, required: true },
    isOnline: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.models.Participant || mongoose.model('Participant', participantSchema);

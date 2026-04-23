const mongoose = require('mongoose');

const termsSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accepted: { type: Boolean, default: false },
    acceptedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.models.Terms || mongoose.model('Terms', termsSchema);

const mongoose = require('mongoose');

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true },
    password: { type: String, required: true },
    imageBase64: { type: String },
    imageMimeType: { type: String },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    otpRequestCount: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now, expires: 3600 } // Auto-delete after 1 hour
}, { timestamps: true });

module.exports = mongoose.models.PendingUser || mongoose.model('PendingUser', pendingUserSchema);

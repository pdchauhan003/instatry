import mongoose from 'mongoose';

const pendingUserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    password: { type: String, required: true }, // already hashed
    imageBase64: { type: String, default: '' }, // base64 encoded image for temporary storage
    imageMimeType: { type: String, default: '' },
    otp: { type: String, required: true },
    otpExpiry: { type: Date, required: true },
    otpRequestCount: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now, expires: 600 }, // TTL: auto-delete after 10 minutes
});

const PendingUser = mongoose.models.PendingUser || mongoose.model('PendingUser', pendingUserSchema);
export default PendingUser;

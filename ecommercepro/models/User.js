import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    number: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    otp: { type: String },
    googleId: { type: String },
    provider: { type: String, default: "credentials" },
    role: { type: String, enum: ['admin', 'user', 'seller'], default: 'user' },
    contacts: [{ type: String }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    savedposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    sessionId: { type: String, index: true },
    refreshToken: { type: String },
    verificationStatus: { type: String, enum: ['none', 'Pending', 'pending', 'approved', 'rejected', 'seller'], default: "none" }, // none | pending | approved | rejected | seller},
    isVerifiedSeller: { type: Boolean, default: false, },
    otpExpiry: { type: Date },
    otpRequestCount: { type: Number, default: 0 },
    otpLastRequest: { type: Date },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

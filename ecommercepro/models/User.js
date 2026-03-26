import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, required: true },
    email: { type: String, required: true },
    number: { type: String, required: true },
    password: { type: String, required: true },
    image: { type: String },
    otp: { type: String },
    googleId: { type: String },
    provider: { type: String, default: "credentials" },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    contacts: [{ type: String }],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    savedposts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    sessionId: { type: String },
    refreshToken:{type:String},
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;

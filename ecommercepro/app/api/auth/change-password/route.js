import { NextResponse } from 'next/server';
import { User } from '@/lib/database';
import { connectDB } from '@/lib/Connection';
import bcrypt from 'bcryptjs';
import { getAuthUserId } from '@/lib/getAuthUser';

//change password api
export async function POST(req) {
    try {
        await connectDB();

        const authUserId = await getAuthUserId();
        const { email, password } = await req.json();

        let user;
        if (authUserId) {
            // Authenticated change
            user = await User.findById(authUserId);
        } else if (email) {
            // Forgot password flow - must have verified OTP recently
            user = await User.findOne({ email, otp: 'VERIFIED_RESET' });
            if (user && user.otpExpiry && new Date() > new Date(user.otpExpiry)) {
                return NextResponse.json({ success: false, message: "Verification expired. Please verify OTP again." }, { status: 401 });
            }
        }

        if (!user) {
            return NextResponse.json({ success: false, message: authUserId ? "User not found" : "Unauthorized: Please verify OTP first" }, { status: 401 });
        }

        const hashedPass = await bcrypt.hash(password, 10);
        
        // Generate new sessionId to revoke all other sessions
        const crypto = await import('crypto');
        const newSessionId = crypto.randomBytes(32).toString("hex");

        user.password = hashedPass;
        user.otp = ''; // Clear the verification state
        user.otpExpiry = null;
        user.sessionId = newSessionId;
        user.refreshToken = null; // Forces re-login on all devices
        await user.save();

        // Update Redis session
        const redis = (await import("@/services/redis")).default;
        await redis.set(`session:${user._id}`, newSessionId, { ex: 7 * 24 * 60 * 60 });

        return NextResponse.json({ success: true, message: "Password updated successfully. All devices logged out." }, { status: 200 });
    } catch (error) {
        console.log("Error in change-password:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

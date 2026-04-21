import {User} from '@/lib/database'
import { connectDB } from '@/lib/Connection';

export async function POST(req) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ success: false, message: "User not found" });
    }

    //  Wrong OTP
    if (user.otp !== otp) {
      return Response.json({ success: false, message: "Invalid OTP" });
    }

    //  Expiry check
    if (!user.otpExpiry || new Date() > new Date(user.otpExpiry)) {
      return Response.json({
        success: false,
        message: "OTP expired. Request new one ❌",
      });
    }

    //  after Success
    user.otp = null;
    user.otpExpiry = null;
    await user.save();

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error in verify-otp API:", error);
    return Response.json({
      success: false,
      message: "Internal server error",
      error: error.message
    }, { status: 500 });
  }
}
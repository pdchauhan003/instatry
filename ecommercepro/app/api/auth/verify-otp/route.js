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

    //  after Success - set to a special state to allow password reset
    user.otp = 'VERIFIED_RESET';
    // keep expiry for a short window (e.g. 10 more minutes)
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 
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

import { User } from '@/lib/database'
import { connectDB } from '@/lib/Connection';
const nodemailer = require('nodemailer')

export async function POST(req) {
  await connectDB();

  try {
    const { email } = await req.json();

    if (!email) {
      return Response.json({ success: false, message: "Email required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return Response.json({ success: false, message: "User not found" });
    }

    const now = new Date();

    //  Reset after 24 hours
    if (user.otpLastRequest) {
      const diff = now - new Date(user.otpLastRequest);
      const hours = diff / (1000 * 60 * 60);

      if (hours >= 24) {
        user.otpRequestCount = 0;
      }
    }

    // Limit check
    if (user.otpRequestCount >= 5) {
      return Response.json({
        success: false,
        message: "Limit reached. Try again after 24 hours ❌",
      });
    }

    //  Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //  Expiry 5 minutes
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    //  Update user
    user.otp = otp;
    user.otpExpiry = otpExpiry;
    user.otpRequestCount += 1;
    user.otpLastRequest = now;

    await user.save();

    //  Send Email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return Response.json({
      success: true,
      message: `OTP sent (${user.otpRequestCount}/5)`,
    });

  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      message: "Server error",
    });
  }
}
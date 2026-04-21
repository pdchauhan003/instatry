import { PendingUser } from '@/lib/database';
import { connectDB } from '@/lib/Connection';
const nodemailer = require('nodemailer');

export async function POST(req) {
  try {
    await connectDB();
    const { email } = await req.json();

    if (!email) {
      return Response.json({ success: false, message: 'Email required' });
    }

    const pendingUser = await PendingUser.findOne({ email });

    if (!pendingUser) {
      return Response.json({
        success: false,
        message: 'Registration expired. Please register again.',
      });
    }

    // Rate limit: max 5 OTP requests
    if (pendingUser.otpRequestCount >= 5) {
      return Response.json({
        success: false,
        message: 'OTP limit reached. Please register again later.',
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    pendingUser.otp = otp;
    pendingUser.otpExpiry = otpExpiry;
    pendingUser.otpRequestCount += 1;
    await pendingUser.save();

    // Send email
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
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 5 minutes.`,
    });

    return Response.json({
      success: true,
      message: `OTP sent (${pendingUser.otpRequestCount}/5)`,
    });
  } catch (error) {
    console.error('Error in resend-otp (afterregister):', error);
    return Response.json({
      success: false,
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 });
  }
}

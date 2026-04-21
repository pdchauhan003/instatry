import { NextResponse } from 'next/server';
import { User, PendingUser } from '@/lib/database';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/Connection';
const nodemailer = require('nodemailer');

export async function POST(req) {
  await connectDB();
  try {
    const data = await req.formData();
    const name = data.get("name");
    const email = data.get("email");
    const password = data.get("password");
    const number = data.get("number");
    const username = data.get("username");
    const image = data.get("image");

    if (!name || !email || !password || !number || !username) {
      return NextResponse.json({ message: 'Please fill all fields' }, { status: 400 });
    }

    // Check if email or username already exists in real Users
    const [findEmail, findUsername] = await Promise.all([
      User.findOne({ email }),
      User.findOne({ username }),
    ]);

    if (findUsername) {
      return NextResponse.json(
        { message: 'Username already exists' },
        { status: 409 }
      );
    }
    if (findEmail) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Convert image to base64 for temporary storage (if provided)
    let imageBase64 = '';
    let imageMimeType = '';
    if (image && typeof image !== 'string' && image.size > 0) {
      const bytes = await image.arrayBuffer();
      const buffer = Buffer.from(bytes);
      imageBase64 = buffer.toString('base64');
      imageMimeType = image.type || 'image/jpeg';
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min expiry

    // Upsert into PendingUser (replace if same email tries again)
    await PendingUser.findOneAndUpdate(
      { email },
      {
        name,
        username,
        email,
        number,
        password: hashedPassword,
        imageBase64,
        imageMimeType,
        otp,
        otpExpiry,
        otpRequestCount: 1,
        createdAt: new Date(), // reset TTL
      },
      { upsert: true, new: true }
    );

    // Send OTP email
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

    return NextResponse.json(
      { success: true, message: 'OTP sent to your email. Please verify to complete registration.' },
      { status: 200 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    return NextResponse.json(
      { message: `Server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

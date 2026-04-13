import { User } from '@/lib/database'
import { connectDB } from '@/lib/Connection';
const nodemailer = require('nodemailer')
export async function POST(req) {
  await connectDB()
  const { email } = await req.json();
  console.log('email', email)
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  // const otp=String(otps)
  const user = await User.findOneAndUpdate({ email });
  user.otp = otp
  await user.save()

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    service:'gmail',
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
 
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is: ${otp}.`,
  };

  // transporter.sendMail(mailOptions, (error, info) => {
  //   if (error) {
  //     console.log('mail error:', error);
  //     return Response.json({ status: "error", message: "Email sending failed" });
  //   }
  // });
  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("mail error:", error);
    return Response.json({ success: false, message: "Email failed" });
  }
  // return Response.json({ status: "ok", message: "OTP sent to your email" });
  console.log('Otp sended...', otp)
  return Response.json({ success: true });
}

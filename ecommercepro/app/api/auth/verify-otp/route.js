import {User} from '@/lib/database'
import { connectDB } from '@/lib/Connection';

// export async function POST(req){
//     await connectDB()
//     const {email,otp} = await req.json();
//     const user=await User.findOne({email});
//     if(!user){
//         console.log('email not found...')
//         return Response.json({message:'email not found'});
//     }
//     if(user.otp==otp){
//         console.log('otp correct...')
//         return Response.json({success:true});
//     }
//     // console.log('Otp sended...',otp)
//     return Response.json({message:'Invalid otp'});
// }


export async function POST(req) {
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
}
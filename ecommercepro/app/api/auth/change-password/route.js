import {User} from '@/lib/database'
import { connectDB } from '@/lib/Connection';
import bcrypt from 'bcryptjs'
export async function POST(req){
    try {
        await connectDB();
        const {email,password}=await req.json();
        console.log(email)
        const hashedPass=await bcrypt.hash(password,10);
        const user=await User.findOneAndUpdate({email},{password:hashedPass,otp:''},{new:true});
        if(!user){
            return Response.json({message:'User is not registered'})
        }
        return Response.json({success:true});
    } catch (error) {
        console.log("Error in change-password:", error);
        return Response.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}
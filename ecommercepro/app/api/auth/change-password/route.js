import { NextResponse } from 'next/server';
import { User } from '@/lib/database';
import { connectDB } from '@/lib/Connection';
import bcrypt from 'bcryptjs';
export async function POST(req){
    try {
        await connectDB();
        const {email,password}=await req.json();
        console.log(email)
        const hashedPass=await bcrypt.hash(password,10);
        const user=await User.findOneAndUpdate({email},{password:hashedPass,otp:''},{new:true});
        if (!user) {
            return NextResponse.json({ message: 'User is not registered' }, { status: 404 });
        }
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.log("Error in change-password:", error);
        return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
    }
}

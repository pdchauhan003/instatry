import {User} from '@/lib/database'
import { connectDB } from '@/lib/Connection';
import bcrypt from 'bcryptjs'
export async function POST(req,context){
    try {
        await connectDB()
        const params=await context.params;
        const id=params.id;
        const {oldpassword,password,confirmPass}=await req.json();
        const user=await User.findById(id);
        
        if (!user) {
            return Response.json({ success: false, message: "User not found" }, { status: 404 });
        }

        const confirmpass=await bcrypt.compare(oldpassword, user.password)
        if(!confirmpass){
            return Response.json({success: false, message:'old password is wrong'})
        }
        
        // Hash new password and save (assuming that's intended but missing)
        const hashedPass = await bcrypt.hash(password, 10);
        user.password = hashedPass;
        await user.save();

        return Response.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        console.error("Error in POST /api/auth/home/[id]/setting/passchange:", error);
        return Response.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
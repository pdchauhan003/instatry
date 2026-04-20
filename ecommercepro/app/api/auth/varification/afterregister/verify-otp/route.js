import {User} from '@/lib/database'
import { connectDB } from '@/lib/Connection';
export async function POST(req){
    try {
        await connectDB()
        const {email,otp} = await req.json();
        const user=await User.findOne({email});
        if(!user){
            console.log('email not found...')
            return Response.json({message:'email not found'});
        }
        if(user.otp==otp){
            console.log('otp correct...')
            return Response.json({success:true});
        }
        // console.log('Otp sended...',otp)
        return Response.json({message:'Invalid otp'});
    } catch (error) {
        console.error("Error in POST /api/auth/varification/afterregister/verify-otp:", error);
        return Response.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
    
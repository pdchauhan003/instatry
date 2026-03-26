import {User} from '@/lib/database'
import { connectDB } from '@/lib/Connection';
import bcrypt from 'bcryptjs'
export async function POST(req,context){
    await connectDB()
    const params=await context.paerams;
    const id=params.id;
    const {oldpassword,password,confirmPass}=await req.json();
    const user=await User.findById(id);
    const confirmpass=await bcrypt.compare(user.password,oldpassword)
    if(!confirmpass){
        return Response.json({message:'old pass is wrong'})
    }
    
}
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
export async function POST(req,context){
    await connectDB()
    const params=await context.params;
    const {id}=params;
    const user=await User.findOne()
}
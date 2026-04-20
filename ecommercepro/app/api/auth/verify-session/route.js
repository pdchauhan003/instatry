//for check valid sessionid or not 

import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function POST(req){
  try {
    await connectDB();

    const { userId, sessionId } = await req.json();
    const user = await User.findById(userId);

    if(!user || user.sessionId !== sessionId){
      console.log('session is not valid')
      return Response.json({ valid: false });
    }
    console.log('session is valid')
    return Response.json({ valid: true });
  } catch (error) {
    console.log('Error in verify-session:', error);
    return Response.json({ valid: false, error: "Internal Server Error" }, { status: 500 });
  }
}
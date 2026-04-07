//for check valid sessionid or not 

import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function POST(req){
  await connectDB();

  const { userId, sessionId } = await req.json();
  const user = await User.findById(userId);

  if(!user || user.sessionId !== sessionId){
    alert('session is not valid')
    return Response.json({ valid: false });
  }
  alert('session is valid')
  return Response.json({ valid: true });
}
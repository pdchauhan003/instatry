//for check valid sessionid or not 

import redis from "@/services/redis";

export async function POST(req){
  try {
    const { userId, sessionId } = await req.json();
    const storedSessionId = await redis.get(`session:${userId}`);

    if(!storedSessionId || storedSessionId !== sessionId){
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

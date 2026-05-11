import { NextResponse } from "next/server";
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import redis from "@/services/redis";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    
    const refreshToken = req.cookies.get('refreshToken')?.value;
    
    if (refreshToken) {
      await User.findByIdAndUpdate(
        authUserId,
        { refreshToken: null, sessionId: null }
      );
    }

    // Clear Redis session
    try {
      await redis.del(`session:${authUserId}`);
    } catch (redisError) {
      console.error("Redis session deletion failed:", redisError);
    }

    const response = NextResponse.json({ success: true, message: "Logged out successfully" });
    
    // Clear cookies
    response.cookies.set("accessToken", "", { maxAge: 0, path: "/" });
    response.cookies.set("refreshToken", "", { maxAge: 0, path: "/" });
    
    return response;
  } catch (error) {
    console.error("Error in logout API:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error", 
      error: error.message 
    }, { status: 500 });
  }
}

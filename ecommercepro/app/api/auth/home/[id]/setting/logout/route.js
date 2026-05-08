import { NextResponse } from "next/server";
import { User } from "@/lib/database";
import { connectDB } from "@/services/mongodb";
import redis from "@/services/redis";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req, { params }) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    
    // Verify ownership
    if (id !== authUserId) {
        return NextResponse.json({ success: false, message: "Forbidden: Cannot logout other users" }, { status: 403 });
    }

    const refreshtoken = req.cookies.get('refreshToken')?.value;
    
    if (refreshtoken) {
      await User.findOneAndUpdate(
        { refreshToken: refreshtoken },
        { refreshToken: null, sessionId: null }
      );
    }

    // Clear Redis session
    try {
      await redis.del(`session:${id}`);
    } catch (redisError) {
      console.error("Redis session deletion failed:", redisError);
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set("accessToken",'',{maxAge:0});
    response.cookies.set('refreshToken','',{maxAge:0});
    return response;
  } catch (error) {
    console.error("Error in logout API:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}

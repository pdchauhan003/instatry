import { allFriends } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function GET(req) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);

    const userId = authUserId; // Use token ID to fetch personal feed securely
    const cursor = searchParams.get("cursor");

    const data = await allFriends(userId, cursor);

    return NextResponse.json({
      posts: data.posts,
      nextCursor: data.nextCursor,
    });
  } catch (error) {
    console.error("Error in GET /api/auth/feed:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}
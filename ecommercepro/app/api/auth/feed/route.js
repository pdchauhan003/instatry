import { allFriends } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");
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
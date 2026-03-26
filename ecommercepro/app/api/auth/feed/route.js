import { allFriends } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";

export async function GET(req) {
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  const cursor = searchParams.get("cursor");

  const data = await allFriends(userId, cursor);

  return NextResponse.json({
    posts: data.posts,
    nextCursor: data.nextCursor,
  });
}
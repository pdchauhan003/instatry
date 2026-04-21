import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { unfollowUser } from "@/controller/follow.controller";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function PUT(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params.id;

    if (id !== authUserId) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { friendId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, message: "Invalid user id" }, { status: 400 });
    }

    const data = await unfollowUser(id, friendId);

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
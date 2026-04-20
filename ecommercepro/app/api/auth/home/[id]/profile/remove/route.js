import mongoose from "mongoose";
import { unfollowUser } from "@/controller/follow.controller";
export async function PUT(req, context) {
  try {
    const params = await context.params;
    const id = params.id;

    const { friendId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid user id" }, { status: 400 });
    }

    const data = await unfollowUser(id, friendId);

    return Response.json(data);

  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
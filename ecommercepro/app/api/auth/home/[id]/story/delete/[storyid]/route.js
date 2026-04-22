import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUser";
import { deleteStory } from "@/controller/post&story.controller";

export async function DELETE(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id, storyid } = await context.params;

    if (id !== authUserId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const result = await deleteStory(storyid, id);

    if (result) {
      return NextResponse.json({ success: true, message: "Story deleted successfully" });
    } else {
      return NextResponse.json({ success: false, message: "Story not found or unauthorized" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error in deleteStory API:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}

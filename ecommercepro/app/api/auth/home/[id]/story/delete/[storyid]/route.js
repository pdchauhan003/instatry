import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";
import { deleteStory } from "@/controller/post&story.controller";

export async function DELETE(req, context) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    const session = await verifySession(token);
    
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { id, storyid } = await context.params;

    // Allow deletion if user is the owner OR if user is admin
    if (id !== session.userId && session.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const result = await deleteStory(storyid, session.userId, session.role);

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

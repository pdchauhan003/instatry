import { deletePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

export async function DELETE(req, context) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        const session = await verifySession(token);
        
        if (!session) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const params = await context.params;
        const postid = params.postid;

        // Pass role to controller for admin moderation support
        const success = await deletePost(postid, session.userId, session.role);
        
        if (success) {
            return NextResponse.json({ message: 'post deleted success', success: true });
        }
        else {
            return NextResponse.json({ message: 'Error deleting post or unauthorized', success: false }, { status: 403 });
        }
    } catch (error) {
        console.error("Error in delete post API:", error);
        return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
    }
}

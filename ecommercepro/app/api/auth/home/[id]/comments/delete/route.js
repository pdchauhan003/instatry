import { Comment } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId)
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );

    await connectDB();

    const params = await context.params;
    const id = params.id;

    if (id !== authUserId) {
      return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { commentId, postid } = await req.json();

    if (!commentId) {
      return Response.json(
        { success: false, message: "commentId is required" },
        { status: 400 }
      );
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return Response.json(
        { success: false, message: "Comment not found" },
        { status: 404 }
      );
    }

    if (postid && String(comment.post) !== String(postid)) {
      return Response.json(
        { success: false, message: "Comment does not belong to this post" },
        { status: 400 }
      );
    }

    if (String(comment.author) !== String(authUserId)) {
      return Response.json(
        { success: false, message: "You can delete only your own comments" },
        { status: 403 }
      );
    }

    await Comment.deleteOne({ _id: commentId });
    return Response.json({ success: true, message: "Deleted comment" });
  } catch (error) {
    console.error("Error in POST /api/auth/home/[id]/comments/delete:", error);
    return Response.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}

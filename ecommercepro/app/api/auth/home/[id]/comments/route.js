import { Post,Comment } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { getAllPostComments } from "@/controller/comments.controller";
import { getUserNameUsingId } from "@/controller/user.controller";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req,context){
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

        await connectDB();

        const params=await context.params;
        const id=params.id;

        if (id !== authUserId) {
            return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
        }
        const { postid, limit, cursor } = await req.json();
        const uname=await getUserNameUsingId(id);   //logged in username

        // Always use pagination if limit is provided.
        const result = await getAllPostComments(postid, { limit, cursor });

        const commentData = Array.isArray(result) ? result : result.items;
        const hasMore = Array.isArray(result) ? false : result.hasMore;
        const nextCursor = Array.isArray(result) ? null : result.nextCursor;

        return Response.json({
          message: "Comments",
          commentData,
          username: uname,
          hasMore,
          nextCursor,
        });
    } catch (error) {
        console.error("Error in POST /api/auth/home/[id]/comments:", error);
        return Response.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

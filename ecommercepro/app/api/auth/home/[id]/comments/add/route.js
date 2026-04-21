import { Comment } from "@/lib/database";
import { connectDB } from "@/services/mongodb";
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
        const {postid,comment}=await req.json();
        const commentAdd=await Comment.create({
            text:comment,
            post:postid,
            author:id
        })
        if(!commentAdd){
            return Response.json({message:'error in add comment',success:false})
        }
        return Response.json({message:'Added comment',success:true});
    } catch (error) {
        console.error("Error in POST /api/auth/home/[id]/comments/add:", error);
        return Response.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
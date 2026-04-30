import { Comment } from "@/lib/database";
import { connectDB } from "@/services/mongodb";
import { getAuthUserId } from "@/lib/getAuthUser";
import { getUserImageAndUsername } from "@/controller/user.controller";

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
        const userss=await getUserImageAndUsername(id);
        console.log('detail of the user after add',userss);
        if(!commentAdd){
            return Response.json({message:'error in add comment',success:false})
        }
        return Response.json({
          message: "Added comment",
          success: true,
          comment: {
            _id: commentAdd._id,
            text: commentAdd.text,
            createdAt: commentAdd.createdAt,
            author: {
              _id: id,
              username: userss?.username,
              image: userss?.image,
            },
          },
          userDetail: userss,
        });
    } catch (error) {
        console.error("Error in POST /api/auth/home/[id]/comments/add:", error);
        return Response.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

import { Post,Comment } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { getAllPostComments } from "@/controller/comments.controller";
import { getUserNameUsingId } from "@/controller/user.controller";

export async function POST(req,context){
    try {
        await connectDB();

        const params=await context.params;
        const id=params.id;
        const {postid}=await req.json();
        const uname=await getUserNameUsingId(id);   //logged in username

        const commentData=await getAllPostComments(postid);
        if(!commentData){
            console.log('error to fetch comments')
            return Response.json({message:'not comment found'});
        }
        
        console.log('commentdata ia',commentData);
        
        return Response.json({message:'Comments',commentData:commentData,username:uname})
    } catch (error) {
        console.error("Error in POST /api/auth/home/[id]/comments:", error);
        return Response.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
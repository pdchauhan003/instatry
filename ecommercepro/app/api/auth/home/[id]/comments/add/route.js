import { Comment } from "@/lib/database";
import { connectDB } from "@/services/mongodb";
export async function POST(req,context){
    await connectDB();
    const params=await context.params;
    const id=params.id;
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
}
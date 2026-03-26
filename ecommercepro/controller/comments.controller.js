import { Post,Comment } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export const getAllPostComments=async(postId)=>{
    await connectDB();
    const commentData=await Comment.find({post:postId}).populate({
        path:'author',
        select:'username image'
    })

    if(!commentData){
        return Response.json({message:'not comment found'});
    }

    return commentData;
}

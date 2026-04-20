import { Post,Comment } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export const getAllPostComments=async(postId)=>{
    try {
        await connectDB();
        const commentData = await Comment.find({ post: postId }).populate({
          path: "author",
          select: "username image",
        });

        if(!commentData){
            return []; // Return empty array if no comments
        }

        return commentData;
    } catch (error) {
        console.error("Error in getAllPostComments controller:", error);
        throw error;
    }
}

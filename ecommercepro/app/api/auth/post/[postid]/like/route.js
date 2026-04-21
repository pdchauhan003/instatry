import { Post } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function PUT(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    await connectDB();
    const params = await context.params;
    const postid = params.postid;
    const userId = authUserId; // Use secured token ID

    const post = await Post.findById(postid);
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }
    console.log('post data is', post)
    const alreadyLiked = post.likes.includes(userId);
    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();

    const updatedPost = await Post.findById(postid).populate("author", "username");

    return NextResponse.json({
      success: true,
      post: updatedPost,
    });
  } catch (error) {
    console.error("Error in like post API:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}  

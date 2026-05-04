import { Post, Likes } from "@/lib/database";
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
    const userId = authUserId;

    const post = await Post.findById(postid);
    if (!post) {
      return NextResponse.json({ success: false, message: "Post not found" }, { status: 404 });
    }

    const existingLike = await Likes.findOne({ post: postid, user: userId });

    if (existingLike) {
      // Unlike
      await Likes.deleteOne({ _id: existingLike._id });
      await Post.findByIdAndUpdate(postid, { $inc: { likesCount: -1 } });
    } else {
      // Like
      await Likes.create({ post: postid, user: userId });
      await Post.findByIdAndUpdate(postid, { $inc: { likesCount: 1 } });
    }

    const updatedPost = await Post.findById(postid)
      .populate("author", "username")
      .lean();

    // To maintain compatibility with existing frontend expectations while we migrate
    // we'll return isLiked and likesCount
    const isLiked = !existingLike; // If it didn't exist before, it exists now
    
    return NextResponse.json({
      success: true,
      post: {
        ...updatedPost,
        isLiked,
        // Fallback for frontend that might still expect post.likes.length
        likes: new Array(updatedPost.likesCount || 0).fill(0) 
      },
    });
  } catch (error) {
    console.error("Error in like post API:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}

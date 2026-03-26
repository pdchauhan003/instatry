import { Post } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { NextResponse } from "next/server";

export async function PUT(req,context) {
  await connectDB();
  const params=await context.params;
  const postid = params.postid;
  const { userId } = await req.json();
  const post = await Post.findById(postid);
  console.log('post data is',post)
  const alreadyLiked = post.likes.includes(userId);
  if (alreadyLiked) {
    post.likes.pull(userId);
  } else {
    post.likes.push(userId);
  }
  await post.save();

  const updatedPost = await Post.findById(postid)
    .populate("author", "username");

//   const upPost=await Post.findByIdAndUpdate(postid,{
//     like:{}
//   })
  return NextResponse.json({
    success: true,
    post: updatedPost,
  });
}

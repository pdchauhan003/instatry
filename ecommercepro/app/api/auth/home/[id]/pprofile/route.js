import { Follow, User, Post } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import mongoose from "mongoose";
import { getFollowingsCount, getFollowersCount, getFollowersFromDB, getFollowingsFromDB } from "@/controller/follow.controller";
import { checkFollowings } from "@/controller/follow.controller";
import { getUserBio } from "@/controller/user.controller";

export async function GET(req, context) {
  await connectDB();
  const params = await context.params;
  const id = params.id;
  // Validate ID
  console.log('user id is::',id)
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return Response.json({ message: "Invalid user id" }, { status: 400 });
  }

  const [user,posts]=await Promise.all([
    User.findById(id).select('username image name').lean(),
    Post.find({author:id}).sort({createdAt:-1}).lean()
  ])

  if (!user) {
    console.log('user not found')
    return Response.json({ message: "Main user not found" }, { status: 404 });
  }

  // const followers=await checkFollowers(id);
  // const followings=await checkFollowings(id)

  const followers=await getFollowersFromDB(id);
  const followings=await getFollowingsFromDB(id);

  const followerCount=await getFollowersCount(id)
  const followingCount=await getFollowingsCount(id)

  const userDataa={...user,posts}
  console.log('our data in server',userDataa)

  const userInfo=await getUserBio(id)
  console.log('user info is',userInfo)
  return Response.json({userData:{...user,posts,followings,followers,userInfo,followerCount,followingCount}});
}

import { Post, User, Follow } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { IndividualPosts } from "@/controller/post&story.controller";
import { findFriendOrNot, findPendingReq } from "@/controller/follow.controller";
import { checkFollowers } from "@/controller/follow.controller";
import { checkFollowings } from "@/controller/follow.controller";
import { getUserBioOnly } from "@/controller/user.controller";
// import { getFollowersCount, getFollowersFromDB, getFollowingsCount, getFollowingsFromDB } from "@/handler/FindFollowerFollowing";
import { getFollowersCount, getFollowersFromDB, getFollowingsCount, getFollowingsFromDB } from "@/controller/follow.controller";

export async function POST(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;
    const { username } = await req.json();

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return Response.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isFriend = await findFriendOrNot(id, user._id);//check friend or not
    const isPending = await findPendingReq(id, user._id);//check req is pending or not

    let friends=false;
    let requested=false;

    if(isFriend && !isPending){
      friends=true;
    }
    if (isPending) {
      requested = true;
    }

    let posts = [];
    if (isFriend) {
      posts = await IndividualPosts(user._id);
    }
    console.log('posts is searched persons',posts)

    // const followers=await checkFollowers(user._id);  //followers
    // const followings=await checkFollowings(user._id);  // followings
    const followers=await getFollowersFromDB(user._id);
    const followings=await getFollowingsFromDB(user._id);
    const followerCount=await getFollowersCount(user._id);
    const followingCount=await getFollowingsCount(user._id)

    const bio=await getUserBioOnly(user._id)
    console.log('bio in server friend',bio)
    return Response.json({
      success: true,
      friend: friends,
      user,
      friendid: user._id,
      posts,
      requested,
      followers,
      followings,
      bio,
      followerCount,
      followingCount,
    });

  } catch (error) {
    console.log("PROFILE ROUTE ERROR:", error);

    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

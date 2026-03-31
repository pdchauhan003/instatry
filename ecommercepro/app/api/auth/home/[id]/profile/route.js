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

    const [isFriend, isPending, posts, followers, followings, followerCount, followingCount, bio] = await Promise.all([
      findFriendOrNot(id, user._id),
      findPendingReq(id, user._id),
      IndividualPosts(user._id),
      getFollowersFromDB(user._id),
      getFollowingsFromDB(user._id),
      getFollowersCount(user._id),
      getFollowingsCount(user._id),
      getUserBioOnly(user._id)
    ]);

    const friends = isFriend && !isPending;
    const requested = !!isPending;

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

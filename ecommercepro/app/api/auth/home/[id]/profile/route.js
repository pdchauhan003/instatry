import { NextResponse } from "next/server";
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { IndividualPosts } from "@/controller/post&story.controller";
import { findFriendOrNot, findPendingReq } from "@/controller/follow.controller";
import { getFollowersCount, getFollowersFromDB, getFollowingsCount, getFollowingsFromDB } from "@/controller/follow.controller";
import { getUserBioOnly } from "@/controller/user.controller";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();

    const params = await context.params;
    const id = params.id;

    if (id !== authUserId) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }
    const { username } = await req.json();

    const user = await User.findOne({ username }).lean();
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const [isFriend, isPending, posts, followers, followings, followerCount, followingCount, bioData] = await Promise.all([
      findFriendOrNot(id, user._id),
      findPendingReq(id, user._id),
      IndividualPosts(user._id, id),
      getFollowersFromDB(user._id),
      getFollowingsFromDB(user._id),
      getFollowersCount(user._id),
      getFollowingsCount(user._id),
      getUserBioOnly(user._id)
    ]);

    const friends = isFriend && !isPending;
    const requested = !!isPending;

    return NextResponse.json({
      success: true,
      friend: friends,
      user,
      friendid: user._id,
      posts,
      requested,
      followers,
      followings,
      bio: bioData,
      followerCount,
      followingCount,
    }, { status: 200 });

  } catch (error) {
    console.log("PROFILE ROUTE ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}

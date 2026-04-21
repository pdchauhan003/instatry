import { User, Follow, Post } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function GET(req, context) {
  try {
    await connectDB();
    const params = await context.params;
    const id = params.id;

    // check for our data only 
    const user = await User.findById(id).select("username image").lean();

    // Get friends with full data
    const follows = await Follow.find({
      $or: [{ follower: id }, { following: id }],
    })
      .populate({
        path: "follower following",
        select: "name username image posts",

      })
      .lean();

    // Extract ONLY friend data (not myself)
    const cleanFriends = follows.map((doc) => {
      const ourUser = doc.follower;
      const friendUser = doc.following;

      return ourUser._id.toString() === id ? friendUser : ourUser;
    });

    // Remove duplicates (important)
    const uniqueFriends = Array.from(
      new Map(cleanFriends.map((u) => [u._id.toString(), u])).values(),
    );

    const friendsId = uniqueFriends.map((i) => i._id); // fetching friends id
    console.log("unique friends is is ", friendsId);

    const checkonly=await Post.find({author:id})
    console.log('checkonly',checkonly)

      const posts = await Post.find({
        $or: [{ author: id }, { author: { $in: friendsId } }],
      })
      .sort({ createdAt: -1 })
      .populate({
        path: "author",
        select: "username image",
      })
      .populate({
        path: "comments",
        select: "username image",
    });
    console.log("posts iss", posts);

    return Response.json({
      user: user,
      success: true,
      friendsCount: uniqueFriends.length,
      friends: uniqueFriends,
      posts: posts,
    });
  } catch (error) {
    console.log('Error in GET /api/auth/home/[id]:', error);
    return Response.json({ message: "Internal server error", success: false, error: error.message }, { status: 500 });
  }
}


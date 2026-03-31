import { connectDB } from "@/lib/Connection";
import { User, Follow, Post, Story, Saved } from "@/lib/database";

export const allFriends = async (userId, cursor = null) => {

  await connectDB();

  const userPromise = User.findById(userId).select("username image").lean();

  // Parallelize Follow queries
  const [user, sentFollows, receivedFollows] = await Promise.all([
    userPromise,
    Follow.find({ follower: userId }).populate("following", "username image").lean(),
    Follow.find({ following: userId }).populate("follower", "username image").lean(),
  ]);

  if (!user) return null;

  const followingUsers = sentFollows.map(doc => doc.following).filter(Boolean);
  const followerUsers = receivedFollows.map(doc => doc.follower).filter(Boolean);

  const uniqueFriends = Array.from(
    new Map(
      [...followingUsers, ...followerUsers].map(u => [u._id.toString(), u])
    ).values()
  );

  const friendsId = uniqueFriends.map(u => u._id);
  const authors = [userId, ...friendsId];

  // ---------- POSTS, STORIES, SAVED (Parallelized) ----------
  const postQuery = { author: { $in: authors } };
  if (cursor) postQuery._id = { $lt: cursor };

  const [posts, storyData, savedPosts] = await Promise.all([
    Post.find(postQuery).sort({ _id: -1 }).limit(10).populate("author", "username image").lean(),
    Story.aggregate([
      { $match: { author: { $in: authors } } },
      { $sort: { createdAt: -1 } },
      { $group: { _id: "$author", story: { $first: "$$ROOT" } } }
    ]),
    Saved.find({ user: userId }).select("post").lean()
  ]);

  const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

  // populate stories manually
  const populatedStories = await Story.populate(storyData.map(s => s.story), {
    path: "author",
    select: "username image"
  });

  const savedIds = savedPosts.map(s => s.post.toString());
  const result = {
    user,
    friends: uniqueFriends,
    friendsId,
    posts,
    stories: populatedStories,
    savedIds,
    nextCursor
  };

  return JSON.parse(JSON.stringify(result));
};


export const IndividualPosts=async(userId)=>{
    await connectDB();
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean();

    return posts;
}

export const deletePost=async(postId)=>{
  await connectDB();
  const res=await Post.deleteOne({_id:postId});
  return !!res
}

export const savePost=async(postId,userId)=>{
  await connectDB();
  const res=await Saved.create({
    post:postId,
    user:userId
  })
  return res;
}

export const unsavePost=async(postId,userId)=>{
  await connectDB();
  const res=await Saved.deleteOne({post:postId,user:userId})
  return res;
}

export const getSavedPosts = async (userId) => {
  await connectDB();
  const savedPosts = await Saved.find({ user: userId }).populate({
      path: "post",
      populate: {
        path: "author",
        select: "username image"
      }
    }).lean();

  return JSON.parse(JSON.stringify(savedPosts));
};
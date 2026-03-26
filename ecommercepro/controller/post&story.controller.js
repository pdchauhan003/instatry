import { connectDB } from "@/lib/Connection";
import { User, Follow, Post, Story, Saved } from "@/lib/database";

export const allFriends = async (userId, cursor = null) => {

  await connectDB();

  const user = await User.findById(userId)
    .select("username image")
    .lean();

  if (!user) return null;

  // FOLLOW DATA
  const [sentFollows, receivedFollows] = await Promise.all([
    Follow.find({ follower: userId })
      .populate("following", "username image")
      .lean(),

    Follow.find({ following: userId })
      .populate("follower", "username image")
      .lean(),
  ]);

  const followingUsers = sentFollows.map(doc => doc.following).filter(Boolean);
  const followerUsers = receivedFollows.map(doc => doc.follower).filter(Boolean);

  // 
  const uniqueFriends = Array.from(
    new Map(
      [...followingUsers, ...followerUsers].map(u => [u._id.toString(), u])
    ).values()
  );

  const friendsId = uniqueFriends.map(u => u._id); // all friends id

  const authors = [userId, ...friendsId]; // list that stor friends and our id

  // ---------- POSTS WITH CURSOR PAGINATION ----------

  // create auther array for posts of author and friends
  const postQuery = {
    author: { $in: authors }
  };

  if (cursor) {
    postQuery._id = { $lt: cursor };
  }

  const posts = await Post.find(postQuery).sort({ _id: -1 }).limit(3).populate("author", "username image").lean();

  const nextCursor =
    posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

  // ---------- story 24h One per User ----------
  const stories = await Story.aggregate([
    {
      $match: {
        author: { $in: authors },
        // createdAt: {
        //   $gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        // }
      }
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: "$author",
        story: { $first: "$$ROOT" }
      }
    }
  ]);

  // populate author manually
  const populatedStories = await Story.populate(stories.map(s => s.story), {
    path: "author",
    select: "username image"
  });

  // ---------- SAVED POSTS ----------
const savedPosts = await Saved.find({ user: userId }).select("post").lean();
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
import { connectDB } from "@/lib/Connection";
import { User, Follow, Post, Story, Saved } from "@/lib/database";
import mongoose from 'mongoose'
// import Likes from "@/models/likes";

// export const allFriends = async (userId, cursor = null) => {

//   await connectDB();

//   const userPromise = User.findById(userId).select("username image").lean();

//   // Parallelize Follow queries
//   const [user, sentFollows, receivedFollows] = await Promise.all([
//     userPromise,
//     Follow.find({ follower: userId }).populate("following", "username image").lean(),
//     Follow.find({ following: userId }).populate("follower", "username image").lean(),
//   ]);

//   if (!user) return null;

//   const followingUsers = sentFollows.map(doc => doc.following).filter(Boolean);
//   const followerUsers = receivedFollows.map(doc => doc.follower).filter(Boolean);

//   const uniqueFriends = Array.from(
//     new Map(
//       [...followingUsers, ...followerUsers].map(u => [u._id.toString(), u])
//     ).values()
//   );

//   const friendsId = uniqueFriends.map(u => u._id);
//   const authors = [userId, ...friendsId];

//   // ---------- POSTS, STORIES, SAVED (Parallelized) ----------
//   const postQuery = { author: { $in: authors } };
//   if (cursor) postQuery._id = { $lt: cursor };

//   const [posts, storyData, savedPosts, likes] = await Promise.all([
//     Post.find(postQuery).sort({ _id: -1 }).limit(10).populate("author", "username image").lean(),
//     Story.aggregate([
//       { $match: { author: { $in: authors } } },
//       { $sort: { createdAt: -1 } },
//       { $group: { _id: "$author", story: { $first: "$$ROOT" } } }
//     ]),
//     Saved.find({ user: userId }).select("post").lean(),
//     Likes.find({post:posts._id}).select('likes').lean()
//   ]);

//   const nextCursor = posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

//   // populate stories manually
//   const populatedStories = await Story.populate(storyData.map(s => s.story), {
//     path: "author",
//     select: "username image"
//   });

//   const savedIds = savedPosts.map(s => s.post.toString());
//   const result = {
//     user,
//     friends: uniqueFriends,
//     friendsId,
//     posts,
//     stories: populatedStories,
//     savedIds,
//     nextCursor
//   };

//   return JSON.parse(JSON.stringify(result));
// };



export const allFriends = async (userId, cursor = null) => {
  try {
    await connectDB();

    const userObjectId = new mongoose.Types.ObjectId(userId);

    //connections 
    const connections = await Follow.find({
      follower: userObjectId
    })
      .select("follower following")
      .lean();

    const userIds = new Set([userId]);

    for (const c of connections) {
      userIds.add(c.follower.toString());
      userIds.add(c.following.toString());
    }

    const ids = [...userIds].map((id) => new mongoose.Types.ObjectId(id));

    const match = { author: { $in: ids } };

    if (cursor) {
      match._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    // posts aggregation
    const posts = await Post.aggregate([
      { $match: match },

      { $sort: { _id: -1 } },
      { $limit: 10 },

      // Join user 
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [
            { $project: { username: 1, image: 1 } }
          ],
          as: "author"
        }
      },
      { $unwind: "$author" },

      //Convert everything to STRING 
      {
        $addFields: {
          _id: { $toString: "$_id" },
          "author._id": { $toString: "$author._id" },
          likes: {
            $map: {
              input: "$likes",
              as: "l",
              in: { $toString: "$$l" }
            }
          }
        }
      },

      // structure
      {
        $project: {
          post: 1,
          caption: 1,
          createdAt: 1,
          likes: 1,
          author: 1
        }
      }
    ]);

    const nextCursor = posts.length ? posts[posts.length - 1]._id : null;

    // Parallel queries
    const [stories, savedPosts, user] = await Promise.all([
      Story.aggregate([
        { $match: { author: { $in: ids } } },
        { $sort: { createdAt: -1 } },

        {
          $group: {
            _id: "$author",
            story: { $first: "$$ROOT" }
          }
        },

        {
          $lookup: {
            from: "users",
            localField: "_id",
            foreignField: "_id",
            pipeline: [{ $project: { username: 1, image: 1 } }],
            as: "author"
          }
        },
        { $unwind: "$author" },

        {
          $addFields: {
            _id: { $toString: "$_id" },
            "author._id": { $toString: "$author._id" }
          }
        }
      ]),

      Saved.find({ user: userObjectId }).select("post").lean(),

      User.findById(userObjectId)
        .select("username image")
        .lean()
    ]);

    return {
      user: {
        ...user,
        _id: user?._id?.toString()
      },
      posts,
      stories,
      savedIds: savedPosts.map((s) => s.post.toString()),
      nextCursor
    };
  } catch (error) {
    console.error("Error in allFriends controller:", error);
    throw error;
  }
};



export const IndividualPosts = async (userId) => {
  try {
    await connectDB();
    const posts = await Post.find({ author: userId })
      .sort({ createdAt: -1 })
      .lean();

    return posts;
  } catch (error) {
    console.error("Error in IndividualPosts controller:", error);
    throw error;
  }
}

export const deletePost = async (postId) => {
  try {
    await connectDB();
    const res = await Post.deleteOne({ _id: postId });
    return !!res
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    throw error;
  }
}

export const savePost = async (postId, userId) => {
  try {
    await connectDB();
    const res = await Saved.create({
      post: postId,
      user: userId
    })
    return res;
  } catch (error) {
    console.error("Error in savePost controller:", error);
    throw error;
  }
}

export const unsavePost = async (postId, userId) => {
  try {
    await connectDB();
    const res = await Saved.deleteOne({ post: postId, user: userId })
    return res;
  } catch (error) {
    console.error("Error in unsavePost controller:", error);
    throw error;
  }
}

export const getSavedPosts = async (userId) => {
  try {
    await connectDB();
    const savedPosts = await Saved.find({ user: userId }).populate({
      path: "post",
      populate: {
        path: "author",
        select: "username image"
      }
    }).lean();

    return JSON.parse(JSON.stringify(savedPosts));
  } catch (error) {
    console.error("Error in getSavedPosts controller:", error);
    throw error;
  }
};

export const getLikes = async (postId) => {
  await connectDB();

}
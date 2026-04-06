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



// export const allFriends = async (userId, cursor = null) => {
//   await connectDB();

//   const userObjectId = new mongoose.Types.ObjectId(userId);

//   // -------------------------------
//   // 1. GET CONNECTIONS (FAST)
//   // -------------------------------
//   const connections = await Follow.aggregate([
//     {
//       $match: {
//         $or: [
//           { follower: userObjectId },
//           { following: userObjectId }
//         ]
//       }
//     },
//     {
//       $project: {
//         users: ["$follower", "$following"]
//       }
//     },
//     { $unwind: "$users" },
//     {
//       $group: {
//         _id: null,
//         users: { $addToSet: "$users" }
//       }
//     }
//   ]);

//   let userIds = connections[0]?.users || [];
//   userIds.push(userObjectId); // include self

//   // -------------------------------
//   // 2. POSTS (AGGREGATION + CURSOR)
//   // -------------------------------
//   const matchStage = {
//     author: { $in: userIds }
//   };

//   if (cursor) {
//     matchStage._id = { $lt: new mongoose.Types.ObjectId(cursor) };
//   }

//   const posts = await Post.aggregate([
//     { $match: matchStage },

//     { $sort: { _id: -1 } },

//     { $limit: 10 },

//     // JOIN USER
//     {
//       $lookup: {
//         from: "users",
//         localField: "author",
//         foreignField: "_id",
//         as: "author"
//       }
//     },
//     { $unwind: "$author" },

//     // COMMENTS COUNT (NO FULL LOAD)
//     {
//       $lookup: {
//         from: "comments",
//         localField: "_id",
//         foreignField: "post",
//         as: "comments"
//       }
//     },

//     {
//       $addFields: {
//         likesCount: { $size: "$likes" },
//         commentsCount: { $size: "$comments" }
//       }
//     },

//     // CLEAN DATA (VERY IMPORTANT)
//     {
//       $project: {
//         post: 1,
//         caption: 1,
//         createdAt: 1,
//         likes: 1, // keep for frontend compatibility
//         likesCount: 1,
//         commentsCount: 1,
//         "author._id": 1,
//         "author.username": 1,
//         "author.image": 1
//       }
//     }
//   ]);

//   const nextCursor =
//     posts.length > 0 ? posts[posts.length - 1]._id.toString() : null;

//   // -------------------------------
//   // 3. STORIES (GROUPED LIKE INSTAGRAM)
//   // -------------------------------
//   const stories = await Story.aggregate([
//     {
//       $match: {
//         author: { $in: userIds }
//       }
//     },
//     { $sort: { createdAt: -1 } },

//     // ONE STORY PER USER
//     {
//       $group: {
//         _id: "$author",
//         story: { $first: "$$ROOT" }
//       }
//     },

//     {
//       $lookup: {
//         from: "users",
//         localField: "_id",
//         foreignField: "_id",
//         as: "author"
//       }
//     },
//     { $unwind: "$author" },

//     {
//       $project: {
//         _id: "$story._id",
//         story: "$story.story",
//         caption: "$story.caption",
//         createdAt: "$story.createdAt",
//         "author.username": 1,
//         "author.image": 1
//       }
//     }
//   ]);

//   // -------------------------------
//   // 4. SAVED POSTS (FAST)
//   // -------------------------------
//   const savedPosts = await Saved.find({ user: userObjectId })
//     .select("post")
//     .lean();

//   const savedIds = savedPosts.map(s => s.post.toString());

//   // -------------------------------
//   // 5. USER BASIC INFO
//   // -------------------------------
//   const user = await User.findById(userObjectId)
//     .select("username image")
//     .lean();

//   if (!user) return null;

//   return JSON.parse(JSON.stringify({
//     user,
//     posts,
//     stories,
//     savedIds,
//     nextCursor
//   }));
// }


export const allFriends = async (userId, cursor = null) => {
  await connectDB();

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // ✅ Step 1: Get connections (lean + minimal)
  const connections = await Follow.find({
    $or: [{ follower: userObjectId }, { following: userObjectId }]
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

  // ✅ Step 2: Optimized aggregation
  const posts = await Post.aggregate([
    { $match: match },

    { $sort: { _id: -1 } },
    { $limit: 10 },

    // ✅ Join user (only required fields)
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

    // ✅ Convert everything to STRING (IMPORTANT)
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

    // ✅ Final shape (small payload)
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

  // ✅ Parallel queries
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
      _id: user._id.toString()
    },
    posts,
    stories,
    savedIds: savedPosts.map((s) => s.post.toString()),
    nextCursor
  };
};

export const IndividualPosts = async (userId) => {
  await connectDB();
  const posts = await Post.find({ author: userId })
    .sort({ createdAt: -1 })
    .lean();

  return posts;
}

export const deletePost = async (postId) => {
  await connectDB();
  const res = await Post.deleteOne({ _id: postId });
  return !!res
}

export const savePost = async (postId, userId) => {
  await connectDB();
  const res = await Saved.create({
    post: postId,
    user: userId
  })
  return res;
}

export const unsavePost = async (postId, userId) => {
  await connectDB();
  const res = await Saved.deleteOne({ post: postId, user: userId })
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

export const getLikes = async (postId) => {
  await connectDB();

}
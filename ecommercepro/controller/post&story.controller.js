import { connectDB } from "@/lib/Connection";
import { User, Follow, Post, Story, Saved } from "@/lib/database";
import mongoose from 'mongoose'

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

      // Join Likes to check if current user liked it
      {
        $lookup: {
          from: "likes",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$postId"] },
                    { $eq: ["$user", userObjectId] }
                  ]
                }
              }
            }
          ],
          as: "currentUserLike"
        }
      },

      //Convert everything to STRING 
      {
        $addFields: {
          _id: { $toString: "$_id" },
          "author._id": { $toString: "$author._id" },
          isLiked: { $gt: [{ $size: "$currentUserLike" }, 0] },
          likesCount: { $ifNull: ["$likesCount", 0] },
          // Mock likes array for frontend compatibility if needed
          likes: {
            $cond: {
              if: { $gt: [{ $size: "$currentUserLike" }, 0] },
              then: [userId],
              else: []
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
          likesCount: 1,
          isLiked: 1,
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

        // SERIALIZE EVERYTHING
        {
          $addFields: {
            _id: { $toString: "$_id" },
            "author._id": { $toString: "$author._id" },

            "story._id": { $toString: "$story._id" },
            "story.author": { $toString: "$story.author" },
            "story.createdAt": {
              $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$story.createdAt" }
            },
            "story.updatedAt": {
              $dateToString: { format: "%Y-%m-%dT%H:%M:%S.%LZ", date: "$story.updatedAt" }
            }
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
      savedIds: savedPosts.filter(s => s && s.post).map((s) => s.post.toString()),
      nextCursor
    };
  } catch (error) {
    console.error("Error in allFriends controller:", error);
    throw error;
  }
};



export const IndividualPosts = async (userId, currentUserId = null) => {
  try {
    await connectDB();
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const currentUserObjectId = currentUserId ? new mongoose.Types.ObjectId(currentUserId) : null;

    const posts = await Post.aggregate([
      { $match: { author: userObjectId } },
      { $sort: { createdAt: -1 } },

      // Join author details
      {
        $lookup: {
          from: "users",
          localField: "author",
          foreignField: "_id",
          pipeline: [{ $project: { username: 1, image: 1 } }],
          as: "author"
        }
      },
      { $unwind: "$author" },

      // Join Likes to check if current user liked it
      {
        $lookup: {
          from: "likes",
          let: { postId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$post", "$$postId"] },
                    { $eq: ["$user", currentUserObjectId] }
                  ]
                }
              }
            }
          ],
          as: "currentUserLike"
        }
      },

      {
        $addFields: {
          _id: { $toString: "$_id" },
          "author._id": { $toString: "$author._id" },
          isLiked: { $gt: [{ $size: "$currentUserLike" }, 0] },
          likesCount: { $ifNull: ["$likesCount", 0] },
          // Mock likes array for frontend compatibility if needed
          likes: {
            $cond: {
              if: { $gt: [{ $size: "$currentUserLike" }, 0] },
              then: [currentUserId],
              else: []
            }
          }
        }
      },

      {
        $project: {
          post: 1,
          caption: 1,
          createdAt: 1,
          likesCount: 1,
          isLiked: 1,
          likes: 1,
          author: 1
        }
      }
    ]);

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
      strictPopulate: false,
      populate: {
        path: "author",
        select: "username image"
      }
    }).lean();

    const filteredSavedPosts = savedPosts.filter(s => s && s.post && s.post._id);
    return JSON.parse(JSON.stringify(filteredSavedPosts));
  } catch (error) {
    console.error("Error in getSavedPosts controller:", error);
    throw error;
  }
};

export const deleteStory = async (storyId, userId) => {
  try {
    await connectDB();
    const res = await Story.deleteOne({ _id: storyId, author: userId });
    return !!res.deletedCount;
  } catch (error) {
    console.error("Error in deleteStory controller:", error);
    throw error;
  }
}

export const getLikes = async (postId) => {
  try {
    await connectDB();
    const likes = await Likes.find({ post: postId })
      .populate("user", "username image")
      .lean();
    
    return likes.map(l => l.user);
  } catch (error) {
    console.error("Error in getLikes controller:", error);
    throw error;
  }
}

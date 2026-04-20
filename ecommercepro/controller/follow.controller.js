import { connectDB } from "@/lib/Connection";
import { Follow,FollowStatus } from "@/lib/database";
import mongoose from "mongoose";
// import redis from "@/services/redis";

export const findFriendOrNot = async (userId, friendId) => {
  try {
    await connectDB();

    //check friend or not
    const relation = await Follow.findOne(
        { follower: userId, following: friendId},
    );
    return !!relation; // true if relation exists
  } catch (error) {
    console.error("Error in findFriendOrNot controller:", error);
    throw error;
  }
};

//check pending requests
export const findPendingReq = async (userId, friendId) => {
  try {
    await connectDB();
    const pending = await FollowStatus.findOne({
      from: userId, to: friendId, status: "pending"
    });
    return !!pending;
  } catch (error) {
    console.error("Error in findPendingReq controller:", error);
    throw error;
  }
};

export const checkFollowers=async(userId)=>{
  try {
    await connectDB();
    const followers=await Follow.find({following:userId}).populate('follower','image username').lean();
    return followers;
  } catch (error) {
    console.error("Error in checkFollowers controller:", error);
    throw error;
  }
}

export const checkFollowings=async(userId)=>{
  try {
    await connectDB();
    const followings=await Follow.find({follower:userId}).populate('following','image username').lean();
    return followings;
  } catch (error) {
    console.error("Error in checkFollowings controller:", error);
    throw error;
  }
}

//Aggregation (followers)
export const getFollowersFromDB = async (userId) => {
  try {
    return await Follow.aggregate([
      {
        $match: { following: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "user",
          localField: "follower",
          foreignField: "_id",
          as: "follower"
        }
      },
      { $unwind: "$follower" },
      {
        $project: {
          _id: 1,
          "follower._id": 1,
          "follower.username": 1,
          "follower.image": 1
        }
      }
    ]);
  } catch (error) {
    console.error("Error in getFollowersFromDB controller:", error);
    throw error;
  }
};

//Aggregation (followings)
export const getFollowingsFromDB = async (userId) => {
  try {
    return await Follow.aggregate([
      {
        $match: { follower: new mongoose.Types.ObjectId(userId) }
      },
      {
        $lookup: {
          from: "users",
          localField: "following",
          foreignField: "_id",
          as: "following"
        }
      },
      { $unwind: "$following" },
      {
        $project: {
          _id: 1,
          "following._id": 1,
          "following.username": 1,
          "following.image": 1
        }
      }
    ]);
  } catch (error) {
    console.error("Error in getFollowingsFromDB controller:", error);
    throw error;
  }
};

export const getFollowersCount=async(userId)=>{
  try {
    const result=await Follow.aggregate([
      {
        $match:{
          following:new mongoose.Types.ObjectId(userId)
        },
      },
      {
        $count:'total',
      }
    ])
    return result[0]?.total || 0;
  } catch (error) {
    console.error("Error in getFollowersCount controller:", error);
    throw error;
  }
}

export const getFollowingsCount=async(userId)=>{
  try {
    const result=await Follow.aggregate([
      {
        $match:{
          follower:new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $count:'total'
      }
    ])
    return result[0]?.total || 0;
  } catch (error) {
    console.error("Error in getFollowingsCount controller:", error);
    throw error;
  }
}

export const checkFriend=async(userId,friendId)=>{
  try {
    await connectDB();
    const friend=await Follow.findOne({follower:userId,following:friendId});
    return friend;
  } catch (error) {
    console.error("Error in checkFriend controller:", error);
    throw error;
  }
}

export const unfollowUser = async (id, friendId) => {
  try {
    await connectDB();
    const [unfollowFriend, remove_collection] = await Promise.all([
      Follow.deleteOne({ follower: id, following: friendId }),
      FollowStatus.deleteOne({ from: id, to: friendId, status: "accepted" }),
    ]);
    const isUnfollowed = unfollowFriend.deletedCount > 0 || remove_collection.deletedCount > 0;
    if (isUnfollowed) {
      return { success: true, message: "Unfollow Success", friend: false };
    } else {
      return { success: false, message: "Already unfollowed" };
    }
  } catch (error) {
    console.error("Error in unfollowUser controller:", error);
    throw error;
  }
};
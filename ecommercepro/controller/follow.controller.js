import { connectDB } from "@/lib/Connection";
import { Follow,FollowStatus } from "@/lib/database";
import mongoose from "mongoose";
// import redis from "@/services/redis";

export const findFriendOrNot = async (userId, friendId) => {
  await connectDB();

  //check friend or not
  const relation = await Follow.findOne(
      { follower: userId, following: friendId},
  );
  return !!relation; // true if relation exists ( (!!) means clean boolean return )
};

//check pending requests
export const findPendingReq = async (userId, friendId) => {
  await connectDB();
  const pending = await FollowStatus.findOne({
    // $or: [
    //   { from: friendId, to: userId, status: "pending" },
    //   { from: userId, to: friendId, status: "pending" }
    // ]
    from: userId, to: friendId, status: "pending"
  });
  return !!pending;
};

export const checkFollowers=async(userId)=>{
  await connectDB();

  // const cachKey=`followers:${userId}`;
  // const cached=await redis.get(cachKey);
  // if(cached){
  //   return JSON.parse(cached);
  // }

  const followers=await Follow.find({following:userId}).populate('follower','image username').lean();
  // await redis.set(cachKey,JSON.stringify(followers),'EX',300);

  return followers;
}

export const checkFollowings=async(userId)=>{
  await connectDB();

  // const cachKey=`followings:${userId}`;
  // const cached=await redis.get(cachKey);
  // if(cached){
  //   return JSON.parse(cached)
  // }
  const followings=await Follow.find({follower:userId}).populate('following','image username').lean();

  // await redis.set(cachKey,JSON.stringify(followings),'EX',300);
  
  return followings;
}

//Aggregation (followers)
export const getFollowersFromDB = async (userId) => {
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
};

//Aggregation (followings)
export const getFollowingsFromDB = async (userId) => {
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
};

export const getFollowersCount=async(userId)=>{
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
}

export const getFollowingsCount=async(userId)=>{
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
}

export const checkFriend=async(userId,friendId)=>{
  await connectDB();
  const friend=await Follow.findOne({follower:userId,following:friendId});
  return friend;
}

export const unfollowUser = async (id, friendId) => {
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
};
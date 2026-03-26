// import mongoose from "mongoose";
// import Follow from "@/models/Follow";

// //Aggregation (followers)
// export const getFollowersFromDB = async (userId) => {
//   return await Follow.aggregate([
//     {
//       $match: { following: new mongoose.Types.ObjectId(userId) }
//     },
//     {
//       $lookup: {
//         from: "user",
//         localField: "follower",
//         foreignField: "_id",
//         as: "follower"
//       }
//     },
//     { $unwind: "$follower" },
//     {
//       $project: {
//         _id: 1,
//         "follower._id": 1,
//         "follower.username": 1,
//         "follower.image": 1
//       }
//     }
//   ]);
// };

// //Aggregation (followings)
// export const getFollowingsFromDB = async (userId) => {
//   return await Follow.aggregate([
//     {
//       $match: { follower: new mongoose.Types.ObjectId(userId) }
//     },
//     {
//       $lookup: {
//         from: "users",
//         localField: "following",
//         foreignField: "_id",
//         as: "following"
//       }
//     },
//     { $unwind: "$following" },
//     {
//       $project: {
//         _id: 1,
//         "following._id": 1,
//         "following.username": 1,
//         "following.image": 1
//       }
//     }
//   ]);
// };

// export const getFollowersCount=async(userId)=>{
//   const result=await Follow.aggregate([
//     {
//       $match:{
//         following:new mongoose.Types.ObjectId(userId)
//       },
//     },
//     {
//       $count:'total',
//     }
//   ])
//   return result[0]?.total || 0;
// }

// export const getFollowingsCount=async(userId)=>{
//   const result=await Follow.aggregate([
//     {
//       $match:{
//         follower:new mongoose.Types.ObjectId(userId)
//       }
//     },
//     {
//       $count:'total'
//     }
//   ])
//   return result[0]?.total || 0;
// }
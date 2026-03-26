import { User, Follow, Post } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function GET(req, context) {
  await connectDB();
  const params = await context.params;
  const id = params.id;
  // const mainUser = await User.findById(id).select("name username image");
  // if (!mainUser) {
  //   return Response.json({ message: "User not found" }, { status: 404 });
  // }

  // check for our data only 
  const user = await User.findById(id).select("username image").lean();

  // Get friends with full data
  const follows = await Follow.find({
    $or: [{ follower: id }, { following: id }],
  })
    .populate({
      path: "follower following",
      select: "name username image posts",
      // populate: {
      //   path: "posts",
      //   select: "post caption story likes comments createdAt",
      //   options: { sort: { createdAt: -1 } }
      // }
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
}


// import {User} from '@/lib/database.js';
// import {Post} from '@/lib/database.js';
// import { connectDB } from '@/lib/Connection';
// export async function POST(req,{params}){
//     await connectDB()
//     const {id}=params
//     const userData=await User.find({_id:id})
//     if(!userData){
//         return Response.json({message:'user not fount in database...'})
//     }
//     return Response.json({userData})
// }


// import { User,Follow,Post } from "@/lib/database";
// import { connectDB } from "@/lib/Connection";

// export async function GET(req,context){
//     await connectDB();
//     const params=await context.params;
//     const id=params.id;
//     const mainUser = await User.findById(id)
//     .select("name username image");

//   if (!mainUser) {
//     return Response.json({ message: "User not found" }, { status: 404 });
//   }

//   const user=await User.findById(id).select('username image posts').populate({
//     path:'posts',
//     select:'post caption story createdAt'
//   })

//   // GET FRIENDS WITH FULL DATA
//   const follows = await Follow.find({
//     $or: [{ follower: id }, { following: id }]
//   })
//     .populate({
//       path: "follower following",
//       select: "name username image posts",
//       populate: {
//         path: "posts",
//         select: "post caption story likes comments createdAt",
//         options: { sort: { createdAt: -1 } }
//       }
//     });

//   // Extract ONLY friend data (not myself)
//   const cleanFriends = follows.map((doc) => {
//     const ourUser = doc.follower;
//     const friendUser = doc.following;

//     return ourUser._id.toString() === id
//       ? friendUser
//       : ourUser;
//   });

//   //  Remove duplicates (important)
//   const uniqueFriends = Array.from(
//     new Map(
//       cleanFriends.map((u) => [u._id.toString(), u])
//     ).values()
//   );

//   //  Final response
//   return Response.json({
//     user:user,
//     success: true,
//     friendsCount: uniqueFriends.length,
//     friends: uniqueFriends
//   });
// }


// import { Follow, FollowStatus } from "@/lib/database";
// import { connectDB } from "@/lib/Connection";
// import mongoose from "mongoose";

// export async function PUT(req, { params }) {
//   await connectDB();

//   const { id } = params; // receiver
//   const { fromUserId, status } = await req.json();

//   // validate ids
//   if (
//     !mongoose.Types.ObjectId.isValid(id) ||
//     !mongoose.Types.ObjectId.isValid(fromUserId)
//   ) {
//     return Response.json({ message: "Invalid ID" }, { status: 400 });
//   }

//   const request = await FollowStatus.findOne({
//     follower: fromUserId,
//     otherId: id,
//     status: "pending",
//   });

//   if (!request) {
//     return Response.json(
//       { message: "Follow request not found" },
//       { status: 404 }
//     );
//   }

//   // ACCEPT
//   if (status === "accept") {
//     const alreadyFollowed = await Follow.findOne({
//       follower: fromUserId,
//       following: id,
//     });

//     if (!alreadyFollowed) {
//       console.log('not already friends')
//       await Follow.create({
//         follower: fromUserId,
//         following: id,
//       });
//     }

//     await FollowStatus.deleteOne({
//       follower: fromUserId,
//       otherId: id,
//     });
//   }

//   // DECLINE
//   if (status === "decline") {
//     await FollowStatus.deleteOne({
//       follower: fromUserId,
//       otherId: id,
//     });
//   }

//   return Response.json({
//     success: true,
//     status,
//     message: `Request ${status}`,
//   });
// }



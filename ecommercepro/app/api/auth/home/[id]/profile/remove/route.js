import mongoose from "mongoose";
import { unfollowUser } from "@/controller/follow.controller";
// export async function PUT(req, context) {
//   // await connectDB()
//     const params=await context.params;
//     const id= params.id;
//     console.log('id issss:::::',id)
//     console.log('type of id is :',typeof(id))
//     const { friendId } = await req.json();
//     console.log("id:", id);

//   // Validate ObjectId
//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return Response.json(
//       { error: "Invalid user id" },
//       { status: 400 }
//     );
//   }
//   const data=await unfollowUser(id,friendId);
//   console.log('unfollow',data);
//   return Response.json(data);
// }


export async function PUT(req, context) {
  try {
    const params = await context.params;
    const id = params.id;

    const { friendId } = await req.json();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return Response.json({ success: false, message: "Invalid user id" }, { status: 400 });
    }

    const data = await unfollowUser(id, friendId);

    return Response.json(data);

  } catch (error) {
    console.error(error);
    return Response.json(
      { success: false, message: "Server error" },
      { status: 500 }
    );
  }
}
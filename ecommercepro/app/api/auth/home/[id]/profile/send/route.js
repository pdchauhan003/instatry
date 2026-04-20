import { Follow } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function POST(req,context){
  try {
    await connectDB();
    const params=await context.params;
    const id=params.id;
    const {following}=await req.json();
    console.log(following)
    await Follow.create({
      follower:id,
      following:following,
    })
    return Response.json({message:'FriendAdded',friend:true})
  } catch (error) {
    console.error("Error in POST /api/auth/home/[id]/profile/send:", error);
    return Response.json(
      { success: false, message: "Internal server error", error: error.message },
      { status: 500 }
    );
  }
}



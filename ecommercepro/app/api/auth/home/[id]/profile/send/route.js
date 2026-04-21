import { Follow } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req,context){
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });

    await connectDB();
    const params=await context.params;
    const id=params.id;

    if (id !== authUserId) {
        return Response.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

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



import { checkFollowings } from "@/controller/follow.controller";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function GET(req,context){
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const params=await context.params;
        const id=params.id;
        const followings=await checkFollowings(id);
        return NextResponse.json({followings})
    } catch (error) {
        console.error("Error in GET /api/auth/followings/[id]:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

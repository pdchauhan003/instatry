import { checkFollowers } from "@/controller/follow.controller";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUser";
//follower fetch api
export async function GET(req, context) {
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const params = await context.params;
        const id = params.id;
        const followers = await checkFollowers(id);
        return NextResponse.json({ followers })
    } catch (error) {
        console.error("Error in GET /api/auth/followers/[id]:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

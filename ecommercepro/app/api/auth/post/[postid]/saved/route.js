import { savePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUser";

export async function POST(req,context){
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

        const params=await context.params;
        const postid = params.postid;
        const userId = authUserId;

        console.log('userID',userId)
        const savedPostt=await savePost(postid,userId)
        if(savedPostt){
            return NextResponse.json({message:'post saved successfully',success:true});
        }
        else{
            return NextResponse.json({message:'error in saving post',success:false});
        }
    } catch (error) {
        console.error("Error in POST /api/auth/post/[postid]/saved:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

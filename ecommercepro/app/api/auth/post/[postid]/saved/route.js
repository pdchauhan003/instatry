
import { savePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
export async function POST(req,context){
    try {
        const params=await context.params;
        const postid = params.postid;
        const {userId} =await req.json();
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
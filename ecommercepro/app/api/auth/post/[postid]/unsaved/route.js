import { unsavePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
export async function DELETE(req,context){
    try {
        const params=await context.params;
        const postid = params.postid;
        const {userId} =await req.json();
        console.log('userID',userId)
        const savedPostt=await unsavePost(postid,userId)
        if(savedPostt){
            return NextResponse.json({message:'post unsaved successfully',success:true});
        }
        else{
            return NextResponse.json({message:'error in unsaving post',success:false});
        }
    } catch (error) {
        console.error("Error in DELETE /api/auth/post/[postid]/unsaved:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
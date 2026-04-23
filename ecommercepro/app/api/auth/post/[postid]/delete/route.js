import { deletePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
export async function DELETE(req,context){
    try {
        const params=await context.params;
        const postid = params.postid;
        const deletePostt=await deletePost(postid)
        if(deletePostt){
            return NextResponse.json({message:'post deleted success',success:true});
        }
        else{
            return NextResponse.json({message:'error in deleting post',success:false});
        }
    } catch (error) {
        console.error("Error in delete post API:", error);
        return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
    }
}

import { deletePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
export async function DELETE(req,context){
    const params=await context.params;
    const postid = params.postid;
    const deletePostt=await deletePost(postid)
    if(deletePostt){
        return NextResponse.json({message:'post deleted success',success:true});
    }
    else{
        return NextResponse.json({message:'error in deleting post',success:false});
    }
}
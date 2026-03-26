
import { savePost } from "@/controller/post&story.controller";
import { NextResponse } from "next/server";
export async function POST(req,context){
    const params=await context.params;
    const postid = params.postid;
    const {userId} =await req.json();
    console.log('userID',userId)
    const savedPostt=await savePost(postid,userId)
    if(savedPostt){
        return NextResponse.json({message:'post deleted success',success:true});
    }
    else{
        return NextResponse.json({message:'error in deleting post',success:false});
    }
}
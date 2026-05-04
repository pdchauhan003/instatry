import { getMessageUserData } from "@/controller/user.controller";
import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function POST(res){
    try{
        const authUserId = await getAuthUserId();
        if(!authUserId){
            return NextResponse.json({message:'user is not authenticated',success:false},{status:401})
        }
        console.log('usr id is in route',authUserId)
        // return NextResponse.json({authUserId})
        const messageUsers=await getMessageUserData(authUserId)
        return NextResponse.json(messageUsers)
    }
    catch(error){
        console.log('auther is not authenticated')
        return NextResponse.json({success:false});
    }
}
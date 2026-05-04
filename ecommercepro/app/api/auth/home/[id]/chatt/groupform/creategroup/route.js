import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";

export async function POST(res){
    try{
        const authUserId=await getAuthUserId();
        if(!authUserId){
            return NextResponse.json({message:'user is not authenticated',success:false},{status:401})
        }
        const {selectedUser}=await res.json();
        console.log('selectedUser is in route createroute',selectedUser)
        return NextResponse.json({success:true})
    }
    catch(error){
        console.log('user is not authenticated')
        return NextResponse.json({success:false})
    }
 
}   
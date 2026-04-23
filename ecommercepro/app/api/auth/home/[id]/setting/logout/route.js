import { NextResponse } from "next/server";
import { User } from "@/lib/database";
import { connectDB } from "@/services/mongodb";

export async function POST(req) {
  try {
    const refreshtoken=req.cookies.get('refreshToken')?.value;
    if(refreshtoken){
      await User.findOneAndUpdate(
        {refreshToken:refreshtoken},
        {refreshToken:null,sessionId:null}
      )
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set("accessToken",'',{maxAge:0});
    response.cookies.set('refreshToken','',{maxAge:0});
    return response;
  } catch (error) {
    console.error("Error in logout API:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}

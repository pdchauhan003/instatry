import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/services/mongodb";

export async function POST(req) {
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
}

import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'
import {User} from '@/lib/database.js';
import { generateToken } from "@/lib/jwt";
import { connectDB } from "@/services/mongodb";
import { NextResponse } from "next/server";

export async function POST(req){
    await connectDB();
    const cookieStore=await cookies();
    const refreshToken=cookieStore.get('refreshToken')?.value;
    if(!refreshToken){
        return Response.json({message:'No refresh token'});
    }
    try{
        const decode=jwt.verify(refreshToken,process.env.REFRESH_SECRET);
        const user=await User.findById(decode.id);
        if(!user || user.refreshToken !== refreshToken){
            return Response.json({message:'invalid refresh token'});
        }
        const newAccessToken=generateToken({
            id:user._id,
            role:user.role,
            sessionId:user.sessionId
        });
        const response = NextResponse.json({ success: true });

        response.cookies.set("token", newAccessToken, {
        httpOnly: true,
        });
        return response;
    }
    catch(error){
        return Response.json({message:'Expired refresh token'})
    }
}
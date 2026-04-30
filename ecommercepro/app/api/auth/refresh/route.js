import { cookies } from "next/headers";
import jwt from 'jsonwebtoken'
import { User } from '@/lib/database.js';
import { generateAccessToken } from "@/lib/jwt";
import { connectDB } from "@/services/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
    await connectDB();
    // const cookieStore=await cookies();
    const refreshToken = await req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
        return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    }
    try {
        const decode = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const user = await User.findById(decode.userId);
        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ message: 'invalid refresh token' }, { status: 403 });
        }
        const newAccessToken = generateAccessToken({
            id: user._id,
            role: user.role,
            sessionId: user.sessionId
        });

        const response = NextResponse.json({ 
            success: true, 
            userId: user._id,
            accessToken: newAccessToken
        }, { status: 200 });

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: '/',
            // maxAge:60*15 // 15 min
        });

        return response;

    }
    catch (error) {
        return NextResponse.json({ message: 'Expired refresh token' }, { status: 401 });
    }
}

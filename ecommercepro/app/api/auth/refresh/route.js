import { cookies } from "next/headers";
import { User } from '@/lib/database.js';
import { generateAccessToken } from "@/lib/jwt";
import { connectDB } from "@/services/mongodb";
import { NextResponse } from "next/server";
import redis from "@/services/redis";
import { verifyRefreshToken } from "@/lib/session";

export async function POST(req) {
    await connectDB();
    // const cookieStore=await cookies();
    const refreshToken = await req.cookies.get('refreshToken')?.value;
    if (!refreshToken) {
        return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
    }
    try {
        const decoded = await verifyRefreshToken(refreshToken);

        if (!decoded) {
            return NextResponse.json({ message: 'Expired or invalid refresh token' }, { status: 401 });
        }

        const userId = decoded.userId;
        const sessionId = decoded.sessionId;

        // Verify sessionId against Redis
        const storedSessionId = await redis.get(`session:${userId}`);
        if (!storedSessionId || storedSessionId !== sessionId) {
            return NextResponse.json({ message: 'Session revoked. Please login again.' }, { status: 401 });
        }

        const user = await User.findById(userId).select('refreshToken role sessionId');
        if (!user || user.refreshToken !== refreshToken) {
            return NextResponse.json({ message: 'invalid refresh token' }, { status: 403 });
        }
        const newAccessToken = generateAccessToken({
            id: user._id,
            role: user.role,
            sessionId: user.sessionId
        });

        // ROTATION: Generate a new refresh token and update DB
        const { generateRefreshToken } = await import("@/lib/jwt");
        const newRefreshToken = generateRefreshToken({
            id: user._id,
            sessionId: user.sessionId
        });

        await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

        // Update Redis TTL to keep session alive
        try {
            await redis.set(`session:${user._id}`, user.sessionId, { ex: 7 * 24 * 60 * 60 });
        } catch (redisError) {
            console.error("Redis session refresh failed:", redisError);
        }

        const response = NextResponse.json({
            success: true,
            userId: user._id,
            role: user.role,
            accessToken: newAccessToken
        }, { status: 200 });

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: '/',
        });

        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;

    }
    catch (error) {
        return NextResponse.json({ message: 'Expired refresh token' }, { status: 401 });
    }
}

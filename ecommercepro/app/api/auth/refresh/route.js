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
        const { rotateTokens } = await import("@/lib/session");
        const result = await rotateTokens(refreshToken);

        if (!result) {
            return NextResponse.json({ message: 'Expired or invalid refresh token' }, { status: 401 });
        }

        const { newAccessToken, newRefreshToken, userId } = result;

        const response = NextResponse.json({
            success: true,
            id: userId,
            accessToken: newAccessToken
        }, { status: 200 });

        response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            path: '/',
            maxAge: 15 * 60 // 15 minutes
        });

        response.cookies.set("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60 // 7 days
        });

        return response;
    }
    catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

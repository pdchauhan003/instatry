
import { NextResponse } from "next/server";
import { User } from "@/lib/database.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { connectDB } from "@/lib/Connection";
import redis from "@/services/redis";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    const activeUser = await User.findOne({ email });

    if (!activeUser) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, activeUser.password);

    if (!isPasswordCorrect) {
      return NextResponse.json({
        success: false,
        message: "The password you entered is incorrect. Please try again.",
        forgot: true,
      }, { status: 401 });
    }
    //session id to check login status
    const sessionId = crypto.randomBytes(32).toString("hex");
    activeUser.sessionId = sessionId;

    const refreshToken = await generateRefreshToken({ id: activeUser._id, sessionId: sessionId });
    activeUser.refreshToken = refreshToken;

    await activeUser.save();

    // Store session in Redis for fast verification in middleware 
    //save session in redis
    try {
      await redis.set(`session:${activeUser._id}`, sessionId, { ex: 7 * 24 * 60 * 60 });
    } catch (redisError) {
      console.error("Redis session storage failed:", redisError);
    }

    // socket server
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/force-logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: activeUser._id.toString() })
    }).catch(e => console.log("Socket server notification failed:", e.message));

    const accessToken = await generateAccessToken({
      id: activeUser._id,
      role: activeUser.role,
      sessionId,
    });

    // Create response
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userData } = activeUser.toObject();
    const response = NextResponse.json({
      success: true,
      role: activeUser.role,
      id: activeUser._id,
      user: userData,
      accessToken: accessToken,
    });

    //Set cookies
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 15 * 60, // 15 minutes
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return response;

  } catch (loginFailure) {
    console.error("Critical Login System Failure:", loginFailure);

    return NextResponse.json({
      success: false,
      message: "We're having trouble logging you in right now. Please try again in a few minutes.",
    }, { status: 500 });
  }
}


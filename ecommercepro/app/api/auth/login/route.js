
import { NextResponse } from "next/server";
import { User } from "@/lib/database.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import { connectDB } from "@/lib/Connection";
import redis from "@/services/redis";
import {rateLimiter} from '@/lib/ratelimiter'


export async function POST(req) {
  try {

    const { email, password } = await req.json();  //data from body 

    //for rate limiting
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ip = forwardedFor ? forwardedFor.split(",")[0].trim() : "unknown";

    const rateLimitKey = `${ip}_${email}`;

    // Rate limit 
    const { success, reset } = await rateLimiter.limit(rateLimitKey);
    if (!success) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Too many login attempts. Try again later.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(reset),
          },
        }
      );
    }

    await connectDB();
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

    // Notify socket server to kick old sessions (server-to-server call with internal secret)
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/force-logout`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "x-internal-secret": process.env.INTERNAL_API_SECRET || ""
      },
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

  } catch (error) {
    console.error("Critical Login System Failure:", error);

    return NextResponse.json({
      success: false,
      message: "We're having trouble logging you in right now. Please try again in a few minutes.",
    }, { status: 500 });
  }
}


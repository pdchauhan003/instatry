
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
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "Wrong password",
        forgot: true,
      });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    user.sessionId = sessionId;

    const refreshToken = generateRefreshToken({ id: user._id,sessionId:sessionId });
    user.refreshToken = refreshToken;

    await user.save();
    // call to socket server
    fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/force-logout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user._id.toString() })
    }).catch(e => console.log("Socket server not reachable or error:", e.message));

    const accessToken = generateAccessToken({
      id: user._id,
      role: user.role,
      sessionId,
    });

    // Create response
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userData } = user.toObject();
    const response = NextResponse.json({
      success: true,
      role: user.role,
      id: user._id,
      user: userData,
    });

    //Set cookies
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: true, // Always true for sameSite: 'none'
      sameSite: "none",
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true, // Always true for sameSite: 'none'
      sameSite: "none",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}


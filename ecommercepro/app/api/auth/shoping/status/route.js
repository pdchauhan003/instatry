import { connectDB } from "@/services/mongodb";
import { User } from "@/lib/database";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const body = await req.json();
    const userId = body.id; 

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const user = await User.findById(userId).lean();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // always return JSON
    return NextResponse.json({
      status: user.verificationStatus || "none",
    });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


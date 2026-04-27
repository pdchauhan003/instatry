import { connectDB } from "@/services/mongodb";
import { User } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    await connectDB();

    // Find all users with Pending verification status
    const pendingSellers = await User.find({ verificationStatus: "pending" }).select("-password").lean();

    return NextResponse.json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



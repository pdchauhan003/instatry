import { connectDB } from "@/services/mongodb";
import { User } from "@/lib/database";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET(req) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 403 });
    }

    await connectDB();

    // Find all users with Pending verification status
    const pendingSellers = await User.find({ verificationStatus: "pending" }).select("-password -refreshToken -sessionId").lean();

    return NextResponse.json(pendingSellers);
  } catch (error) {
    console.error("Error fetching pending sellers:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



import { connectDB } from "@/services/mongodb";
import { User } from "@/lib/database";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const sellers = await User.find({
      $or: [
        { verificationStatus: "approved" },
        { verificationStatus: "seller" },
        { isVerifiedSeller: true },
        { role: "seller" },
      ]
    }).select("-password -refreshToken -sessionId").lean();

    return NextResponse.json({ success: true, sellers });
  } catch (error) {
    console.error("Error fetching sellers:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}


import { connectDB } from "@/services/mongodb";
import { User } from "@/lib/database";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/getAuthUser";

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== "admin") {
      return NextResponse.json({ success: false, error: "Unauthorized: Admin access required" }, { status: 403 });
    }

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


import { connectDB } from "@/services/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    // Revoke seller status: reset back to regular user
    const updated = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          role: "user",
          verificationStatus: "none",
          isVerifiedSeller: false,
        }
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Seller removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing seller:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

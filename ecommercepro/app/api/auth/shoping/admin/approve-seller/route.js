import { connectDB } from "@/services/mongodb";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "User ID and action are required" }, { status: 400 });
    }

    let update = {};
    if (action === "approve") {
      update = {
        verificationStatus: "approved",
        isVerifiedSeller: true,
        role: "seller", // upgrade role to seller
      };
    } else if (action === "reject") {
      update = {
        verificationStatus: "none", // reset status
        isVerifiedSeller: false,
      };
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `User ${action}ed successfully`,
      user: updatedUser,
    }, { status: 200 });
  } catch (error) {
    console.error("Error approving/rejecting seller:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

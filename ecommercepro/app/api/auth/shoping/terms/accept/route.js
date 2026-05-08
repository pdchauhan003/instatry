
import { connectDB } from "@/services/mongodb";
import { Terms } from "@/lib/database";
import { User } from "@/lib/database";
import { NextResponse } from "next/server";
import { getAuthUserId } from "@/lib/getAuthUser";

//for verifying term
export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    const userId = id;

    const authUserId = await getAuthUserId();
    if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // check if user already accepted terms
    const existingTerm = await Terms.findOne({ userId });
    if (!existingTerm) {
      await Terms.create({
        userId,
        accepted: true,
        acceptedAt: new Date(),
      });
    }

    await User.findByIdAndUpdate(userId, { verificationStatus: 'pending' });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in terms accept API:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



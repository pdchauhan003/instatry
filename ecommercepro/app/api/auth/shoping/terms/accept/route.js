
import { connectDB } from "@/services/mongodb";
import Terms from "@/models/Terms";
import User from "@/models/User";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    await connectDB();
    const { id } = await req.json();
    const userId = id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Check if user already accepted terms
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


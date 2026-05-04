import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import { Member } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function POST(req, context) {
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) {
            return NextResponse.json({ message: 'User is not authenticated', success: false }, { status: 401 });
        }

        await connectDB();
        const params = await context.params;
        const groupId = params.groupId;

        // Update lastSeen for this member
        await Member.findOneAndUpdate(
            { groupId, userId: authUserId },
            { lastSeen: new Date() },
            { new: true }
        );

        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Error updating group seen status:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

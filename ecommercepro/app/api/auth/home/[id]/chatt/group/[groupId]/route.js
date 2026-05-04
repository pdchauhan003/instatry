import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import { Group, Member } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function GET(req, context) {
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) {
            return NextResponse.json({ message: 'User is not authenticated', success: false }, { status: 401 });
        }

        await connectDB();
        const params = await context.params;
        const groupId = params.groupId;

        // 1. Fetch Group Info
        const group = await Group.findById(groupId).lean();
        if (!group) {
            return NextResponse.json({ message: 'Group not found', success: false }, { status: 404 });
        }

        // 2. Fetch Members
        const members = await Member.find({ groupId })
            .populate('userId', 'username image name')
            .lean();

        // 3. Check if current user is a member
        const isMember = members.some(m => m.userId._id.toString() === authUserId);
        if (!isMember) {
            return NextResponse.json({ message: 'Forbidden: You are not a member of this group', success: false }, { status: 403 });
        }

        return NextResponse.json({ 
            success: true, 
            group,
            members: members.map(m => m.userId)
        });
    }
    catch (error) {
        console.error('Error fetching group info:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error fetching group info' 
        }, { status: 500 });
    }
}

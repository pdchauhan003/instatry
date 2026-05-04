import { getAuthUserId } from "@/lib/getAuthUser";
import { NextResponse } from "next/server";
import { Group, Member } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

export async function POST(req, context) {
    try {
        const authUserId = await getAuthUserId();
        if (!authUserId) {
            return NextResponse.json({ message: 'User is not authenticated', success: false }, { status: 401 });
        }

        await connectDB();
        const { selectedUser, groupName } = await req.json();
        
        if (!groupName || !selectedUser || selectedUser.length === 0) {
            return NextResponse.json({ message: 'Group name and members are required', success: false }, { status: 400 });
        }

        // 1. Create the Group
        const newGroup = await Group.create({
            name: groupName,
            dp: '' // Can be updated later
        });

        // 2. Add members (including the creator)
        const memberIds = [...new Set([...selectedUser, authUserId])];
        
        const memberDocs = memberIds.map(userId => ({
            groupId: newGroup._id,
            userId: userId
        }));

        await Member.insertMany(memberDocs);

        console.log('Group created successfully:', newGroup._id);
        return NextResponse.json({ 
            success: true, 
            groupId: newGroup._id, 
            message: 'Group created successfully' 
        });
    }
    catch (error) {
        console.error('Error creating group:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error creating group' 
        }, { status: 500 });
    }
}
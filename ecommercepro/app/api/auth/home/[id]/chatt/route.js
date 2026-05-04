import { NextResponse } from "next/server";
import { getMessageUserData } from "@/controller/user.controller";
import { Message, Group, Member } from "@/lib/database";
import { getAuthUserId } from "@/lib/getAuthUser";
import mongoose from "mongoose";

export async function POST(req, context) {
  try {
    const authUserId = await getAuthUserId();
    if (!authUserId) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });

    const params = await context.params;
    const id = params.id;

    if (id !== authUserId) {
        return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    //fetch username and profile picture of messages users
    const messageUserData = await getMessageUserData(id);
    console.log('message userdata is', messageUserData);

    // Convert ID to ObjectId for consistent comparison in aggregation
    const userObjectId = new mongoose.Types.ObjectId(id);

    // Get all message data with correct unread count calculation
    const messagesData = await Message.aggregate([
      {
        $match: {
          $or: [
            { to: userObjectId },
            { from: userObjectId }
          ],
          deletedBy: { $ne: userObjectId },
          groupId: { $exists: false }
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$from", userObjectId] },
              "$to",
              "$from"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$to", userObjectId] },
                    { $eq: ["$isSeen", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    // Convert aggregation result to map for lookup
    const messageMap = new Map();

    messagesData.forEach(m => {
      messageMap.set(m._id.toString(), {
        unreadCount: m.unreadCount,
        lastMessageTime: m.lastMessage?.createdAt || 0
      });
    });

    // Merge with friends
    const result = messageUserData.map(f => {
    const data = messageMap.get(f._id.toString());

      return {
        _id: f._id,
        username: f.username,
        image: f.image,
        unreadCount: data?.unreadCount || 0,
        lastMessageTime: data?.lastMessageTime || 0
      };
    });

    // Fetch Groups with unread counts
    const userGroups = await Member.find({ userId: userObjectId })
      .populate({
        path: 'groupId',
        select: 'name dp'
      })
      .lean();

    const formattedGroups = await Promise.all(userGroups.map(async (ug) => {
      const unreadCount = await Message.countDocuments({
        groupId: ug.groupId._id,
        createdAt: { $gt: ug.lastSeen || new Date(0) }
      });

      return {
        _id: ug.groupId._id,
        name: ug.groupId.name,
        dp: ug.groupId.dp,
        unreadCount,
        isGroup: true
      };
    }));

    // Sort latest first
    result.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

    const finalData = {
      success: true,
      friends: result,
      groups: formattedGroups
    }

    return NextResponse.json(finalData, { status: 200 });
  } catch (error) {
    console.error("Error in chatt API:", error);
    return NextResponse.json({ success: false, message: "Internal server error", error: error.message }, { status: 500 });
  }
}

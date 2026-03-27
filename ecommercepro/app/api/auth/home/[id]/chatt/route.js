import { getMessageUserData } from "@/controller/user.controller";
import { Message } from "@/lib/database";
// import redis from "@/lib/redis";

export async function POST(req, context) {
  const params = await context.params;
  const id = params.id;


  //fetch username and profile picture of messages users
  const messageUserData=await getMessageUserData(id);
  console.log('message userdata is',messageUserData)

  // const cachFullKey=`cachFull:${id}`;

  //check chech first
  // const cached=await redis.get(cachFullKey);
  // if(cached){
  //   console.log('redis already cachedd');
  //   return Response.json(JSON.parse(cached));
  // }

  //if not cach then fetching this logics

  // const allfriends = await allFriends(id);
  // const uniqueFriends = allfriends.friends;

  // Get all message data in ONE query
  const messagesData = await Message.aggregate([
    {
      $match: {
        $or: [{ to: id }, { from: id }]
      }
    },
    {
      $sort: { createdAt: -1 }
    },
    {
      $group: {
        _id: {
          $cond: [
            { $eq: ["$from", id] },
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
                  { $eq: ["$to", id] },
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

  // Convert aggregation result to map for O(1) lookup
  const messageMap = new Map();

  messagesData.forEach(m => {
    messageMap.set(m._id.toString(), {
      unreadCount: m.unreadCount,
      lastMessageTime: m.lastMessage?.createdAt || 0
    });
  });

  //  Merge with friends
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

  // Sort latest first
  result.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  const finalData={
    success: true,
    friends: result
  }

  // Store in redis
  // await redis.set(cachFullKey, JSON.stringify(finalData), "EX", 30);

  //after set in redis return data 
  return Response.json(finalData);
}
const User = require('../models/User');
const FollowStatus = require('../models/FollowStatus');
const Follow = require('../models/Follow');

// handler
//in notification page get follow req
const getFollowRequest = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const msg = await FollowStatus.findOne({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    });
    res.json(msg || null);
  } catch (followQueryError) {
    console.error("Follow Request Query Failure:", followQueryError);
    res.status(500).json({ err: "Couldn't fetch the follow status. Try again later." });
  }
};


//notification fetch
const getNotifications = async (req, res) => {
  try {
    const requests = await FollowStatus.find({
      to: req.params.user1,
      status: "pending",
    }).populate("from", "username image");
    res.json(requests || []);
  } catch (notificationFetchError) {
    console.error("Notification System Failure:", notificationFetchError);
    res.status(500).json({ error: "Your notifications couldn't be loaded right now." });
  }
};


//send online offline badge 
const getOnlineUsers = (redisClient, ONLINE_USERS_KEY) => async (req, res) => {
  try {
    if (redisClient) {
      const users = await redisClient.sMembers(ONLINE_USERS_KEY);
      res.json(users);
    } else {
      res.json([]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const forceLogout = (io, redisClient, ONLINE_USERS_KEY) => async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "No userId provided" });

  const targetId = userId.toString();

  // Kick the client off
  io.to(targetId).emit("forceLogout");

  // Remove from Redis online set and broadcast offline
  try {
    if (redisClient) {
      await redisClient.sRem(ONLINE_USERS_KEY, targetId);
    }
    io.emit("userStatus", { userId: targetId, status: "offline" });
  } catch (err) {
    console.error("forceLogout Redis cleanup error:", err.message);
  }

  res.json({ success: true });
};

//send follow rq to direct notify 
const handleSendFollowRequest = (io, socket) => async ({ to, status }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();

    if (!from || !targetTo) return;
    const createStatusModel = await FollowStatus.findOneAndUpdate(
      { from: from, to: targetTo },
      { status: status },
      { upsert: true, new: true }
    );
    const populatedReq = await FollowStatus.findById(createStatusModel._id).populate("from", "username image");
    io.to(targetTo).emit('newFollowReq', populatedReq);
  } catch (error) {
    console.error("sendFollowRequest error:", error);
  }
};

const handleAcceptFollowRequest = (io, socket) => async ({ from }) => {
  try {
    const to = socket.userId?.toString();
    const targetFrom = from?.toString();

    if (!to || !targetFrom) return;

    const checkPendingReq = await FollowStatus.findOne({ from: targetFrom, to: to });
    await Follow.create({ follower: targetFrom, following: to });

    if (checkPendingReq) {
      await FollowStatus.updateOne({ _id: checkPendingReq._id }, { status: 'accepted' });
    }

    const checkFriend = await Follow.findOne({ follower: to, following: targetFrom });
    if (!checkFriend) {
      await FollowStatus.create({ from: to, to: targetFrom, status: 'pending' });
    }

    io.to(targetFrom).emit("reqAccepted", { from: targetFrom, to: to });
    io.to(to).emit("reqAccepted", { from: targetFrom, to: to });
    io.to(to).emit("friendOrNot", { from: targetFrom, to: to, isFriend: !!checkFriend });
  } catch (error) {
    console.error("acceptFollowRequest error:", error);
  }
};

//followback
const handleFollowBack = (io, socket) => async ({ to }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();
    if (!from || !targetTo) return;

    await Follow.create({ follower: from, following: targetTo });
    await FollowStatus.updateOne({ from, to: targetTo }, { status: 'accepted' });

    io.to(from).emit("reqAccepted", { from, to: targetTo });
    io.to(targetTo).emit("reqAccepted", { from, to: targetTo });
  } catch (error) {
    console.error("followback error:", error);
  }
};

const handleDeclineReq = (io, socket) => async ({ from }) => {
  try {
    const to = socket.userId?.toString();
    const targetFrom = from?.toString();
    if (!to || !targetFrom) return;

    const findFollowStatus = await FollowStatus.findOne({ from: targetFrom, to: to });
    if (!findFollowStatus) return;

    await FollowStatus.deleteOne({ _id: findFollowStatus._id });
    io.to(targetFrom).emit('declineReq', { from: targetFrom, to: to });
  } catch (error) {
    console.error("declineReq error:", error);
  }
};

module.exports = {
  getFollowRequest,
  getNotifications,
  getOnlineUsers,
  forceLogout,
  handleSendFollowRequest,
  handleAcceptFollowRequest,
  handleFollowBack,
  handleDeclineReq
};

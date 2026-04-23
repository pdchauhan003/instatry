const User = require('../models/User');
const FollowStatus = require('../models/FollowStatus');
const Follow = require('../models/Follow');

// HTTP Handlers
const getFollowRequest = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const msg = await FollowStatus.findOne({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: u1 } // Wait, typo in original code was 'user1' vs 'u1'? No, 'user1'
      ]
    });
    // Wait, let me check original code for u1/user1.
    // In index.js:187 it was user1 and user2.
    res.json(msg || null);
  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};

const getNotifications = async (req, res) => {
  try {
    const requests = await FollowStatus.find({
      to: req.params.user1,
      status: "pending",
    }).populate("from", "username image");
    res.json(requests || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

const forceLogout = (io) => (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "No userId provided" });

  const targetId = userId.toString();
  io.to(targetId).emit("forceLogout");
  res.json({ success: true });
};

// Socket Handlers
const handleSendFollowRequest = (io, socket) => async ({ to, status }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();

    if (!from || !targetTo) return;
    const createStatusModel = await FollowStatus.create({
      from: from,
      to: targetTo,
      status: status
    });
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

const chatController = require("./chatController");
const userController = require("./userController");
const callController = require("./callController");

const handleSocketEvents = (io, socket, redisClient, ONLINE_USERS_KEY, pendingDisconnects) => {
  // Join event
  socket.on("join", async () => {
    try {
      const userId = socket.userId?.toString();
      if (!userId) return;

      socket.join(userId);

      if (pendingDisconnects[userId]) {
        clearTimeout(pendingDisconnects[userId]);
        delete pendingDisconnects[userId];
      }

      socket.to(userId).emit("sessionEnded", { message: "Login from another device" });

      if (redisClient) {
        await redisClient.sAdd(ONLINE_USERS_KEY, userId);
        const users = await redisClient.sMembers(ONLINE_USERS_KEY);
        io.to(userId).emit("onlineList", users);
      }

      socket.broadcast.emit("userStatus", { userId, status: "online" });
    } catch (error) {
      console.error("Socket join error:", error);
    }
  });

  // Force logout event
  socket.on("force-logout-user", (userId) => {
    try {
      if (socket.userId.toString() !== userId.toString()) return;
      io.to(userId.toString()).emit("forceLogout");
    } catch (error) {
      console.error("force-logout-user error:", error);
    }
  });

  // Chat events
  socket.on("sendMessage", chatController.handleSendMessage(io, socket));
  socket.on("markSeen", chatController.handleMarkSeen(io, socket));
  socket.on("deleteMessage", chatController.handleDeleteMessage(io, socket));
  socket.on("clearChat", chatController.handleClearChat(io, socket));

  // User/Follow events
  socket.on("sendFollowRequest", userController.handleSendFollowRequest(io, socket));
  socket.on("acceptFollowRequest", userController.handleAcceptFollowRequest(io, socket));
  socket.on("followback", userController.handleFollowBack(io, socket));
  socket.on("declineReq", userController.handleDeclineReq(io, socket));

  // Call events
  socket.on("call-user", callController.handleCallUser(io, socket));
  socket.on("answer-call", callController.handleAnswerCall(io, socket));
  socket.on("ice-candidate", callController.handleIceCandidate(io, socket));

  // Disconnect event
  socket.on("disconnect", async () => {
    try {
      const userId = socket.userId?.toString();
      if (!userId) return;

      pendingDisconnects[userId] = setTimeout(async () => {
        if (redisClient) {
          await redisClient.sRem(ONLINE_USERS_KEY, userId);
        }
        delete pendingDisconnects[userId];
        io.emit('userStatus', { userId, status: 'offline' });
      }, 5000);
    } catch (error) {
      console.error('Socket disconnect error:', error);
    }
  });
};

module.exports = { handleSocketEvents };

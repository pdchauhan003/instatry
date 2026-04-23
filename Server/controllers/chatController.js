const Message = require("../models/Message");
const mongoose = require("mongoose");

// HTTP Handlers
const getMessages = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const u1 = new mongoose.Types.ObjectId(user1);
    const u2 = new mongoose.Types.ObjectId(user2);

    const messages = await Message.find({
      $or: [
        { from: u1, to: u2 },
        { from: u2, to: u1 },
      ],
      deletedBy: { $ne: u1 }
    }).sort({ createdAt: -1 }).limit(20);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMessagesBefore = async (req, res) => {
  const { user1, user2, cursor } = req.params;
  try {
    const u1 = new mongoose.Types.ObjectId(user1);
    const u2 = new mongoose.Types.ObjectId(user2);

    const messages = await Message.find({
      $or: [{ from: u1, to: u2 }, { from: u2, to: u1 }],
      createdAt: { $lt: new Date(cursor) },
      deletedBy: { $ne: u1 }
    }).sort({ createdAt: -1 }).limit(20);
    res.json(messages.reverse());
  } catch (error) {
    console.error("Error in fetching old messages:", error);
    res.status(500).json({ error: error.message });
  }
};

// Socket Handlers
const handleSendMessage = (io, socket) => async ({ to, message }) => {
  try {
    const from = socket.userId?.toString();
    const targetTo = to?.toString();

    if (!targetTo || !from) {
      console.warn("sendMessage failed: missing to or from ID");
      return;
    }

    const savedMessage = await Message.create({
      from,
      to: targetTo,
      message,
      isSeen: false
    });

    io.to(targetTo).emit("receiveMessage", savedMessage);
    io.to(from).emit("receiveMessage", savedMessage);
  } catch (err) {
    console.error("sendMessage error:", err);
  }
};

const handleMarkSeen = (io, socket) => async ({ otherId }) => {
  try {
    const myId = socket.userId?.toString();
    const targetOther = otherId?.toString();

    if (!myId || !targetOther) return;

    await Message.updateMany(
      { from: targetOther, to: myId, isSeen: false },
      { $set: { isSeen: true } }
    );
    io.to(targetOther).emit('messageSeen', { by: myId });
  } catch (error) {
    console.error("markSeen error:", error);
  }
};

const handleDeleteMessage = (io, socket) => async ({ messageId, type }) => {
  try {
    const msg = await Message.findById(messageId);
    if (!msg) return;

    const fromId = msg.from?.toString();
    const toId = msg.to?.toString();
    const currentUserId = socket.userId?.toString();

    if (type === "everyone") {
      if (fromId !== currentUserId) {
        console.warn(`Unauthorized delete attempt by ${currentUserId}`);
        return;
      }
      await Message.findByIdAndDelete(messageId);
      if (fromId) io.to(fromId).emit("messageDeleted", messageId);
      if (toId) io.to(toId).emit("messageDeleted", messageId);
    } else {
      await Message.findByIdAndUpdate(messageId, {
        $addToSet: { deletedBy: currentUserId }
      });
      socket.emit("messageDeleted", messageId);
    }
  } catch (error) {
    console.error("deleteMessage error:", error);
  }
};

const handleClearChat = (io, socket) => async ({ otherId }) => {
  try {
    const myId = socket.userId?.toString();
    if (!myId || !otherId) return;

    await Message.updateMany(
      {
        $or: [
          { from: myId, to: otherId },
          { from: otherId, to: myId }
        ]
      },
      { $addToSet: { deletedBy: myId } }
    );
    socket.emit("chatCleared", { success: true });
  } catch (error) {
    console.error("clearChat error:", error);
    socket.emit("chatCleared", { success: false, error: error.message });
  }
};

module.exports = {
  getMessages,
  getMessagesBefore,
  handleSendMessage,
  handleMarkSeen,
  handleDeleteMessage,
  handleClearChat
};

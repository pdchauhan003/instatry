const Message = require("../models/Message");
const ClearedChat = require("../models/ClearedChat");
const mongoose = require("mongoose");

// HTTP Handlers
const getMessages = async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const u1 = new mongoose.Types.ObjectId(user1);
    const u2 = new mongoose.Types.ObjectId(user2);

    const clearedChat = await ClearedChat.findOne({ userId: u1, otherId: u2 });
    const minDate = clearedChat ? clearedChat.clearedAt : new Date(0);

    const messages = await Message.find({
      $or: [
        { from: u1, to: u2 },
        { from: u2, to: u1 },
      ],
      createdAt: { $gt: minDate },
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

    const clearedChat = await ClearedChat.findOne({ userId: u1, otherId: u2 });
    const minDate = clearedChat ? clearedChat.clearedAt : new Date(0);

    const cursorDate = new Date(cursor);
    if (cursorDate <= minDate) {
      return res.json([]);
    }

    const messages = await Message.find({
      $or: [{ from: u1, to: u2 }, { from: u2, to: u1 }],
      createdAt: { $lt: cursorDate, $gt: minDate },
      deletedBy: { $ne: u1 }
    }).sort({ createdAt: -1 }).limit(20);
    res.json(messages.reverse());
  } catch (error) {
    console.error("Error in fetching old messages:", error);
    res.status(500).json({ error: error.message });
  }
};

const getGroupMessages = async (req, res) => {
  const { groupId } = req.params;
  try {
    const gId = new mongoose.Types.ObjectId(groupId);

    const messages = await Message.find({
      groupId: gId,
    })
    .populate('from', 'username image')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(messages.reverse());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getGroupMessagesBefore = async (req, res) => {
  const { groupId, cursor } = req.params;
  try {
    const gId = new mongoose.Types.ObjectId(groupId);
    const cursorDate = new Date(cursor);

    const messages = await Message.find({
      groupId: gId,
      createdAt: { $lt: cursorDate },
    })
    .populate('from', 'username image')
    .sort({ createdAt: -1 })
    .limit(20);

    res.json(messages.reverse());
  } catch (error) {
    console.error("Error in fetching old group messages:", error);
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

const handleSendGroupMessage = (io, socket) => async ({ groupId, message }) => {
  try {
    const from = socket.userId?.toString();
    const targetGroup = groupId?.toString();

    if (!targetGroup || !from) {
      console.warn("sendGroupMessage failed: missing groupId or from ID");
      return;
    }

    const savedMessage = await Message.create({
      from,
      groupId: targetGroup,
      message,
      isSeen: false
    });

    const populatedMessage = await Message.findById(savedMessage._id).populate('from', 'username image');

    // Broadcast to the group room
    io.to(targetGroup).emit("receiveGroupMessage", populatedMessage);
  } catch (err) {
    console.error("sendGroupMessage error:", err);
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
      
      // If it's a group message, broadcast to the group room
      if (msg.groupId) {
        io.to(msg.groupId.toString()).emit("messageDeleted", messageId);
      }
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

    await ClearedChat.findOneAndUpdate(
      { userId: myId, otherId: otherId },
      { clearedAt: new Date() },
      { upsert: true, new: true }
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
  getGroupMessages,
  getGroupMessagesBefore,
  handleSendMessage,
  handleSendGroupMessage,
  handleMarkSeen,
  handleDeleteMessage,
  handleClearChat
};

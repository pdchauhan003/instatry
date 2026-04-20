const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
require('dotenv').config();
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const { createClient } = require('redis');
const { createAdapter } = require("@socket.io/redis-adapter");
const redisUrl = process.env.REDIS_URL;

let pubClient, subClient, redisClient;

// Startup check for JWT secrets
if (!process.env.ACCESS_SECRET) {
  console.error("CRITICAL: ACCESS_SECRET is not defined in environment variables!");
} else {
  console.log("Status: [Startup] ACCESS_SECRET is loaded");
}

const setupRedis = (ioInstance) => {
  if (!redisUrl) return;

  pubClient = createClient({ url: redisUrl });
  subClient = pubClient.duplicate();
  redisClient = pubClient.duplicate();

  const handleRedisError = (clientName, err) => {
    console.error(`Status: [Redis ${clientName} Error]:`, err.message);
  };

  pubClient.on('error', (err) => handleRedisError('Pub', err));
  subClient.on('error', (err) => handleRedisError('Sub', err));
  redisClient.on('error', (err) => handleRedisError('State', err));

  pubClient.on('connect', () => console.log('Status: [Redis Pub] Connecting...'));
  pubClient.on('ready', () => console.log('Status: [Redis Pub] Ready'));

  Promise.all([
    pubClient.connect(),
    subClient.connect(),
    redisClient.connect()
  ]).then(() => {
    console.log("Status: [Redis] All clients connected and ready");
    ioInstance.adapter(createAdapter(pubClient, subClient));
    console.log("Status: [Redis] Socket.io Adapter initialized");
  }).catch(err => console.error("Status: [Redis Connection Fatal Error]:", err));
};

const Message = require("./models/Message");
const FollowStatus = require('./models/FollowStatus');
const Follow = require('./models/Follow');
const User = require('./models/User')

// mondodb connection 
console.log("MONGO URI:", process.env.MONGODB_URI);
mongoose.connect(`${process.env.MONGODB_URI}`)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("DB Error:", err));

// mongoose.connect("mongodb://127.0.0.1:27017/EcommercePro")
//   .then(() => console.log("MongoDB Connected"))
//   .catch((error)=>console.log('mongo connection error',error))

const app = express();   // instance of express
const server = http.createServer(app);  //http server

const cors = require("cors");  // for communication of diferent post req

// app.use(cors({ origin: "*" }));   // * for all page 
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      origin.includes("localhost") ||
      origin.endsWith(".vercel.app") ||
      origin.includes("render.com")
    ) {
      callback(null, true);
    } else {
      // In production, you might want to be more specific, 
      // but to fix the immediate issue we allow all origins if they are from Vercel/Render
      callback(null, true);
    }
  },
  credentials: true
}));


// socket io server 
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//   },
// });

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins for socket connection to avoid deployment issues, 
      // security is handled by the JWT middleware anyway.
      callback(null, true);
    },
    credentials: true
  }
});

// Initialize Redis after io is created
setupRedis(io);

// authentication middleware
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.accessToken || socket.handshake.auth?.token;

    if (!token) {
      console.log("Status: [Auth Middleware] No token provided in cookies or auth object");
      return next(new Error("Authentication error: No token provided"));
    }

    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
      if (err) {
        console.error(`Status: [Auth Middleware] Token verification failed [${err.name}]: ${err.message}`);
        // If it's a signature mismatch, it's definitely a secret mismatch between frontend/backend
        if (err.message.includes("invalid signature")) {
          console.warn("Status: [Auth Middleware] Hint: Check if ACCESS_SECRET on Render matches Vercel exactly!");
        }
        return next(new Error(`Authentication error: Invalid token (${err.name})`));
      }

      // Ensure userId is a string for consistent room names and Redis keys
      socket.userId = decoded.id?.toString() || decoded.userId?.toString();
      console.log(`Status: [Auth Middleware] Socket ${socket.id} authenticated for user ${socket.userId}`);
      next();
    });
  } catch (err) {
    console.error("Middleware error:", err);
    next(new Error("Internal server error during authentication"));
  }
});

// const onlineUsers = {};  // REMOVED: using Redis instead
const pendingDisconnects = {}; // userId -> Timeout
const ONLINE_USERS_KEY = "online_users";

app.get("/", (req, res) => {
  res.send("Server is running ");
});

// this is used to fetch last 30 messages  not older only plast 30
app.get("/messages/:user1/:user2", async (req, res) => {
  const { user1, user2 } = req.params;
  // const limit=30;

  try {
    const u1 = new mongoose.Types.ObjectId(user1);
    const u2 = new mongoose.Types.ObjectId(user2);

    const messages = await Message.find({
      $or: [
        { from: u1, to: u2 },
        { from: u2, to: u1 },
      ],
    }).sort({ createdAt: -1 }).limit(20);

    res.json(messages.reverse());  // reverse so chat show correct order
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// this is used to fetch older messages fetching 30-30 messages only....
app.get('/message/:user1/:user2/before/:cursor', async (req, res) => {
  const { user1, user2, cursor } = req.params;
  // const limit=30
  try {
    const u1 = new mongoose.Types.ObjectId(user1);
    const u2 = new mongoose.Types.ObjectId(user2);

    const messages = await Message.find({
      $or: [{ from: u1, to: u2 }, { from: u2, to: u1 }],
      createdAt: { $lt: new Date(cursor) }
    }).sort({ createdAt: -1 }).limit(20);
    res.json(messages.reverse())
  }
  catch (error) {
    console.log(error, 'error in fetching old messages')
    res.json({ error: error.message })
  }
})


app.get('/request/:user1/:user2', async (req, res) => {
  const { user1, user2 } = req.params;
  try {
    const msg = await FollowStatus.findOne({
      $or: [
        { from: user1, to: user2 },
        { from: user2, to: user1 }
      ]
    });
    console.log('messages is', msg)
    res.json(msg || null)
  }
  catch (err) {
    console.log('error in fetching req messages data in backend')
    res.status(500).json({ err: err.msg })
  }
})

app.get("/notification/:user1", async (req, res) => {
  try {
    const requests = await FollowStatus.find({
      to: req.params.user1,
      status: "pending",
    }).populate("from", "username image");

    res.json(requests || []);
  } catch (err) {
    console.log(err);
    res.json([]);
  }
});

// for check online or offline 
app.get("/online-users", async (req, res) => {
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
});

// any other user logged in same account then trigger
app.post("/force-logout", (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: "No userId provided" });

  const targetId = userId.toString();
  // Broadcasting to the userId room reaches all server instances
  io.to(targetId).emit("forceLogout");
  console.log(`Status: [Trace] Force logout sent to ${targetId}`);
  res.json({ success: true });
});

io.on("connection", (socket) => {
  // join socket 
  socket.on("join", async () => {
    try {
      const userId = socket.userId?.toString();
      if (!userId) {
        console.warn("Status: [Socket Join] Attempted join without userId");
        return;
      }

      // Every user joins their own room (for distributed broadcasting)
      socket.join(userId);

      // Cancel any pending disconnect for this user (e.g. from a page refresh)
      if (pendingDisconnects[userId]) {
        clearTimeout(pendingDisconnects[userId]);
        delete pendingDisconnects[userId];
        console.log(`Status: [Socket Join] Cancelled pending disconnect for ${userId}`);
      }

      console.log(`Status: [Socket Join] ${userId} joined room`);

      // Sessions management: Force logout other sessions
      // In a distributed setup, we emit to the room except the current socket
      socket.to(userId).emit("sessionEnded", {
        message: "Login from another device"
      });
      // Note: Truly disconnecting remote sockets requires more complex logic, 
      // but emitting sessionEnded is the standard first step.

      // Save to Redis online users set
      if (redisClient) {
        await redisClient.sAdd(ONLINE_USERS_KEY, userId);
      }

      // send online list to this user
      if (redisClient) {
        const users = await redisClient.sMembers(ONLINE_USERS_KEY);
        io.to(userId).emit("onlineList", users);
      }

      // notify others
      socket.broadcast.emit("userStatus", {
        userId,
        status: "online",
      });
    } catch (error) {
      console.log(error, 'error in join socket');
    }
  });

  //if register-user account in onlineUsers then logout from other device means open in new device only
  // this trigger in /Componants/SocketListener.js
  //-----
  socket.on("force-logout-user", (userId) => {
    try {
      if (socket.userId.toString() !== userId.toString()) {
        console.log("Unauthorized force-logout attempt by", socket.userId);
        return;
      }
      // Broadcast to the user's room across all servers
      io.to(userId.toString()).emit("forceLogout");
      console.log(`Status: [Trace] Force-logout-user emitted for ${userId}`);
    } catch (error) {
      console.log(error, 'error in force-logout-user socket');
    }
  });

  // for chatting 
  socket.on("sendMessage", async ({ to, message }) => {
    try {
      const from = socket.userId?.toString();
      const targetTo = to?.toString();

      if (!targetTo || !from) {
        console.warn("Status: [Trace] sendMessage failed - missing to or from ID");
        return;
      }

      console.log(`Status: [Trace] Sending message from ${from} to ${targetTo}`);

      const savedMessage = await Message.create({
        from,
        to: targetTo,
        message,
        isSeen: false
      });

      // Distribute to all sockets of the 'to' user
      io.to(targetTo).emit("receiveMessage", savedMessage);
      // Also send back to the sender (all their devices)
      io.to(from).emit("receiveMessage", savedMessage);

      console.log(`Status: [Trace] Message saved and emitted to both rooms`);
    } catch (err) {
      console.error("Status: [Trace] sendMessage error:", err);
    }
  });

  //for unreaded message badge 
  socket.on('markSeen', async ({ otherId }) => {
    try {
      const myId = socket.userId?.toString();
      const targetOther = otherId?.toString();

      if (!myId || !targetOther) return;

      await Message.updateMany({ from: targetOther, to: myId, isSeen: false },
        { $set: { isSeen: true } }
      )
      // notify the sender globally
      io.to(targetOther).emit('messageSeen', { by: myId });
      console.log(`Status: [Trace] markSeen from ${myId} to ${targetOther}`);
    } catch (error) {
      console.error("Status: [Trace] markSeen error:", error);
    }
  })

  // for deleting messages
  socket.on("deleteMessage", async ({ messageId }) => {
    try {
      const msg = await Message.findById(messageId);
      if (!msg) return;

      const fromId = msg.from?.toString();
      const toId = msg.to?.toString();

      if (fromId !== socket.userId?.toString()) {
        console.warn(`Status: [Trace] Unauthorized delete attempt by ${socket.userId}`);
        return;
      }

      await Message.findByIdAndDelete(messageId);

      // Notify both participants globally
      if (fromId) io.to(fromId).emit("messageDeleted", messageId);
      if (toId) io.to(toId).emit("messageDeleted", messageId);

      console.log(`Status: [Trace] deleteMessage ${messageId} from ${fromId} to ${toId}`);
    } catch (error) {
      console.error("Status: [Trace] deleteMessage error:", error);
    }
  });

  // sending follow req
  socket.on('sendFollowRequest', async ({ to, status }) => {
    try {
      const from = socket.userId?.toString();
      const targetTo = to?.toString();

      if (!from || !targetTo) return;

      console.log(`Status: [Trace] Follow request from ${from} to ${targetTo}`);

      const createStatusModel = await FollowStatus.create({
        from: from,
        to: targetTo,
        status: status
      })

      const populatedReq = await FollowStatus.findById(createStatusModel._id).populate("from", "username image");

      io.to(targetTo).emit('newFollowReq', populatedReq);
      console.log(`Status: [Trace] Follow request saved and emitted to ${targetTo}`);
    }
    catch (error) {
      console.error("Status: [Trace] sendFollowRequest error:", error);
    }
  })

  //accept follow req
  socket.on('acceptFollowRequest', async ({ from }) => {
    try {
      const to = socket.userId?.toString();
      const targetFrom = from?.toString();

      if (!to || !targetFrom) return;

      const checkPendingReq = await FollowStatus.findOne({ from: targetFrom, to: to });

      const createFollowCollection = await Follow.create({
        follower: targetFrom,
        following: to,
      })

      if (checkPendingReq) {
        await FollowStatus.updateOne({ _id: checkPendingReq._id }, { status: 'accepted' });
      }

      const checkFriend = await Follow.findOne({ follower: to, following: targetFrom });

      if (!checkFriend) {
        await FollowStatus.create({
          from: to,
          to: targetFrom,
          status: 'pending'
        })
      }

      // Notify participants globally
      io.to(targetFrom).emit("reqAccepted", { from: targetFrom, to: to });
      io.to(to).emit("reqAccepted", { from: targetFrom, to: to });
      io.to(to).emit("friendOrNot", { from: targetFrom, to: to, isFriend: !!checkFriend });

      console.log(`Status: [Trace] acceptFollowRequest from ${targetFrom} to ${to}`);
    }
    catch (error) {
      console.error("Status: [Trace] acceptFollowRequest error:", error);
    }
  })

  //if user can get follow back then it trigger
  socket.on('followback', async ({ to }) => {
    try {
      const from = socket.userId?.toString();
      const targetTo = to?.toString();
      if (!from || !targetTo) return;

      await Follow.create({ follower: from, following: targetTo });

      //update followstatus
      await FollowStatus.updateOne({ from, to: targetTo }, { status: 'accepted' });

      // Notify participants globally
      io.to(from).emit("reqAccepted", { from, to: targetTo });
      io.to(targetTo).emit("reqAccepted", { from, to: targetTo });

      console.log(`Status: [Trace] followback from ${from} to ${targetTo}`);
    }
    catch (error) {
      console.error("Status: [Trace] followback error:", error);
    }
  })

  // decline request
  socket.on('declineReq', async ({ from }) => {
    try {
      const to = socket.userId?.toString();
      const targetFrom = from?.toString();
      if (!to || !targetFrom) return;

      const findFollowStatus = await FollowStatus.findOne({ from: targetFrom, to: to });
      if (!findFollowStatus) return;

      await FollowStatus.deleteOne({ _id: findFollowStatus._id });

      // Notify original sender globally
      io.to(targetFrom).emit('declineReq', { from: targetFrom, to: to });
      console.log(`Status: [Trace] declineReq from ${to} for ${targetFrom}`);
    }
    catch (error) {
      console.error("Status: [Trace] declineReq error:", error);
    }
  })

  socket.on('call-user', ({ to, offer }) => {
    try {
      const from = socket.userId?.toString();
      const targetTo = to?.toString();
      if (!from || !targetTo) return;

      io.to(targetTo).emit('incoming-call', {
        from: from,
        offer
      })
      console.log(`Status: [Trace] call-user from ${from} to ${targetTo}`);
    } catch (error) {
      console.error("Status: [Trace] call-user error:", error);
    }
  })

  socket.on('answer-call', ({ to, answer }) => {
    try {
      const from = socket.userId?.toString();
      const targetTo = to?.toString();
      if (!from || !targetTo) return;

      io.to(targetTo).emit('call-accepted', { by: from, answer });
      console.log(`Status: [Trace] answer-call from ${from} to ${targetTo}`);
    } catch (error) {
      console.error("Status: [Trace] answer-call error:", error);
    }
  });

  socket.on('ice-candidate', ({ to, candidate }) => {
    try {
      const targetTo = to?.toString();
      if (!targetTo) return;

      io.to(targetTo).emit('ice-candidate', candidate);
    } catch (error) {
      console.error("Status: [Trace] ice-candidate error:", error);
    }
  });

  // disconnectingg
  socket.on("disconnect", async () => {
    try {
      const userId = socket.userId?.toString();
      if (!userId) {
        console.log(`Status: [Socket Disconnect] Socket ${socket.id} disconnected (no userId)`);
        return;
      }

      console.log(`Status: [Socket Disconnect] ${userId} disconnected, starting grace period...`);

      // Set a timeout to mark user as offline
      // This prevents flickering status during page refreshes (re-joins)
      pendingDisconnects[userId] = setTimeout(async () => {
        if (redisClient) {
          await redisClient.sRem(ONLINE_USERS_KEY, userId);
          console.log(`Status: [Socket Disconnect] ${userId} removed from Redis online_users`);
        }
        delete pendingDisconnects[userId];

        io.emit('userStatus', {
          userId: userId,
          status: 'offline'
        });
        console.log(`Status: [Socket Disconnect] ${userId} is now globally offline`);
      }, 5000); // 5 second grace period
    } catch (error) {
      console.error('Status: [Socket Disconnect Error]:', error);
    }
  });
});

const PORT = process.env.PORT || 1212;

server.listen(PORT, () => {
  console.log(`Socket running on ${PORT}`);
});

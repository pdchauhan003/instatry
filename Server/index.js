const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookie = require("cookie");
const cors = require("cors");
const { createClient } = require('redis');
const { createAdapter } = require("@socket.io/redis-adapter");

require('dotenv').config();

const chatController = require("./controllers/chatController");
const userController = require("./controllers/userController");
const { handleSocketEvents } = require("./controllers/socketHandler");

//for socket connection
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

let pubClient, subClient, redisClient;
const redisUrl = process.env.REDIS_URL;
const ONLINE_USERS_KEY = "online_users";
const pendingDisconnects = {};

// Startup checks
if (!process.env.ACCESS_SECRET) {
  console.error("ACCESS_SECRET is not defined!");
}

// redis for caching backend data of chats nd user data
const setupRedis = (ioInstance) => {
  if (!redisUrl) return;

  pubClient = createClient({ url: redisUrl });
  subClient = pubClient.duplicate();
  redisClient = pubClient.duplicate();

  const handleRedisError = (name, err) => console.error(`Redis ${name} error:`, err.message);
  pubClient.on('error', (err) => handleRedisError('Pub', err));
  subClient.on('error', (err) => handleRedisError('Sub', err));
  redisClient.on('error', (err) => handleRedisError('State', err));

  Promise.all([pubClient.connect(), subClient.connect(), redisClient.connect()])
    .then(() => {
      console.log("Redis connected");
      ioInstance.adapter(createAdapter(pubClient, subClient));
    })
    .catch(err => console.error("Redis Connection Error", err));
};

// MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("DB Error:", err));

const app = express();
app.use(express.json()); // Added to parse JSON bodies 

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://instatry-eight.vercel.app",
];

const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};

app.use(cors({ 
  origin: checkOrigin, 
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["set-cookie"]
}));


const io = new Server(server, {
  cors: { origin: checkOrigin, credentials: true }
});

setupRedis(io);

// socket authentication
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.accessToken || socket.handshake.auth?.token;

    if (!token) {
      console.log("Socket Auth Failed: No token found in cookies");
      return next(new Error("Authentication error: No token"));
    }

    jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
      if (err) return next(new Error(`Authentication error: ${err.name}`));
      
      const userId = decoded.id?.toString() || decoded.userId?.toString();
      const sessionId = decoded.sessionId;

      if (redisClient && sessionId) {
        try {
          const storedSessionId = await redisClient.get(`session:${userId}`);
          if (storedSessionId !== sessionId) {
            return next(new Error("Authentication error: Session revoked"));
          }
        } catch (e) {
          console.error("Socket Auth Redis Error:", e);
        }
      }

      socket.userId = userId;
      socket.role = decoded.role;
      next();
    });
  } catch (err) {
    next(new Error("Internal server error during auth"));
  }
});

// Authentication Middleware for Express Routes
const authenticate = (req, res, next) => {
  try {
    const cookies = cookie.parse(req.headers.cookie || "");
    const token = cookies.accessToken || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Unauthorized: No token provided" });

    jwt.verify(token, process.env.ACCESS_SECRET, async (err, decoded) => {
      if (err) return res.status(401).json({ error: "Unauthorized: Invalid token" });
      
      const userId = decoded.id?.toString() || decoded.userId?.toString();
      const sessionId = decoded.sessionId;

      // Crucial: Check Redis to see if this session is still the active one
      if (redisClient && sessionId) {
        try {
          const storedSessionId = await redisClient.get(`session:${userId}`);
          if (storedSessionId !== sessionId) {
            return res.status(401).json({ error: "Session expired or logged in elsewhere" });
          }
        } catch (redisErr) {
          console.error("Redis check failed in socket server:", redisErr);
          // Fallback: allow if redis is down? No, better be safe.
        }
      }

      req.userId = userId;
      req.role = decoded.role;
      next();
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error during authentication" });
  }
};

// Internal server-to-server auth middleware (uses shared secret)
const authenticateInternal = (req, res, next) => {
  const internalSecret = req.headers['x-internal-secret'];
  if (internalSecret && internalSecret === process.env.INTERNAL_API_SECRET) {
    return next(); // Trusted server-to-server call
  }
  return authenticate(req, res, next); // Fall back to normal auth
};

// IDOR Check Middleware for Personal Messages
const checkChatOwnership = (req, res, next) => {
  const { user1, user2 } = req.params;
  const currentUserId = req.userId;

  if (currentUserId !== user1 && currentUserId !== user2) {
    return res.status(403).json({ error: "Forbidden: You are not a participant in this chat" });
  }
  next();
};

// Group Membership Check Middleware
const checkGroupMembership = async (req, res, next) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;
    const Member = require("./models/Members");

    const isMember = await Member.findOne({ groupId, userId });
    if (!isMember) {
      return res.status(403).json({ error: "Forbidden: You are not a member of this group" });
    }
    next();
  } catch (err) {
    res.status(500).json({ error: "Internal server error during membership check" });
  }
};

// routes
app.get("/", (req, res) => res.send("Server is running"));

// Personal messages (with Auth + IDOR check)
app.get("/messages/:user1/:user2", authenticate, checkChatOwnership, chatController.getMessages);
app.get("/message/:user1/:user2/before/:cursor", authenticate, checkChatOwnership, chatController.getMessagesBefore);

// Group messages (Auth + Membership check)
app.get("/group-messages/:groupId", authenticate, checkGroupMembership, chatController.getGroupMessages);
app.get("/group-message/:groupId/before/:cursor", authenticate, checkGroupMembership, chatController.getGroupMessagesBefore);

// User specific data (Auth)
app.get("/request/:user1/:user2", authenticate, (req, res, next) => {
    if (req.userId !== req.params.user1 && req.userId !== req.params.user2) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
}, userController.getFollowRequest);

app.get("/notification/:user1", authenticate, (req, res, next) => {
    if (req.userId !== req.params.user1) {
        return res.status(403).json({ error: "Forbidden" });
    }
    next();
}, userController.getNotifications);

app.get("/online-users", authenticate, (req, res) => userController.getOnlineUsers(redisClient, ONLINE_USERS_KEY)(req, res));
app.post("/force-logout", authenticateInternal, (req, res) => userController.forceLogout(io, redisClient, ONLINE_USERS_KEY)(req, res));

// Socket connection
io.on("connection", (socket) => {
  handleSocketEvents(io, socket, redisClient, ONLINE_USERS_KEY, pendingDisconnects);
});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));

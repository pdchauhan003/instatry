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

// Redis setup
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
app.use(express.json()); // Added to parse JSON bodies for /force-logout

const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:3000",
  "https://instatry-eight.vercel.app",
];

const checkOrigin = (origin, callback) => {
  if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
  return callback(new Error("Not allowed by CORS"));
};

app.use(cors({ origin: checkOrigin, credentials: true }));

const io = new Server(server, {
  cors: { origin: checkOrigin, credentials: true }
});

setupRedis(io);

// Socket Auth
io.use((socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.accessToken || socket.handshake.auth?.token;

    if (!token) return next(new Error("Authentication error: No token"));

    jwt.verify(token, process.env.ACCESS_SECRET, (err, decoded) => {
      if (err) return next(new Error(`Authentication error: ${err.name}`));
      socket.userId = decoded.id?.toString() || decoded.userId?.toString();
      next();
    });
  } catch (err) {
    next(new Error("Internal server error during auth"));
  }
});

// HTTP Routes
app.get("/", (req, res) => res.send("Server is running"));
app.get("/messages/:user1/:user2", chatController.getMessages);
app.get("/message/:user1/:user2/before/:cursor", chatController.getMessagesBefore);
app.get("/group-messages/:groupId", chatController.getGroupMessages);
app.get("/group-message/:groupId/before/:cursor", chatController.getGroupMessagesBefore);
app.get("/request/:user1/:user2", userController.getFollowRequest);
app.get("/notification/:user1", userController.getNotifications);
app.get("/online-users", (req, res) => userController.getOnlineUsers(redisClient, ONLINE_USERS_KEY)(req, res));
app.post("/force-logout", (req, res) => userController.forceLogout(io)(req, res));

// Socket Events
io.on("connection", (socket) => {
  handleSocketEvents(io, socket, redisClient, ONLINE_USERS_KEY, pendingDisconnects);
});

const PORT = process.env.PORT || 1212;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));

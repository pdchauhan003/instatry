// import Message from "@/models/Message";
// import FollowStatus from "@/models/FollowStatus";
// import Follow from "@/models/Follow";
// import redis from "@/services/redis";

// export const handleSocketConnection = (io, socket) => {
//     socket.on("join", async (userId) => {
//         await redis.set(`online:${userId}`, socket.id);
//         console.log(userId + " joined");
//         io.emit("userStatusChange", { userId, status: "online" });
//     });

//     socket.on("sendMessage", async ({ from, to, message }) => {
//         try {
//             const savedMessage = await Message.create({
//                 from,
//                 to,
//                 message
//             });

//             const receiverSocket = await redis.get(`online:${to}`);

//             if (receiverSocket) {
//                 io.to(receiverSocket).emit("receiveMessage", savedMessage);
//             }

//             socket.emit("receiveMessage", savedMessage);

//         } catch (err) {
//             console.error("Socket sendMessage error:", err);
//         }
//     });

//     socket.on("disconnect", async () => {
//         const keys = await redis.keys("online:*");
//         for (let key of keys) {
//             const val = await redis.get(key);
//             if (val === socket.id) {
//                 const userId = key.split(":")[1];
//                 await redis.del(key);
//                 console.log(userId + " disconnected");
//                 io.emit("userStatusChange", { userId, status: "offline" });
//                 break;
//             }
//         }
//     });
// };

import { Server } from "socket.io";
let io;
export const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
            methods: ["GET", "POST"],
        },
    });

    return io;
};
export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

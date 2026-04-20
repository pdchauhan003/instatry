import { io } from "socket.io-client";

// const socket = io( `${process.env.NEXT_PUBLIC_SOCKET_URL}` ||"http://localhost:1212");
const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:1212"}`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
});
socket.on("connect", () => {
    console.log('socket connected:', socket.id);
});
socket.on("connect_error", (error) => {
    console.error('socket connection error:', error.message);
});

export default socket;

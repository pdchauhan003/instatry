import { io } from "socket.io-client";

// const socket = io( `${process.env.NEXT_PUBLIC_SOCKET_URL}` ||"http://localhost:1212");
const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:1212"}`, {
    withCredentials: true,
    transports: ["websocket", "polling"],
    autoConnect: false, // Don't connect until we have the token
});

socket.on("connect", () => {
    console.log('Status: [Socket] Connected:', socket.id);
});

socket.on("connect_error", (error) => {
    console.error('Status: [Socket] Connection error:', error.message);
});

export default socket;

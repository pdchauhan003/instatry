import { io } from "socket.io-client";

// const socket = io( `${process.env.NEXT_PUBLIC_SOCKET_URL}` ||"http://localhost:1212");
const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:1212"}`, {
    withCredentials: true,
    transports: ["websocket"], // Only use websocket for production stability
    autoConnect: false,
});

socket.on("connect", () => {
    console.log('Status: Socket Connected:', socket.id);
});
//if prob in connection the triugger
socket.on("connect_error", (error) => {
    // Suppress common auth errors as they are handled by SocketProvider with a silent refresh
    if (!error.message.includes("TokenExpiredError") && !error.message.includes("Authentication error")) {
        console.error('Status: [Socket] Connection error:', error.message);
    }
});

export default socket;

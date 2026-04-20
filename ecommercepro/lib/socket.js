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
    if (error.message.includes("Authentication error")) {
        console.warn("Tip: If you just deployed, try logging out and logging back in once to refresh your auth token.");
    }
});

export default socket;

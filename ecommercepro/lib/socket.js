import { io } from "socket.io-client";

const socket = io("http://localhost:1212");

export default socket;

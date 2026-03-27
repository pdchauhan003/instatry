import { io } from "socket.io-client";

const socket = io( `${process.env.NEXT_PUBLIC_SOCKET_URL}` ||"http://localhost:1212");

export default socket;

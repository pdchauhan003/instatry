import { io } from "socket.io-client";

// const socket = io( `${process.env.NEXT_PUBLIC_SOCKET_URL}` ||"http://localhost:1212");
const socket = io( `${process.env.NEXT_PUBLIC_SOCKET_URL}`);
if(socket)
{
    console.log('socket connected')
}
else{
    console.log('socket not connected')
}

export default socket;

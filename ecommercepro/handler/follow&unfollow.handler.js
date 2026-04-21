import socket from "@/lib/socket";

export const handleFollow=async({id,friendId,setStatus})=>{
    try {
      socket.emit("sendFollowRequest", {
        to: friendId,
        status: "pending",
      });
      setStatus("requested");
    } catch (error) {
      console.error(error);
      alert(error,'error in sending follow req...')
    }
}

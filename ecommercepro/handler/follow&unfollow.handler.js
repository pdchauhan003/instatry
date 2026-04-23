import socket from "@/lib/socket";
import { toast } from "react-hot-toast";

export const handleFollow=async({id,friendId,setStatus})=>{
    try {
      socket.emit("sendFollowRequest", {
        to: friendId,
        status: "pending",
      });
      setStatus("requested");
    } catch (error) {
      console.error(error);
      toast.error('error in sending follow req...')
    }
}

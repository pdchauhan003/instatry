"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import socket from "@/lib/socket";

export default function SocketProvider({ children }) {
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    if (!socket.connected) {
      socket.connect();
    }
    // always join when id available
    socket.emit("join", id);
    console.log("socket joined for user:", id);

    socket.on("sessionEnded", () => {
      alert("You logged in from another device");
      window.location.href = "/login";
      socket.disconnect();
    });

    socket.on("forceLogout", () => {
      alert("You logged in from another device");
      window.location.href = "/login";
    });
    return () => socket.disconnect();
  }, [id]);

  return children;
}

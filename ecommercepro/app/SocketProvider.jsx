"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import socket from "@/lib/socket";

export default function SocketProvider({ children }) {
  const params = useParams();
  const id = params?.id;

  useEffect(() => {
    if (!id) return;

    const handleConnect = () => {
      console.log("Socket connected, emitting join");
      socket.emit("join");
    };

    if (!socket.connected) {
      socket.connect();
    } else {
      // already connected, just join
      handleConnect();
    }

    socket.on("connect", handleConnect);

    socket.on("sessionEnded", () => {
      alert("You logged in from another device");
      window.location.href = "/login";
      socket.disconnect();
    });

    socket.on("forceLogout", () => {
      alert("You logged in from another device");
      window.location.href = "/login";
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.disconnect();
    };
  }, [id]);

  return children;
}

"use client";
import { useEffect } from "react";
import { io } from "socket.io-client";

export default function SocketListener({ userId }) {
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`);

    socket.on("forceLogout", () => {
      alert("You logged in from another device");
      window.location.href = "/login";
    });

    return () => socket.disconnect();
  }, [userId]);

  return null;
}
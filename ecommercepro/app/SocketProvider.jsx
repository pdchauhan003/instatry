"use client";
import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import socket from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";

export default function SocketProvider({ children }) {
  const params = useParams();
  const id = params?.id;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    if (!id) return;

    const handleConnect = () => {
      console.log("Status: [Socket] connected, emitting join");
      socket.emit("join");
    };

    if (!socket.connected) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        socket.auth = { ...socket.auth, token };
        socket.connect();
      }
    } else {
      handleConnect();
    }

    const handleConnectError = async (error) => {
      console.error("Status: [Socket] Connection error:", error.message);
      if (error.message.includes("TokenExpiredError")) {
        console.log("Token expired, attempting refresh...");
        try {
          const res = await fetch("/api/auth/refresh", { method: "POST" });
          const data = await res.json();
          if (data.success && data.accessToken) {
            localStorage.setItem("auth_token", data.accessToken);
            socket.auth = { ...socket.auth, token: data.accessToken };
            socket.connect();
          } else {
            console.error("Refresh failed, redirecting to login");
            window.location.href = "/login";
          }
        } catch (err) {
          console.error("Error during refresh:", err);
          window.location.href = "/login";
        }
      }
    };

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);

    socket.on("sessionEnded", () => {
      toast.error("You logged in from another device");
      window.location.href = "/login";
      socket.disconnect();
    });

    const handleReceiveMessage = (msg) => {
      if (msg.to === id) {
        const activeChatPath = `/home/${id}/chatt/personalChatt/${msg.from}`;
        if (pathnameRef.current === activeChatPath) return;

        queryClient.setQueryData(['friends', id], (oldContacts) => {
          if (!oldContacts) return oldContacts;
          return oldContacts.map(user =>
            user._id === msg.from
              ? {
                ...user,
                unreadCount: (user.unreadCount || 0) + 1,
                lastMessageTime: new Date()
              }
              : user
          ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
        });
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    socket.on("forceLogout", () => {
      toast.error("You logged in from another device");
      window.location.href = "/login";
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("receiveMessage", handleReceiveMessage);
      // Removed socket.disconnect() to allow persistence across page navigations
      // The socket will disconnect automatically on browser close or manual logout
    };
  }, [id, queryClient]); // Removed params from dependencies

  return children;
}

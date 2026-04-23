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

    socket.on("connect", handleConnect);

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
      socket.off("receiveMessage", handleReceiveMessage);
      // Removed socket.disconnect() to allow persistence across page navigations
      // The socket will disconnect automatically on browser close or manual logout
    };
  }, [id, queryClient]); // Removed params from dependencies

  return children;
}

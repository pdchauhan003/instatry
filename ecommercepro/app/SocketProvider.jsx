"use client";
import { useEffect, useRef } from "react";
import { useParams, usePathname } from "next/navigation";
import socket from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";

export default function SocketProvider({ children }) {
  const params = useParams();
  const id = params?.id;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const pathnameRef = useRef(pathname);

  // Keep the ref updated with the latest pathname
  // This prevents "stale closures" in the socket listeners
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
      // Inject token for deployment cross-domain support
      const token = localStorage.getItem('auth_token');
      if (token) {
        console.log("Status: [Socket] Injecting auth token from storage");
        socket.auth = { ...socket.auth, token };
        socket.connect();
      } else {
        console.warn("Status: [Socket] No token found in storage, deferring connection until login");
      }
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

    const handleReceiveMessage = (msg) => {
      // Check if message is for the logged in user
      if (msg.to === id) {
        // If the user is ALREADY in the chat room with the sender, 
        // we don't increment the global "unread" counter.
        // This prevents the stale badge issue when returning to the chat list.
        const activeChatPath = `/home/${id}/chatt/personalChatt/${msg.from}`;
        if (pathnameRef.current === activeChatPath) {
          console.log("User in active chat, skipping badge update");
          return;
        }

        console.log("Global message received, updating badge cache");
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
      alert("You logged in from another device");
      window.location.href = "/login";
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.disconnect();
    };
  }, [id]);

  return children;
}

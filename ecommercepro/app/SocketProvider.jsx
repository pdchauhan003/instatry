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

    const attemptConnection = () => {
      if (!socket.connected) {
        const token = localStorage.getItem('auth_token');
        if (token) {
          socket.auth = { ...socket.auth, token };
          socket.connect();
        }
      } else {
        handleConnect();
      }
    };

    const handleConnectError = async (error) => {
      const isTokenExpired = error.message.includes("TokenExpiredError");
      
      if (!isTokenExpired) {
        console.error("Status: [Socket] Connection error:", error.message);
      } else {
        console.log("Status: [Socket] Token expired, initiating silent refresh...");
      }
      
      // Handle both specific TokenExpiredError and general auth errors that might occur after timeout
      if (isTokenExpired || error.message.includes("Authentication error")) {
        console.log("Token likely expired or invalid, attempting refresh...");
        try {
          const res = await fetch("/api/auth/refresh", { method: "POST" });
          const data = await res.json();
          
          if (data.success && data.accessToken) {
            console.log("Status: [Socket] Token refreshed successfully");
            localStorage.setItem("auth_token", data.accessToken);
            socket.auth = { ...socket.auth, token: data.accessToken };
            socket.connect();
          } else {
            console.error("Refresh failed, redirecting to login");
            window.location.href = "/login";
          }
        } catch (err) {
          console.error("Error during refresh:", err);
          // Don't redirect immediately on network error, might be a temporary glitch
        }
      }
    };

    // Proactively handle tab refocus / return to app
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Status: [App] Tab focused, checking socket...");
        if (!socket.connected) {
          attemptConnection();
        }
      }
    };

    // Initial connection
    attemptConnection();

    socket.on("connect", handleConnect);
    socket.on("connect_error", handleConnectError);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    socket.on("sessionEnded", () => {
      toast.error("You logged in from another device");
      window.location.href = "/login";
      socket.disconnect();
    });

    const handleReceiveMessage = (msg) => {
      if (msg.to === id) {
        const activeChatPath = `/home/${id}/chatt/personalChatt/${msg.from}`;
        if (pathnameRef.current === activeChatPath) return;

        queryClient.setQueryData(['friends', id], (oldData) => {
          if (!oldData) return oldData;

          // If oldData is an array (old structure)
          if (Array.isArray(oldData)) {
            return oldData.map(user =>
              user._id === msg.from
                ? {
                  ...user,
                  unreadCount: (user.unreadCount || 0) + 1,
                  lastMessageTime: new Date()
                }
                : user
            ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
          }

          // If oldData is an object (new structure { friends, groups })
          return {
            ...oldData,
            friends: (oldData.friends || []).map(user =>
              user._id === msg.from
                ? {
                  ...user,
                  unreadCount: (user.unreadCount || 0) + 1,
                  lastMessageTime: new Date()
                }
                : user
            ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
          };
        });
      }
    };

    const handleReceiveGroupMessage = (msg) => {
      const activeGroupPath = `/home/${id}/chatt/groupChat/${msg.groupId}`;
      if (pathnameRef.current === activeGroupPath) return;

      queryClient.setQueryData(['friends', id], (oldData) => {
        if (!oldData || !oldData.groups) return oldData;

        return {
          ...oldData,
          groups: oldData.groups.map(group =>
            group._id === msg.groupId
              ? {
                ...group,
                unreadCount: (group.unreadCount || 0) + 1,
                // lastMessageTime: new Date() // Group messages don't have lastMessageTime sorting in current sidebar but could be added
              }
              : group
          )
        };
      });
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("receiveGroupMessage", handleReceiveGroupMessage);

    socket.on("forceLogout", () => {
      toast.error("You logged in from another device");
      window.location.href = "/login";
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, queryClient]); // Removed params from dependencies

  return children;
}

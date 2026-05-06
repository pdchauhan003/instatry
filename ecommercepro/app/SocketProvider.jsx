"use client";
import { useEffect, useRef } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import IncomingCallModal from "@/components/IncomingCallModal";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setToken } from "@/redux/authSlice";

export default function SocketProvider({ children }) {
  const params = useParams();
  const id = params?.id;
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const pathnameRef = useRef(pathname);
  const router = useRouter();
  const dispatch = useDispatch();
  const { token } = useSelector(state => state.auth);

  const [incomingCall, setIncomingCall] = useState(null); // { from, offer, callerInfo }

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
        if (token) {
          socket.auth = { ...socket.auth, token };
          socket.connect();
        } else {
          // Trigger a silent refresh if no token in memory
          handleConnectError({ message: "Initial auth check", silent: true });
        }
      } else {
        handleConnect();
      }
    };

    const handleConnectError = async (error) => {
      const isTokenExpired = error.message.includes("TokenExpiredError");
      const isInitialAuth = error.silent || error.message === "Initial auth check";
      
      if (!isTokenExpired && !isInitialAuth) {
        console.error("Status: [Socket] Connection error:", error.message);
      } else if (isTokenExpired) {
        console.log("Status: [Socket] Token expired, initiating silent refresh...");
      }
      
      // Handle refresh for both expiration and missing initial token
      if (isTokenExpired || isInitialAuth || error.message.includes("Authentication error")) {
        if (!isInitialAuth) console.log("Token invalid or expired, attempting refresh...");
        try {
          const res = await fetch("/api/auth/refresh", { method: "POST" });
          const data = await res.json();
          
          if (data.success && data.accessToken) {
            console.log("Status: [Socket] Token refreshed successfully");
            dispatch(setToken(data.accessToken));
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

    const handleCallIncoming = async ({ from, offer }) => {
      console.log("Status: [Socket] Incoming call from:", from);
      
      // If we are already on a call page, we might want to auto-decline or handle differently
      if (pathnameRef.current.includes("/callroom/")) return;

      try {
        const res = await fetch(`/api/auth/home/${id}/chatt/personalchatt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ chatid: from }),
        });
        const data = await res.json();
        
        setIncomingCall({ 
          from, 
          offer, 
          callerInfo: data.success ? data.userData : { username: "Unknown User" } 
        });

        // Play a ringtone logic could go here
      } catch (err) {
        console.error("Error fetching caller info:", err);
        setIncomingCall({ from, offer, callerInfo: { username: "Unknown User" } });
      }
    };

    const handleCallDeclinedByOther = ({ by }) => {
      toast.error("Call declined");
      // If we are on the call room page, we might want to navigate back
      if (pathnameRef.current.includes(`/callroom/${by}`)) {
        router.back();
      }
    };

    socket.on("incoming-call", handleCallIncoming);
    socket.on("call-declined", handleCallDeclinedByOther);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("connect_error", handleConnectError);
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("receiveGroupMessage", handleReceiveGroupMessage);
      socket.off("incoming-call", handleCallIncoming);
      socket.off("call-declined", handleCallDeclinedByOther);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [id, queryClient, router]); // Removed params from dependencies

  const acceptCall = () => {
    if (!incomingCall) return;
    const { from } = incomingCall;
    // We navigate to the call room. The CallPage will handle the socket listener. 
    // we need to make sure CallPage can still see the offer.
    // For now, let's just navigate. We will modify CallPage to check for existing offers.
    
    router.push(`/home/${id}/callroom/${from}`);
    setIncomingCall(null);
  };

  const declineCall = () => {
    if (!incomingCall) return;
    socket.emit("decline-call", { to: incomingCall.from });
    setIncomingCall(null);
  };

  return (
    <>
      {children}
      {incomingCall && (
        <IncomingCallModal 
          caller={incomingCall.callerInfo} 
          onAccept={acceptCall} 
          onDecline={declineCall} 
        />
      )}
    </>
  );
}

"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Phone, Video, MoreHorizontal, Check, CheckCheck, ChevronLeft } from "lucide-react";

export default function ChatPage() {
  const { id, chatid } = useParams();
  const currentUserId = id;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOld, setLoadingOld] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [userInfo, setUserInfo] = useState({ username: "", image: "" });

  const bottomRef = useRef(null);
  const shouldScrollRef = useRef(true);
  const longPressTimer = useRef(null);

  // Fetch last messages and user info
  useEffect(() => {
    const fetchMessages = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/messages/${currentUserId}/${chatid}`);
      const data = await res.json();
      setMessages(data);
      if (data && data.length < 20) setHasMore(false);
      shouldScrollRef.current = true;
      console.log("Chat messages fetched:", data?.length || 0);
    };

    const fetchUserInfo = async () => {
      const res = await fetch(`/api/auth/home/${id}/chatt/personalchatt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatid }),
      });
      const data = await res.json();
      console.log("user info in fromtt is", data);
      if (data.success) {
        setUserInfo({
          username: data.userData.username,
          image: data.userData.image,
        });
      }
    };

    const initializeChat = async () => {
      console.log("Initializing chat with:", { currentUserId, chatid });
      if (!currentUserId || !chatid || currentUserId === "undefined" || chatid === "undefined") {
        console.warn("Missing IDs for chat initialization");
        return;
      }
      await Promise.all([
        fetchMessages(),
        fetchUserInfo()
      ]);
    };

    if (id && chatid) {
      initializeChat();
    }
  }, [currentUserId, chatid, id]);

  console.log("user info in fromtt is", userInfo);

  // Socket listeners
  useEffect(() => {
    const handleReceive = (data) => {
      setMessages((prev) => [...prev, data]);
      shouldScrollRef.current = true;
    };
    const handleSeen = ({ by }) => {
      if (by === chatid) {
        setMessages((prev) =>
          prev.map((m) =>
            m.from === currentUserId ? { ...m, isSeen: true } : m,
          ),
        );
      }
    };
    const handleDeleted = (messageId) => {
      setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
    };

    socket.on("receiveMessage", handleReceive);
    socket.on("messageSeen", handleSeen);
    socket.on("messageDeleted", handleDeleted);

    // mark messages seen
    socket.emit("markSeen", { otherId: chatid });

    // reset unread count
    queryClient.setQueryData(["friends", currentUserId], (old = []) =>
      old.map((user) =>
        user._id === chatid ? { ...user, unreadCount: 0 } : user,
      ),
    );

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messageSeen", handleSeen);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [chatid, currentUserId, queryClient]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", {
      to: chatid,
      message,
    });
    shouldScrollRef.current = true;
    setMessage("");
  };

  const fetchOldMessages = async () => {
    if (!messages.length || !hasMore || loadingOld) return;
    setLoadingOld(true);
    const oldest = messages[0].createdAt;
    const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "");
    const res = await fetch(
      `${baseUrl}/message/${currentUserId}/${chatid}/before/${oldest}`,
    );
    const data = await res.json();
    if (!data.length) setHasMore(false);
    else setMessages((prev) => [...data, ...prev]);
    setLoadingOld(false);
    shouldScrollRef.current = false;
  };

  // Auto scroll to bottom (only for new messages)
  useEffect(() => {
    if (shouldScrollRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }
  }, [messages]);

  // Open menu
  const openMenu = (msg) => setActiveMessage(msg._id);

  // Long press (mobile)
  const handleTouchStart = (msg) => {
    longPressTimer.current = setTimeout(() => openMenu(msg), 500);
  };
  const handleTouchEnd = () => clearTimeout(longPressTimer.current);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".message-bubble")) setActiveMessage(null);
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const handleProfile = () => {
    router.push(`/home/${id}/profile/${userInfo.username}`);
  };

  const handleCall = () => {
    router.push(`/home/${id}/callroom/${chatid}`)
  }
  return (
    <div className="flex flex-col h-full bg-black text-white">

      {/* Header */}
      <div className="p-3 border-b border-gray-800 flex items-center gap-3 sticky top-0 bg-black/80 backdrop-blur-md z-50">
        <button onClick={() => router.back()} className="md:hidden">
          <ChevronLeft size={24} />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-800 border border-gray-700 cursor-pointer shrink-0" onClick={handleProfile}>
          {userInfo?.image ? (
            <Image src={userInfo.image} width={40} height={40} alt={userInfo.username} className="object-cover w-full h-full" />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-sm font-bold text-gray-400">
              {userInfo.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm truncate">{userInfo.username || "Chat"}</p>
          <p className="text-[10px] text-green-500 font-medium">Online</p>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleCall} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <Phone size={20} className="text-gray-300" />
          </button>
          <button onClick={handleCall} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <Video size={20} className="text-gray-300" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <MoreHorizontal size={20} className="text-gray-300" />
          </button>
        </div>
      </div>

      {/* Loading older messages */}
      {loadingOld && (
        <div className="text-center text-gray-400 text-sm py-2">
          Loading older messages...
        </div>
      )}

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 pb-28 no-scrollbar"
        onScroll={(e) => e.target.scrollTop < 50 && fetchOldMessages()}
      >
        {messages.map((msg, i) => {
          // Check if 'from' is current user ID (handles both String and Array from your model)
          const isMe = (Array.isArray(msg.from) ? msg.from[0] : msg.from)?.toString() === currentUserId?.toString();
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative message-bubble max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words 
                ${isMe
                    ? "bg-white text-black rounded-br-sm"
                    : "bg-gray-800 text-white rounded-bl-sm"
                  }`}
                onClick={() => openMenu(msg)}
                onTouchStart={() => handleTouchStart(msg)}
                onTouchEnd={handleTouchEnd}
              >
                <p className="leading-relaxed">{msg.message}</p>

                {/* Seen check */}
                {isMe && (
                  <div className="flex justify-end mt-1 -mr-1">
                    {msg.isSeen ? (
                      <CheckCheck size={14} className="text-blue-500" />
                    ) : (
                      <Check size={14} className="text-gray-500" />
                    )}
                  </div>
                )}

                {/* Popup menu inside message */}
                {activeMessage === msg._id && (
                  <div
                    className={`absolute ${isMe ? "right-2" : "left-2"
                      } top-1/2 transform -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-40`}
                  >
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(msg.message);
                        setActiveMessage(null);
                      }}
                      className="block px-4 py-2 text-sm hover:bg-gray-800 w-full text-left text-white"
                    >
                      Copy
                    </button>

                    <button
                      onClick={() => {
                        console.log("reply message", msg);
                        setActiveMessage(null);
                      }}
                      className="block px-4 py-2 text-sm hover:bg-gray-800 w-full text-left text-white"
                    >
                      Reply
                    </button>

                    {isMe && (
                      <button
                        onClick={() => {
                          socket.emit("deleteMessage", {
                            messageId: msg._id,
                          });
                          setActiveMessage(null);
                        }}
                        className="block px-4 py-2 text-sm text-red-500 hover:bg-gray-800 w-full text-left"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef}></div>
      </div>

      {/* Input area */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-black/90 backdrop-blur-md border-t border-gray-800 p-4 pt-2">
        <div className="flex items-center gap-3 max-w-4xl mx-auto bg-gray-900 border border-gray-800 rounded-2xl px-4 py-1.5 shadow-2xl">
          <input
            className="flex-1 bg-transparent border-none py-2 text-sm outline-none placeholder:text-gray-600"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            className="text-blue-500 font-bold text-sm hover:text-blue-400 active:scale-95 transition-all disabled:text-gray-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

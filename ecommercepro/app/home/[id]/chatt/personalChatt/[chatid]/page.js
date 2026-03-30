"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import socket from "@/lib/socket";
import { useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

export default function ChatPage() {
  const { id, chatid } = useParams();
  const currentUserId = id;
  const queryClient = useQueryClient();
  const router = useRouter();

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [hasMore, setHaseMore] = useState(true);
  const [loadingOld, setLoadingOld] = useState(false);
  const [activeMessage, setActiveMessage] = useState(null);
  const [userInfo, setUserInfo] = useState({ username: "", image: "" });

  const bottomRef = useRef(null);
  const longPressTimer = useRef(null);

  // Fetch last messages and user info
  useEffect(() => {
    const fetchMessages = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "");
      const res = await fetch(`${baseUrl}/messages/${currentUserId}/${chatid}`);
      const data = await res.json();
      setMessages(data);
      if (data.length < 20) setHaseMore(false);
    };

    const fetchUserInfo = async () => {
      const res = await fetch(`/api/auth/home/${id}/chatt/personalchatt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatid }),
      });
      const data = await res.json();
      if (data.success) {
        setUserInfo({
          username: data.userData.username,
          image: data.userData.image,
        });
      }
    };

    if (currentUserId && chatid) {
      fetchMessages();
      fetchUserInfo();
    }
  }, [currentUserId, chatid, id]);

  console.log("user info in fromtt is", userInfo);

  // Socket listeners
  useEffect(() => {
    const handleReceive = (data) => setMessages((prev) => [...prev, data]);
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
    socket.on("messagesSeen", handleSeen);
    socket.on("messageDeleted", handleDeleted);

    // mark messages seen
    socket.emit("markSeen", { myId: currentUserId, otherId: chatid });

    // reset unread count
    queryClient.setQueryData(["friends", currentUserId], (old = []) =>
      old.map((user) =>
        user._id === chatid ? { ...user, unreadCount: 0 } : user,
      ),
    );

    return () => {
      socket.off("receiveMessage", handleReceive);
      socket.off("messagesSeen", handleSeen);
      socket.off("messageDeleted", handleDeleted);
    };
  }, [chatid, currentUserId, queryClient]);

  const sendMessage = () => {
    if (!message.trim()) return;
    socket.emit("sendMessage", {
      from: currentUserId,
      to: chatid,
      message,
    });
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
    if (!data.length) setHaseMore(false);
    else setMessages((prev) => [...data, ...prev]);
    setLoadingOld(false);
  };

  // Auto scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "auto" });
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
  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div
        className="p-3 border-b border-gray-800 flex items-center gap-3"
        onClick={handleProfile}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-700">
          {userInfo?.image ? (
            <Image
              src={userInfo.image}
              width={300}
              height={300}
              alt={userInfo.username}
              className="object-cover w-full h-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-sm text-gray-300">
              {userInfo.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <p className="font-semibold">{userInfo.username || "Chat"}</p>
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
          const isMe = msg.from === currentUserId;
          return (
            <div
              key={i}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative message-bubble max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words 
                ${
                  isMe
                    ? "bg-white text-black rounded-br-sm"
                    : "bg-gray-800 text-white rounded-bl-sm"
                }`}
                onClick={() => openMenu(msg)}
                onTouchStart={() => handleTouchStart(msg)}
                onTouchEnd={handleTouchEnd}
              >
                {msg.message}

                {/* Seen check */}
                {isMe && (
                  <span className="text-xs opacity-50 ml-2">
                    {msg.isSeen ? (
                      <span className="text-blue-800">✔</span>
                    ) : (
                      <span className="text-red-800">✔</span>
                    )}
                  </span>
                )}

                {/* Popup menu inside message */}
                {activeMessage === msg._id && (
                  <div
                    className={`absolute ${
                      isMe ? "right-2" : "left-2"
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
                            from: currentUserId,
                            to: chatid,
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

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 md:right-0 bg-black border-t border-gray-800 p-3 flex gap-2">
        <input
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 outline-none"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="bg-white text-black px-4 rounded-xl font-medium active:scale-95 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
}

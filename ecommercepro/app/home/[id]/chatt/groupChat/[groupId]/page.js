"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import socket from "@/lib/socket";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";

export default function GroupChatPage() {
    const { id, groupId } = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [groupInfo, setGroupInfo] = useState(null);
    const [members, setMembers] = useState([]);
    const [activeMessage, setActiveMessage] = useState(null);
    const scrollRef = useRef(null);
    const longPressTimer = useRef(null);

    // 1. Fetch Group Info and Initial Messages
    useEffect(() => {
        const fetchGroupData = async () => {
            try {
                // Fetch group metadata
                const infoRes = await fetch(`/api/auth/home/${id}/chatt/group/${groupId}`);
                const infoData = await infoRes.json();
                if (infoData.success) {
                    setGroupInfo(infoData.group);
                    setMembers(infoData.members);
                }

                // Fetch message history from Server
                const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "");
                const msgRes = await fetch(`${baseUrl}/group-messages/${groupId}`);
                const msgData = await msgRes.json();
                setMessages(msgData || []);

                // Mark as seen
                await fetch(`/api/auth/home/${id}/chatt/group/${groupId}/seen`, { method: "POST" });
                
                // Reset unread count in cache
                queryClient.setQueryData(["friends", id], (old) => {
                    if (!old || !old.groups) return old;
                    return {
                        ...old,
                        groups: old.groups.map(g => 
                            g._id === groupId ? { ...g, unreadCount: 0 } : g
                        )
                    };
                });
            } catch (err) {
                console.error("Error loading group chat:", err);
            }
        };

        fetchGroupData();
    }, [id, groupId, queryClient]);

    // 2. Setup Socket Listeners
    useEffect(() => {
        if (!socket) return;

        const handleReceiveMessage = (message) => {
            if (message.groupId === groupId) {
                setMessages(prev => [...prev, message]);
            }
        };

        const handleDeleted = (messageId) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== messageId));
        };

        socket.on("receiveGroupMessage", handleReceiveMessage);
        socket.on("messageDeleted", handleDeleted);

        return () => {
            socket.off("receiveGroupMessage", handleReceiveMessage);
            socket.off("messageDeleted", handleDeleted);
        };
    }, [groupId]);

    // 3. Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest(".message-bubble")) setActiveMessage(null);
        };
        window.addEventListener("click", handleClickOutside);
        return () => window.removeEventListener("click", handleClickOutside);
    }, []);

    // 4. Scroll to bottom
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        socket.emit("sendGroupMessage", {
            groupId,
            message: newMessage
        });

        setNewMessage("");
    };

    const openMenu = (msg) => setActiveMessage(msg._id);
    const handleTouchStart = (msg) => {
        longPressTimer.current = setTimeout(() => openMenu(msg), 500);
    };
    const handleTouchEnd = () => clearTimeout(longPressTimer.current);

    return (
        <div className="flex flex-col h-screen bg-black text-white">
            {/* Header */}
            <div className="flex items-center gap-4 p-4 border-b border-gray-800 bg-gray-950/50 backdrop-blur-md sticky top-0 z-10">
                <Button variant="ghost" onClick={() => router.back()} className="p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </Button>
                
                <div className="w-10 h-10 rounded-xl overflow-hidden relative bg-purple-900/50 flex items-center justify-center border border-purple-500/30">
                    {groupInfo?.dp ? (
                        <Image src={groupInfo.dp} alt={groupInfo.name} fill className="object-cover" />
                    ) : (
                        <span className="text-purple-400 font-bold">{groupInfo?.name?.charAt(0).toUpperCase()}</span>
                    )}
                </div>

                <div>
                    <h2 className="font-bold text-lg">{groupInfo?.name || "Group Chat"}</h2>
                    <p className="text-xs text-gray-500">{members.length} members</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
                {messages.map((msg, index) => {
                    const isMe = msg.from._id === id || msg.from === id;
                    const sender = typeof msg.from === 'object' ? msg.from : { username: 'User' };
                    
                    return (
                        <div key={msg._id || index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`relative message-bubble max-w-[80%] ${isMe ? 'bg-purple-600' : 'bg-gray-800'} rounded-2xl px-4 py-2 shadow-lg cursor-pointer transition-all active:scale-95`}
                                onClick={() => openMenu(msg)}
                                onTouchStart={() => handleTouchStart(msg)}
                                onTouchEnd={handleTouchEnd}
                            >
                                {!isMe && (
                                    <p className="text-[10px] font-bold text-purple-400 mb-1">{sender.username}</p>
                                )}
                                <p className="text-sm">{msg.message}</p>
                                <p className="text-[9px] text-gray-300/50 mt-1 text-right">
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>

                                {/* Popup menu inside message */}
                                {activeMessage === msg._id && (
                                    <div
                                        className={`absolute ${isMe ? "right-2" : "left-2"
                                            } top-1/2 transform -translate-y-1/2 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-40 overflow-hidden min-w-[120px]`}
                                    >
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(msg.message);
                                                setActiveMessage(null);
                                            }}
                                            className="block px-4 py-2 text-xs hover:bg-gray-800 w-full text-left text-white border-b border-gray-800"
                                        >
                                            Copy
                                        </button>

                                        <button
                                            onClick={() => {
                                                socket.emit("deleteMessage", {
                                                    messageId: msg._id,
                                                    type: "me"
                                                });
                                                setActiveMessage(null);
                                            }}
                                            className="block px-4 py-2 text-xs hover:bg-gray-800 w-full text-left text-white border-b border-gray-800"
                                        >
                                            Delete for me
                                        </button>

                                        {isMe && (
                                            <button
                                                onClick={() => {
                                                    socket.emit("deleteMessage", {
                                                        messageId: msg._id,
                                                        type: "everyone"
                                                    });
                                                    setActiveMessage(null);
                                                }}
                                                className="block px-4 py-2 text-xs text-red-500 hover:bg-gray-800 w-full text-left"
                                            >
                                                Delete for EveryOne
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800 bg-black flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message the group..."
                    className="flex-1 bg-gray-900 border-none rounded-full px-6 py-3 text-sm focus:ring-2 focus:ring-purple-500 transition-all outline-none"
                />
                <Button type="submit" className="rounded-full bg-purple-600 hover:bg-purple-500 px-6">
                    Send
                </Button>
            </form>
        </div>
    );
}

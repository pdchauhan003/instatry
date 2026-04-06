"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle
} from "@/components/ui/sheet";
import { useRouter, useParams } from "next/navigation";

export default function CommentDrawer({ open, setOpen, postId }) {
    const { id } = useParams();
    const router = useRouter();

    const startY = useRef(null);
    const bottomRef = useRef(null);

    const [comment, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [UName, setUName] = useState("");
    const [loading, setLoading] = useState(false);
    const [fetchedPostId, setFetchedPostId] = useState(null); // 🔥 prevent refetch

    // ✅ FETCH COMMENTS ONLY WHEN OPEN
    const fetchComments = useCallback(async () => {
        if (!postId) return;

        // prevent duplicate fetch
        if (fetchedPostId === postId) return;

        try {
            setLoading(true);

            const res = await fetch(`/api/auth/home/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postid: postId }),
            });

            if (!res.ok) return;

            const data = await res.json();

            setComments(data.commentData || []);
            setUName(data.username);
            setFetchedPostId(postId);
        } catch (err) {
            console.log("Error fetching comments", err);
        } finally {
            setLoading(false);
        }
    }, [postId, id, fetchedPostId]);

    // 🔥 TRIGGER ONLY WHEN OPEN
    useEffect(() => {
        if (open) {
            fetchComments();
        }
    }, [open, fetchComments]);

    // auto scroll
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [comments]);

    // ✅ ADD COMMENT
    const handleClick = async () => {
        if (!comment.trim()) return;

        try {
            const res = await fetch(`/api/auth/home/${id}/comments/add`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postid: postId, comment }),
            });

            const data = await res.json();

            if (data.success) {
                setComment("");

                // instant UI update (no refetch needed)
                setComments((prev) => [
                    ...prev,
                    {
                        _id: Date.now(),
                        text: comment,
                        author: {
                            username: UName,
                            image: "" // optional placeholder
                        }
                    }
                ]);
            }
        } catch (err) {
            console.log("Error adding comment", err);
        }
    };

    // PROFILE NAV
    const handleProfile = (username) => {
        if (username === UName) {
            router.push(`/home/${id}/profile/`);
        } else {
            router.push(`/home/${id}/profile/${username}`);
        }
    };

    // TOUCH DRAG CLOSE
    const handleTouchStart = (e) => {
        startY.current = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
        if (!startY.current) return;

        const diff = e.touches[0].clientY - startY.current;

        if (diff > 100) {
            setOpen(false);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent
                side="bottom"
                className="h-[90vh] rounded-t-2xl p-0 bg-black text-white flex flex-col"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
            >
                {/* Drag Indicator */}
                <div className="w-12 h-1.5 bg-gray-500 rounded-full mx-auto my-3" />

                {/* Header */}
                <SheetHeader>
                    <SheetTitle className="text-center">Comments</SheetTitle>
                </SheetHeader>

                {/* COMMENTS */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <p className="text-center text-gray-400">Loading...</p>
                    ) : comments.length === 0 ? (
                        <p className="text-center text-gray-500">No comments yet</p>
                    ) : (
                        comments.map((i) => (
                            <div
                                key={i._id}
                                className="flex gap-3 cursor-pointer"
                                onClick={() => handleProfile(i.author.username)}
                            >
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-700">
                                    {i.author.image && (
                                        <Image
                                            src={i.author.image}
                                            alt={i.author.username}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                {/* Text */}
                                <div>
                                    <p className="font-semibold text-sm">
                                        {i.author.username}
                                    </p>
                                    <p className="text-sm text-gray-300">{i.text}</p>
                                </div>
                            </div>
                        ))
                    )}

                    <div ref={bottomRef}></div>
                </div>

                {/* INPUT */}
                <div className="border-t border-gray-800 p-3 flex gap-2">
                    <input
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-900 border border-gray-700 rounded-full px-4 py-2 text-sm outline-none"
                    />
                    <button
                        onClick={handleClick}
                        className="text-blue-500 font-semibold"
                    >
                        Post
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
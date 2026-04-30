"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useRouter, useParams } from "next/navigation";
import {MoreVertical} from 'lucide-react';

export default function CommentDrawer({ open, setOpen, postId }) {
  const { id } = useParams();
  const router = useRouter();

  const startY = useRef(null);
  const scrollRef = useRef(null);
  const didInitialScrollRef = useRef(false);
  const shouldScrollToBottomRef = useRef(false);
  const pendingPrependAdjustRef = useRef(null);

  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [UName, setUName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [cursor, setCursor] = useState(null);
  const [openMenuCommentId, setOpenMenuCommentId] = useState(null);

  // fetch comments
  const fetchInitialComments = useCallback(async () => {
    if (!postId || !open) return;
    try {
      setLoading(true);
      setComments([]);
      setCursor(null);
      setHasMore(false);
      didInitialScrollRef.current = false;

      const res = await fetch(`/api/auth/home/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postid: postId, limit: 15, cursor: null }),
      });

      if (!res.ok) return;

      const data = await res.json();

      setComments(data.commentData || []);
      setUName(data.username);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor ?? null);
      shouldScrollToBottomRef.current = true;
    } catch (err) {
      console.log("Error fetching comments", err);
    } finally {
      setLoading(false);
    }
  }, [postId, id, open]);

  useEffect(() => {
    fetchInitialComments();
  }, [fetchInitialComments]);

  const fetchMoreComments = useCallback(async () => {
    if (!postId || !open) return;
    if (!hasMore || loadingMore) return;
    if (!cursor?.createdAt || !cursor?._id) return;

    try {
      const el = scrollRef.current;
      if (el) {
        pendingPrependAdjustRef.current = {
          prevScrollHeight: el.scrollHeight,
          prevScrollTop: el.scrollTop,
        };
      }
      setLoadingMore(true);
      const res = await fetch(`/api/auth/home/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postid: postId, limit: 10, cursor }),
      });

      if (!res.ok) return;
      const data = await res.json();
      const nextBatch = data.commentData || [];

      setComments((prev) => [...prev, ...nextBatch]);
      setHasMore(Boolean(data.hasMore));
      setCursor(data.nextCursor ?? null);
    } catch (err) {
      console.log("Error fetching more comments", err);
    } finally {
      setLoadingMore(false);
    }
  }, [postId, open, hasMore, loadingMore, cursor, id]);

  // Instagram-like behavior:
  // - show newest at bottom
  // - load older when you scroll to top
  // - keep scroll position stable when older comments are prepended visually
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const pending = pendingPrependAdjustRef.current;
    if (pending) {
      pendingPrependAdjustRef.current = null;
      const delta = el.scrollHeight - pending.prevScrollHeight;
      el.scrollTop = pending.prevScrollTop + delta;
      return;
    }

    if (
      shouldScrollToBottomRef.current &&
      !loading &&
      comments.length > 0 &&
      !didInitialScrollRef.current
    ) {
      didInitialScrollRef.current = true;
      shouldScrollToBottomRef.current = false;
      el.scrollTop = el.scrollHeight;
    }
  }, [comments, loading]);

  // add comment
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
        const newComment = data.comment;
        if (newComment?._id) {
          setComments((prev) => [newComment, ...prev]);
        }

        // keep the user at the latest comment (bottom)
        shouldScrollToBottomRef.current = true;
        didInitialScrollRef.current = false;
      }
    } catch (err) {
      console.log("Error adding comment", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      if (!commentId) return;
      setOpenMenuCommentId(null);

      const res = await fetch(`/api/auth/home/${id}/comments/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, postid: postId }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        alert(data?.message || "Failed to delete comment");
        return;
      }

      setComments((prev) => prev.filter((c) => String(c._id) !== String(commentId)));
    } catch (error) {
      console.log("error in delete comment", error);
      alert("error in delete comment");
    }
  };

  // profile nav
  const handleProfile = (username) => {
    if (username === UName) {
      router.push(`/home/${id}/profile/`);
    } else {
      router.push(`/home/${id}/profile/${username}`);
    }
  };

  // drag logic
  const handleTouchStart = (e) => {
    startY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    if (!startY.current) return;

    const diff = e.touches[0].clientY - startY.current;

    // ❗ Only close if scroll is at top
    if (scrollRef.current && scrollRef.current.scrollTop > 0) return;

    if (diff > 100) {
      setOpen(false);
    }
  };

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const nearTop = el.scrollTop <= 200;
    if (nearTop) fetchMoreComments();
  }, [fetchMoreComments]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="bottom"
        className="h-[75vh] max-h-[75vh] overflow-hidden rounded-t-2xl p-0 bg-black text-white flex flex-col touch-pan-y"
      >
        {/* header  */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          className="w-full pb-2 cursor-grab"
        >
          <div className="w-12 h-1.5 bg-gray-500 rounded-full mx-auto mt-3 mb-2" />

          <SheetHeader>
            <SheetTitle className="text-center">Comments</SheetTitle>
          </SheetHeader>
        </div>

        {/* only scrollable area */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-3 overscroll-contain scrollbar-hide"
        >
          {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
          ) : comments.length === 0 ? (
            <p className="text-center text-gray-500">No comments yet</p>
          ) : (
            [...comments].reverse().map((i) => (
              <div key={i._id} className="flex gap-3">
                <div
                  className="flex gap-3 flex-1 cursor-pointer"
                  onClick={() => handleProfile(i.author.username)}
                >
                  {/* avatar */}
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

                  {/* text */}
                  <div>
                    <p className="font-semibold text-sm">
                      {i.author.username}
                    </p>
                    <p className="text-sm text-gray-300">{i.text}</p>
                  </div>
                </div>

                {/* 3 dots menu (only show delete for own comment) */}
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuCommentId((prev) =>
                        prev === String(i._id) ? null : String(i._id)
                      );
                    }}
                    className="p-1"
                    aria-label="Comment menu"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {openMenuCommentId === String(i._id) && (
                    <div className="absolute z-10 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-md text-sm w-32 overflow-hidden">
                      {String(i.author?._id) === String(id) && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteComment(i._id);
                          }}
                          className="block w-full text-left px-3 py-2 hover:bg-gray-800"
                        >
                          Delete
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuCommentId(null);
                        }}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-800"
                      >
                        Reply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}

          {loadingMore && (
            <p className="text-center text-gray-500 text-sm">Loading more...</p>
          )}
          {!loading && !loadingMore && comments.length > 0 && !hasMore && (
            <p className="text-center text-gray-600 text-xs">No more comments</p>
          )}
        </div>

        {/* fixed input */}
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

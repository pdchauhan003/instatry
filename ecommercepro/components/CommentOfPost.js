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
import { MoreVertical } from 'lucide-react';
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function CommentDrawer({ open, setOpen, postId }) {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  const startY = useRef(null);
  const scrollRef = useRef(null);
  const didInitialScrollRef = useRef(false);
  const shouldScrollToBottomRef = useRef(false);
  const pendingPrependAdjustRef = useRef(null);

  const [comment, setComment] = useState(""); // new comment text
  const [openMenuCommentId, setOpenMenuCommentId] = useState(null);

  // TanStack Query for fetching comments
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: loading,
  } = useInfiniteQuery({
    queryKey: ["comments", postId],
    queryFn: async ({ pageParam = null }) => {
      if (!postId || !open) return { commentData: [], hasMore: false };
      const res = await fetch(`/api/auth/home/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postid: postId, limit: 15, cursor: pageParam }),
      });
      if (!res.ok) throw new Error("Failed to fetch comments");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    enabled: open && !!postId,
    staleTime: 1000 * 60 * 2,
  });

  const comments = data?.pages.flatMap((page) => page.commentData) || [];
  const UName = data?.pages[0]?.username || "";

  // Mutation for adding a comment
  const addCommentMutation = useMutation({
    mutationFn: async (text) => {
      const res = await fetch(`/api/auth/home/${id}/comments/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postid: postId, comment: text }),
      });
      if (!res.ok) throw new Error("Failed to add comment");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setComment("");
        queryClient.invalidateQueries({ queryKey: ["comments", postId] });
        shouldScrollToBottomRef.current = true;
        didInitialScrollRef.current = false;
      }
    },
  });

  // Mutation for deleting a comment
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId) => {
      const res = await fetch(`/api/auth/home/${id}/comments/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId, postid: postId }),
      });
      if (!res.ok) throw new Error("Failed to delete comment");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      setOpenMenuCommentId(null);
    },
  });

  const handleClick = () => {
    if (!comment.trim() || addCommentMutation.isLoading) return;
    addCommentMutation.mutate(comment);
  };

  const handleDeleteComment = (commentId) => {
    if (!commentId || deleteCommentMutation.isLoading) return;
    deleteCommentMutation.mutate(commentId);
  };

  // profile
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
    if (nearTop && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

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

          {isFetchingNextPage && (
            <p className="text-center text-gray-500 text-sm">Loading more...</p>
          )}
          {!loading && !isFetchingNextPage && comments.length > 0 && !hasNextPage && (
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

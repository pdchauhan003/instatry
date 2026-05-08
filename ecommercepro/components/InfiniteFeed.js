"use client";

import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import PostCard from "./PostCard";

export default function InfiniteFeed({
  initialPosts,
  nextCursor,
  userId,
  savedIds,
  UName,
}) {
  const bottomRef = useRef(null);
  //tanstack query for data caching of posts 
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery({
    queryKey: ["feed", userId],
    queryFn: async ({ pageParam = null }) => {
      const res = await fetch(`/api/auth/feed?userId=${userId}${pageParam ? `&cursor=${pageParam}` : ""}`);
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    },
    getNextPageParam: (lastPage) => lastPage.nextCursor || undefined,
    initialData: {
      pages: [{ posts: initialPosts, nextCursor: nextCursor }],
      pageParams: [null],
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: "400px" } // Load earlier for smoother experience
    );

    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages of posts
  const allPosts = data?.pages.flatMap((page) => page.posts) || [];

  return (
    <>
      {allPosts.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          userId={userId}
          pid={post._id}
          UName={UName}
          id={userId}
          savedIds={savedIds}
          isSaved={savedIds instanceof Set ? savedIds.has(post._id.toString()) : Array.isArray(savedIds) && savedIds.includes(post._id.toString())}
        />
      ))}

      {/* loader */}
      <div ref={bottomRef} className="h-20 flex justify-center items-center">
        {(isFetchingNextPage || status === "loading") && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-gray-500">Loading more posts...</p>
          </div>
        )}
        {!hasNextPage && allPosts.length > 0 && (
          <p className="text-xs text-gray-500">load more</p>
        )}
      </div>
    </>
  );
}

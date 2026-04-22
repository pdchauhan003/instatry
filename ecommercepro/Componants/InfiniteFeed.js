"use client";

import { useEffect, useRef, useState } from "react";
import PostCard from "./PostCard";

export default function InfiniteFeed({
  initialPosts,
  nextCursor,
  userId,
  savedIds,
  UName,
}) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [cursor, setCursor] = useState(nextCursor);
  const [loading, setLoading] = useState(false);

  const bottomRef = useRef(null);

  const loadMore = async () => {
    if (!cursor || loading) return;
    setLoading(true);
    const res = await fetch(`/api/auth/feed?userId=${userId}&cursor=${cursor}`);
    const data = await res.json();
    setPosts((prev) => {
      const existingIds = new Set(prev.map((p) => p._id));
      const newPosts = data.posts.filter((p) => !existingIds.has(p._id));
      return [...prev, ...newPosts];
    });
    setCursor(data.nextCursor);
    setLoading(false);
  };

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { rootMargin: "200px" }
  );

  if (bottomRef.current) observer.observe(bottomRef.current);

  return () => observer.disconnect();
}, []);

  return (
    <>
      {posts?.map((post) => (
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
        {loading && <p>Loading...</p>}
      </div>
    </>
  );
}

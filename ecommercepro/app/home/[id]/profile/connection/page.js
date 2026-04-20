"use client";

import { useState } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import FollowerFeed from "@/Componants/FollowerFeed";
import FollowingFeed from "@/Componants/FollowingFeed";

export default function ConnectionsPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialTab = searchParams.get("tab") === "following" ? 1 : 0;
  const [tab, setTab] = useState(initialTab);

  // swipe handler
  const handleDragEnd = (event, info) => {
    if (info.offset.x < -50) {
      setTab(1); // swipe left
    } else if (info.offset.x > 50) {
      setTab(0); // swipe right
    }
  };

  return (
    <div className="max-w-xl mx-auto min-h-screen bg-black text-white">
      
      {/* header */}
      <div className="flex items-center p-4 border-b border-gray-700">
        <button onClick={() => router.back()} className="mr-4">⬅</button>
        <h1 className="text-lg font-semibold">
          {tab === 0 ? "Followers" : "Following"}
        </h1>
      </div>

      {/* tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setTab(0)}
          className={`flex-1 p-3 ${tab === 0 ? "border-b-2 border-white font-bold" : ""}`}
        >
          Followers
        </button>

        <button
          onClick={() => setTab(1)}
          className={`flex-1 p-3 ${tab === 1 ? "border-b-2 border-white font-bold" : ""}`}
        >
          Following
        </button>
      </div>

      {/* swipe container */}
      <motion.div
        className="flex w-full"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
      >
        {tab === 0 ? (
          <FollowerFeed id={id} />
        ) : (
          <FollowingFeed id={id} />
        )}
      </motion.div>
    </div>
  );
}
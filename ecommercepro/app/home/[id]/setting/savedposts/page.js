import { getSavedPosts } from "@/controller/post&story.controller";
import PostCard from "@/Componants/PostCard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";

export default async function SavedPage(context) {
  const params = await context.params;
  const id = params.id;
  const savedPosts = await getSavedPosts(id);
  const savedIds = new Set(savedPosts.map(p => p.post._id.toString()))

  return (
    <div className="min-h-screen flex justify-center bg-black text-white">
      <div className="w-full max-w-xl border-x border-gray-900 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-800 px-4 py-4 flex items-center gap-4">
          <Link 
            href={`/home/${id}/setting`}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </Link>
          <h1 className="text-lg font-bold">Saved posts</h1>
        </div>
        {/* Posts */}
        <div className="px-2">
          {savedPosts.length === 0 && (
            <p className="text-center text-gray-400 mt-10">
              No saved posts
            </p>
          )}
          {savedPosts.map((item) => (
            <PostCard
              key={item.post._id}
              post={item.post}
              userId={id}
              pid={item.post._id}
              isSaved={savedIds.has(item.post._id.toString())}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
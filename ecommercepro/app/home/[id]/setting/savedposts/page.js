import { getSavedPosts } from "@/controller/post&story.controller";
import Image from "next/image";
import PostCard from "@/Componants/PostCard";
// import { useParams } from "next/navigation";
export default async function SavedPage(context) {
  const params=await context.params;
  const id=params.id;
  const savedPosts = await getSavedPosts(id);
  const savedIds = new Set(savedPosts.map(p => p.post._id.toString()))
  return (
    <div className="min-h-screen flex justify-center bg-black text-white">
      <div className="w-full max-w-xl border-x border-gray-800">
        {/* Navbar */}
        <div className="px-4 py-3 border-b border-gray-800">
          <h1 className="text-lg font-semibold">Saved Posts</h1>
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
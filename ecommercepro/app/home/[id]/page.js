import { allFriends } from "@/controller/post&story.controller";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Plus, Heart } from "lucide-react";
import StoryAvatar from "@/Componants/StoryPart";
import { getUserNameUsingId } from "@/controller/user.controller";
import InfiniteFeed from "@/Componants/InfiniteFeed";

async function gethomeData(id, cursor) {
  return await allFriends(id, cursor);
}
export default async function homePage(context) {
  const params = await context.params;
  const searchParams=await context.searchParams;
  const id = params.id;
  console.log('id in home page is',id)
  const cursor = searchParams?.cursor || null;
  const data = await gethomeData(id, cursor);
  const UName = await getUserNameUsingId(id);
  if (!data) return notFound();
  const { user, posts, stories, savedIds, nextCursor } = data;
  return (
    <div className="min-h-screen flex justify-center bg-black text-white">
      <div className="w-full max-w-xl border-x border-gray-800">
        {/* navbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <a href={`/home/${id}/addpost`} className="p-2 rounded-full border border-gray-700 hover:bg-gray-800">
            <Plus size={20} />
          </a>
          <h1 className="font-serif text-lg">Instagram</h1>
          <a href={`/home/${id}/notification`} className="p-2 rounded-full border border-gray-700 hover:bg-gray-800">
            <Heart size={20} />
          </a>
        </div>

        {/* stories */}
        <div className="flex gap-4 overflow-x-auto px-4 py-4 border-b border-gray-800">
          <div className="flex flex-col items-center">
            {user?.image && (
              <Image src={user.image} width={300} height={300} className="w-16 h-16 rounded-full border-2"alt="story"/>
            )}
            <p className="text-xs mt-1">Your Story</p>
          </div>
          {stories?.map((story) => (
            <StoryAvatar key={story._id} story={story} userId={id}/>
          ))}
        </div>

        {/* posts */}
        <div className="px-2">
          <InfiniteFeed
            initialPosts={posts}
            nextCursor={nextCursor}
            userId={id}
            savedIds={savedIds}
            UName={UName}
          />
        </div>
      </div>
    </div>
  );
}
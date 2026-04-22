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

  const myStory = stories?.find(s => String(s.author._id) === String(id));
  const otherStories = stories?.filter(s => String(s.author._id) !== String(id));

  return (
    <div className="min-h-screen flex justify-center bg-black text-white">
      <div className="w-full max-w-xl border-x border-gray-800">
        {/* navbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
          <a href={`/home/${id}/addpost`} className="p-2 rounded-full border border-gray-700 hover:bg-gray-800 transition-all active:scale-95">
            <Plus size={20} />
          </a>
          <h1 className="text-xl font-bold font-serif tracking-tight">Instagram</h1>
          <a href={`/home/${id}/notification`} className="p-2 rounded-full border border-gray-700 hover:bg-gray-800 transition-all active:scale-95">
            <Heart size={20} />
          </a>
        </div>

        {/* stories side tray */}
        <div className="flex gap-4 overflow-x-auto px-4 py-4 border-b border-gray-800 no-scrollbar overscroll-x-contain items-start">
          {/* Your Story Badge */}
          <div className="flex flex-col items-center gap-1 cursor-pointer group shrink-0">
            <a href={myStory ? `/home/${id}/story/${id}` : `/home/${id}/addpost`} className="relative p-[2px] rounded-full transition-transform active:scale-95 duration-200">
              <div className={`p-[2px] ${myStory ? 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' : 'bg-gray-800'} rounded-full`}>
                <div className="p-[2px] bg-black rounded-full overflow-hidden">
                  {user?.image ? (
                    <Image 
                      src={user.image} 
                      width={64} 
                      height={64} 
                      className={`w-14 h-14 rounded-full object-cover transition-all ${!myStory && 'grayscale opacity-70'}`} 
                      alt="your story"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center text-xs text-gray-500 font-bold">
                      {UName?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              {!myStory && (
                <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-[2px] border-2 border-black text-white shadow-lg">
                  <Plus size={12} strokeWidth={4} />
                </div>
              )}
            </a>
            <p className="text-[10px] text-gray-300 font-medium truncate w-16 text-center">Your Story</p>
          </div>

          {otherStories?.map((story) => (
            <div key={story._id} className="shrink-0">
              <StoryAvatar story={story} userId={id}/>
            </div>
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
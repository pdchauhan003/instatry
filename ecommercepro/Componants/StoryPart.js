"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export default function StoryAvatar({ story, userId }) {
  const router = useRouter();

  const openStory = () => {
    router.push(`/home/${userId}/story/${story.author._id}`);
  };

  return (
    <div
      className="flex flex-col items-center gap-1 cursor-pointer group"
      onClick={openStory}
    >
      <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 transition-transform active:scale-95 duration-200">
        <div className="p-[2px] bg-black rounded-full overflow-hidden">
          {story?.author?.image ? (
            <Image
              src={story.author.image}
              width={64}
              height={64}
              className="w-14 h-14 rounded-full object-cover"
              alt={story.author.username}
              loading="lazy"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gray-800 flex items-center justify-center text-xs text-gray-500">
              {story.author.username?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-300 group-hover:text-white transition-colors truncate w-16 text-center">
        {story?.author?.username}
      </p>
    </div>
  );
}
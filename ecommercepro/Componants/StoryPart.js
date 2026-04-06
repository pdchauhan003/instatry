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
      className="flex flex-col items-center cursor-pointer"
      onClick={openStory}
    >
      {story?.author?.image && (
        <Image
          src={story.author.image}
          width={64}
          height={64}
          className="w-16 h-16 rounded-full border-2 border-pink-500 object-cover"
          alt="story"
          loading="lazy"
        />
      )}
      <p className="text-xs mt-1">{story?.author?.username}</p>
    </div>
  );
}
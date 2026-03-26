import Image from "next/image";
import { allFriends } from "@/controller/post&story.controller";
import { notFound } from "next/navigation";

async function getStoryData(id, storyUserId) {
  const data = await allFriends(id);
  if (!data) return null;

  const safeStories = JSON.parse(JSON.stringify(data.stories));

  return safeStories.find((s) => String(s.author._id) === String(storyUserId));
}

export default async function StoryPage(context) {
  const params = await context.params;
  const id = params.id;
  const fdid = params.fdid;   // friend user_id

  const story = await getStoryData(id, fdid);
  if (!story) return notFound();

  return (
    <div className="h-screen bg-black flex items-center justify-center">
      <div className="w-full max-w-md relative">
        <div className="absolute top-2 left-2 right-2 h-1 bg-gray-700 rounded overflow-hidden">
          <div className="h-1 bg-white animate-[story_5s_linear]"></div>
        </div>

        {story?.story? (
          <Image
            src={story.story}
            width={600}
            height={800}
            className="w-full h-[80vh] object-cover rounded-lg"
            alt="story"
          />
        ) : (
          <div className="w-full h-[80vh] flex items-center justify-center bg-gray-900 rounded-lg">
            <p className="text-gray-400">No story image</p>
          </div>
        )}

        {/* user name and image part */}
        <div className="absolute top-6 left-4 flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700">
            {story?.author?.image ? (
              <Image src={story.author.image} alt={story.author.username} fill
                sizes="40px" className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-gray-300">
                Not image
              </div>
            )}
          </div>

          <p className="text-white font-semibold text-sm">
            {story?.author?.username}
          </p>
        </div>
      </div>
    </div>
  );
}

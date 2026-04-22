import { allFriends } from "@/controller/post&story.controller";
import { notFound } from "next/navigation";
import StoryViewer from "@/Componants/StoryViewer";

async function getStories(id) {
  const data = await allFriends(id);
  if (!data || !data.stories) return [];
  return JSON.parse(JSON.stringify(data.stories));
}

export default async function StoryPage(context) {
  const params = await context.params;
  const id = params.id;
  const fdid = params.fdid;

  const stories = await getStories(id);
  const currentIdx = stories.findIndex((s) => String(s.author._id) === String(fdid));

  if (currentIdx === -1) return notFound();

  return (
    <StoryViewer 
      stories={stories} 
      currentIdx={currentIdx} 
      userId={id} 
    />
  );
}

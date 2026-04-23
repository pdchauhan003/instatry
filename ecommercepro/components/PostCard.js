"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { MoreVertical, Bookmark, Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addPost, removePost } from "@/redux/savedSlice";
import dynamic from "next/dynamic";
const SharePannel = dynamic(() => import("./SharePannel"), { ssr: false });
const CommentDrawer = dynamic(() => import("./CommentOfPost"), { ssr: false });
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PostCard({
  post,
  userId,
  pid,
  UName,
  id,
  savedPosts,
  isSaved,
  savedIds,
}) {
  if (!post) return null;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [likes, setLikes] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(post.likes?.includes(userId));
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(() => {
    // 1. Check direct boolean prop
    if (typeof isSaved === "boolean") return isSaved;

    // 2. Check savedIds Set (from Feed)
    if (savedIds instanceof Set) return savedIds.has(post._id?.toString());
    if (Array.isArray(savedIds)) return savedIds.includes(post._id?.toString());

    // 3. Check savedPosts array fallback
    return savedPosts?.some((s) => s.post?.toString() === post._id?.toString());
  });
  const [showShare, setShowShare] = useState(false);
  const [showHeart, setShowHeart] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLike = async () => {
    try {
      const res = await fetch(`/api/auth/post/${post._id}/like`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await res.json();

      if (data.success) {
        setLikes(data.post.likes.length);
        setLiked(data.post.likes.includes(userId));
      }
    } catch (error) {
      console.log("Error liking post");
    }
  };

  const handleComments = (pid) => {
    setSelectedPostId(pid);
    setOpenComments(true);
  };

  const handleProfile = async (username) => {
    if (username === UName) {
      router.push(`/home/${id}/profile/`);
    } else {
      router.push(`/home/${id}/profile/${username}`);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/auth/post/${post._id}/delete`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        router.refresh();
      } else {
        console.log(data.message);
        toast.error(data.message);
      }
    } catch (error) {
      console.log("Error deleting post");
    }
  };

  const handleSave = async () => {
    try {
      if (!saved) {
        setSaved(true);
        dispatch(addPost({ userId, postId: post._id }));

        const res = await fetch(`/api/auth/post/${post._id}/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();

        if (!data.success) {
          setSaved(false);
        }
      } else {
        setSaved(false);
        dispatch(removePost({ userId, postId: post._id }));

        const res = await fetch(`/api/auth/post/${post._id}/unsaved`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId }),
        });

        const data = await res.json();

        if (!data.success) {
          setSaved(true);
        }
      }
    } catch (error) {
      console.log("error in save post", error);
    }
  };

  const handleDoubleClick = () => {
    setShowHeart(true);

    setTimeout(() => {
      setShowHeart(false);
    }, 800);

    if (!liked) {
      handleLike();
    }
  };

  return (
    <div
      className="border-b border-gray-800 bg-black"
      onDoubleClick={handleDoubleClick}
    >
      {/* Author */}
      <div className="flex items-center justify-between p-3">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleProfile(post.author.username)}
        >
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
            <Image
              src={post.author.image}
              alt={post.author.username}
              className="object-cover"
              fill
            />
          </div>
          <p className="font-semibold">{post.author.username}</p>
        </div>

        {/* Menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute z-10 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-md text-sm w-28">
              {post.author._id === userId && (
                <button
                  onClick={handleDelete}
                  className="block w-full text-left px-3 py-2 hover:bg-gray-800"
                >
                  Delete
                </button>
              )}

              <button
                onClick={handleSave}
                className="block w-full text-left px-3 py-2 hover:bg-gray-800"
              >
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="relative">
        <Image
          src={post.post}
          alt="post"
          width={800}
          height={800}
          className="w-full h-auto"
          loading="lazy"
        />

        {showHeart && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Heart
              size={70}
              className="animate-heart"
              fill="red"
              color="red"
            />
          </div>
        )}
      </div>

      {/* actions */}
      <div className="p-3 flex justify-between items-center text-sm">
        <div className="flex gap-4">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-gray-400"
          >
            <Heart
              size={20}
              fill={liked ? "red" : "none"}
              color={liked ? "red" : "white"}
            />
            {likes}
          </button>

          <button
            onClick={() => handleComments(pid)}
            className="hover:text-gray-400"
          >
            💬 Comment
          </button>

          <button
            className="hover:text-gray-400"
            onClick={() => setShowShare(true)}
          >
            📤 Share
          </button>
        </div>

        <button onClick={handleSave} className="hover:text-gray-400">
          <Bookmark size={20} fill={saved ? "white" : "none"} />
        </button>
      </div>

      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="bg-black text-white w-[95vw] sm:w-full max-w-md max-h-[85vh] h-full sm:h-auto overflow-hidden p-0 rounded-2xl border border-gray-800 flex flex-col">
          <DialogHeader className="p-4 border-b border-gray-800">
            <DialogTitle className="text-center text-lg font-bold">Share Post</DialogTitle>
          </DialogHeader>

          <SharePannel
            userId={userId}
            post={post}
            onClose={() => setShowShare(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Comments */}
      <CommentDrawer
        open={openComments}
        setOpen={setOpenComments}
        postId={selectedPostId}
      />
    </div>
  );
}

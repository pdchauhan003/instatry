"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { MoreVertical, Bookmark, Heart } from "lucide-react";
import { useDispatch } from "react-redux";
import { addPost, removePost } from "@/redux/savedSlice";
import SharePannel from "./SharePannel";
import {Dialog,DialogContent,DialogHeader,DialogTitle,} from "@/components/ui/dialog";

export default function PostCard({ post, userId, pid, UName, id, savedPosts }) {

  const [likes, setLikes] = useState(post.likes.length);
  const [liked, setLiked] = useState(post.likes.includes(userId));
  const [showMenu, setShowMenu] = useState(false);
  const [saved, setSaved] = useState(savedPosts?.some((s) => s.post.toString() === post._id.toString()));
  const [showShare,setShowShare]=useState(false)
  const [showHeart, setShowHeart] = useState(false);

  const dispatch=useDispatch();
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

  const handleComments = async () => {
    router.push(`/home/${userId}/commants/${pid}`);
  };

  const handleProfile=async(username)=>{
    if(username==UName){
      router.push(`/home/${id}/profile/`)
    }
    else{
      router.push(`/home/${id}/profile/${username}`)
    }
  } 

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/auth/post/${post._id}/delete`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        router.refresh(); // reload server component feed
      }
      else{
        console.log(data.message);
        alert(data.message);
      }
    } catch (error) {
      console.log("Error deleting post");
    }
  };

  //click saved then trigger
  const handleSave = async () => {
    try {
      if (!saved) {
        // SAVE
        setSaved(true);
        dispatch(addPost({ userId, postId: post._id }));
        const res = await fetch(`/api/auth/post/${post._id}/saved`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (!data.success) {
          setSaved(false); // revert
        }
      } else {
        // UNSAVE
        setSaved(false);
        dispatch(removePost({ userId, postId: post._id }));
        const res = await fetch(`/api/auth/post/${post._id}/unsaved`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        });
        const data = await res.json();
        if (!data.success) {
          setSaved(true); // revert
        }
      }
    } catch (error) {
      console.log("error in save post", error);
    }
  };

  const handleDoubleClick=()=>{
    setShowHeart(true); // show heart

    setTimeout(() => {
      setShowHeart(false); // hide after animation
    }, 800);

    if(!liked){
      handleLike();
    }
  }

  return (
    <div className="border-b border-gray-800 bg-black" onDoubleClick={handleDoubleClick}>

      {/* Author details */}
      <div className="flex items-center justify-between p-3">
        
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleProfile(post.author.username)}>
          <div className="w-8 h-8 rounded-full bg-gray-700 overflow-hidden relative">
            <Image src={post.author.image} alt={post.author.username} className="object-cover" fill/>
          </div>

          <p className="font-semibold">{post.author.username}</p>
        </div>

        {/* 3 dots menu */}
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical size={18} />
          </button>

          {showMenu && (
            <div className="absolute z-10 right-0 mt-2 bg-gray-900 border border-gray-700 rounded-md text-sm w-28">
              {/* Show delete only if owner */}
              {
                post.author._id === userId && (
                  <button onClick={handleDelete} className="block w-full text-left px-3 py-2 hover:bg-gray-800">
                    Delete
                  </button>
                )
              }
              <button onClick={handleSave} className="block w-full text-left px-3 py-2 hover:bg-gray-800">
                Save
              </button>
            </div>
          )}
        </div>
      </div>

      {/* post image */}
      <div className="relative">
        <Image src={post.post} alt="post" width={2000} height={2000} className="w-full"/>
          {showHeart && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Heart
                size={70}
                className="animate-heart text-red"
                fill="red"
                color="red"
              />
            </div>
          )}
      </div>

      {/* actions buttons */}
      <div className="p-3 flex justify-between items-center text-sm">
      {/* Left actions */}
      <div className="flex gap-4">
        <button onClick={handleLike} className="flex items-center gap-1 hover:text-gray-400">
          <Heart size={20} fill={liked ? "red" : "none"} color={liked ? "red" : "white"}/>
          {likes}
        </button>

        <button onClick={handleComments} className="hover:text-gray-400">
          💬 Comment
        </button>

        <button className="hover:text-gray-400" onClick={()=>setShowShare(true)}>
          📤 Share
        </button>
      </div>

      {/* Save button (right side) */}
      <button onClick={handleSave} className="hover:text-gray-400">
        <Bookmark size={20} fill={saved ? "white" : "none"}/>
      </button>


      <Dialog open={showShare} onOpenChange={setShowShare}>
        <DialogContent className="bg-black text-white  w-full max-w-md  h-[90vh] sm:h-auto p-4 rounded-none sm:rounded-lg">
          <DialogHeader>
            <DialogTitle>Share Post</DialogTitle>
          </DialogHeader>

          <SharePannel
            userId={userId}
            post={post}
            onClose={() => setShowShare(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
    </div>
  );
}

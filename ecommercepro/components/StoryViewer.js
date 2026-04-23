'use client'
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, ChevronLeft, ChevronRight, Trash2, AlertCircle } from "lucide-react";

export default function StoryViewer({ stories, currentIdx, userId }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const storyGroup = stories[currentIdx];
  const storyData = storyGroup?.story;
  const author = storyGroup?.author;

  const nextAuthor = stories[currentIdx + 1];
  const prevAuthor = stories[currentIdx - 1];

  const goToNext = () => {
    if (nextAuthor) {
      router.push(`/home/${userId}/story/${nextAuthor.author._id}`);
    } else {
      router.push(`/home/${userId}`);
    }
  };

  const goToPrev = () => {
    if (prevAuthor) {
      router.push(`/home/${userId}/story/${prevAuthor.author._id}`);
    }
  };

  const closeViewer = () => {
    router.push(`/home/${userId}`);
  };

  const handleDelete = async () => {
    if (!storyData?._id) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/auth/home/${userId}/story/delete/${storyData._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        // Navigate to next story or home
        goToNext();
      } else {
        alert(data.message || "Failed to delete story");
      }
    } catch (error) {
      console.error("Delete story error:", error);
      alert("Something went wrong");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  useEffect(() => {
    if (showDeleteConfirm) return; // Pause timer when modal is open

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          goToNext();
          return 100;
        }
        return prev + (100 / (5000 / 100)); // 5 seconds
      });
    }, 100);

    return () => clearInterval(timer);
  }, [currentIdx, showDeleteConfirm]);

  const isMe = String(author?._id) === String(userId);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-0 md:p-4 overflow-hidden select-none">
      <div className="relative w-full max-w-[450px] aspect-[9/16] bg-gray-900 md:rounded-xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Progress Bar Container */}
        <div className="absolute top-4 left-4 right-4 z-50 flex gap-1 items-center px-1">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-0.5 bg-gray-600/50 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-white transition-all duration-100 ease-linear ${i < currentIdx ? 'w-full' : (i === currentIdx ? 'w-full' : 'w-0')}`}
                style={{
                  width: i === currentIdx ? `${progress}%` : undefined,
                  opacity: i > currentIdx ? 0 : 1
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Info */}
        <div className="absolute top-8 left-4 right-4 z-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
              {author?.image ? (
                <Image src={author.image} alt={author.username} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-gray-300 font-bold">
                  {author?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <p className="text-white font-bold text-sm drop-shadow-md">
              {author?.username || "Loading..."}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {isMe && (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="p-1 rounded-full hover:bg-black/20 group"
              >
                <Trash2 className="text-gray-300 group-hover:text-red-500 transition-colors" size={20} />
              </button>
            )}
            <button 
              onClick={closeViewer} 
              className="p-1 rounded-full hover:bg-black/20"
            >
              <X className="text-white" size={24} />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="flex-1 relative bg-black flex items-center justify-center">
          {storyData?.story ? (
            <Image
              src={storyData.story}
              fill
              className="object-contain md:object-cover"
              alt="story"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              No story available
            </div>
          )}

          {/* Invisible tap areas for navigation */}
          {!showDeleteConfirm && (
            <div className="absolute inset-0 z-40 flex">
              <div className="flex-1 cursor-pointer" onClick={goToPrev} />
              <div className="flex-1 cursor-pointer" onClick={goToNext} />
            </div>
          )}
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 text-center animate-in fade-in duration-200">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-2xl max-w-[280px]">
              <div className="w-12 h-12 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="text-red-500" size={24} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">Delete Story?</h3>
              <p className="text-gray-400 text-sm mb-6">
                Are you sure you want to delete this story? This action cannot be undone.
              </p>
              <div className="flex flex-col gap-2">
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Desktop Navigation Arrows */}
        <div className="hidden md:flex absolute -left-20 top-1/2 -translate-y-1/2">
            <button 
              onClick={goToPrev}
              disabled={!prevAuthor}
              className={`p-3 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors ${!prevAuthor ? 'opacity-30 cursor-not-allowed' : ''}`}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
        </div>

        <div className="hidden md:flex absolute -right-20 top-1/2 -translate-y-1/2">
            <button 
              onClick={goToNext}
              className="p-3 rounded-full bg-gray-800 border border-gray-700 hover:bg-gray-700 transition-colors"
            >
              <ChevronRight size={24} className="text-white" />
            </button>
        </div>
      </div>
    </div>
  );
}

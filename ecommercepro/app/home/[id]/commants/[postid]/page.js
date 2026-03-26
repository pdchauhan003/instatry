"use client";
import { useParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";


function Comments() {
  const { id, postid } = useParams();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [UName,setUName]=useState('');
  const bottomRef = useRef(null);
  const router=useRouter();

  async function fetchData() {
    const res = await fetch(`/api/auth/home/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postid }),
    });

    if (!res.ok) return;
    const data = await res.json();
    setComments(data.commentData || []);
    setUName(data.username)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [id, postid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  

  console.log('comments is ',comments)

  const handleClick = async () => {
    if (!comment.trim()) return;

    const res = await fetch(`/api/auth/home/${id}/comments/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postid, comment }),
    });

    const data = await res.json();
    if (data.success) {
      setComment("");
      fetchData();
    }
  };

  const handleProfile=async(username)=>{
    if(username==UName){
      router.push(`/home/${id}/profile/`)
    }
    else{
      router.push(`/home/${id}/profile/${username}`)
    }
  }

  return (
    <div className="flex flex-col h-full bg-black text-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-800 text-center font-semibold">
        Comments
      </div>

      {/* Scrollable Comments Area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 pb-24">

        {comments.length === 0 && (
          <p className="text-center text-gray-400">No comments yet</p>
        )}

        {comments.map((i) => (
          <div key={i._id} className="flex gap-3" onClick={()=>handleProfile(i.author.username)}>

            {/* Avatar */}
            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-gray-700">
              <Image
                src={i.author.image}
                alt={i.author.username} fill
                className="object-cover"
              />
            </div>

            {/* Comment Bubble */}
            <div>
              <p className="font-semibold text-sm">{i.author.username}</p>
              <p className="text-sm text-gray-200">{i.text}</p>
            </div>

          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      {/* Input Bar */}
      <div className=" fixed bottom-0 left-0 right-0 md:left-64 md:right-0 bg-black border-t border-gray-800 p-3 flex gap-2">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2 outline-none"
          placeholder="Add a comment..."
        />
        <button
          onClick={handleClick}
          className="bg-white text-black px-4 rounded-xl font-medium"
        >
          Send
        </button>
      </div>

    </div>
  );
}

export default Comments;
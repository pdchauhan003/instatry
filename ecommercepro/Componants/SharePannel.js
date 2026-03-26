// "use client";

// import { Button } from "@/components/ui/button";
// import { useQuery } from "@tanstack/react-query";
// import Image from "next/image";
// import { useState } from "react";
// import socket from "@/lib/socket";

// function SharePannel({ post, userId, onClose }) {
//   const [selectedUser, setSelectedUser] = useState([]);

//   const fetchContacts = async () => {
//     const res = await fetch(`/api/auth/home/${userId}/chatt`, {
//       method: "POST",
//     });
//     const data = await res.json();
//     return data?.friends || [];
//   };

//   const { data: contacts = [], isLoading } = useQuery({
//     queryKey: ["friends", userId],
//     queryFn: fetchContacts,
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     staleTime: 1000 * 60 * 5, // 5 minutes
//     refetchOnWindowFocus: false,
//   });

//   const handleSend = (u) => {
//     setSelectedUser((p) => {
//       if (p.includes(u)) {
//         return p.filter((f) => f !== u);
//       } else {
//         return [...p, u];
//       }
//     });
//   };

//   console.log("selected users list is ", selectedUser);

//   if (isLoading) return <p>Loading....</p>;

//   return (
//     <div className="flex flex-col h-full">
//       {/* Scrollable friend list */}
//       <div className="flex-1 overflow-y-auto space-y-2 pr-2">
//         {contacts.length === 0 ? (
//           <p className="text-gray-400 text-sm">No friends found</p>
//         ) : (
//           contacts.map((friend) => (
//             <div key={friend._id} className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded">
//               <Image src={friend?.image} width={300} height={300} className="w-8 h-8 rounded-full" alt="friend"/>
//               <p className="flex-1">{friend.username}</p>
//               <Button size="sm" onClick={() => handleSend(friend.username)} className={ selectedUser.includes(friend.username) ? "bg-blue-600 hover:bg-blue-700" : ""}>
//                 Send
//               </Button>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Fixed bottom button */}
//       <div className="border-t border-gray-700 pt-3 mt-2">
//         <Button className="w-full">Done</Button>
//       </div>
//     </div>
//   );
// }
// export default SharePannel;


"use client";

import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
import socket from "@/lib/socket"; // make sure socket is imported

function SharePannel({ post, userId, onClose }) {
  const [selectedUser, setSelectedUser] = useState([]);

  // Fetch friend list
  const fetchContacts = async () => {
    const res = await fetch(`/api/auth/home/${userId}/chatt`, {
      method: "POST",
    });
    const data = await res.json();
    return data?.friends || [];
  };

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["friends", userId],
    queryFn: fetchContacts,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const handleSelect = (friend) => {
    setSelectedUser((prev) =>
      prev.includes(friend._id)
        ? prev.filter((id) => id !== friend._id)
        : [...prev, friend._id]
    );
  };

  // Send post as chat message to selected users
  const handleSend = () => {
    selectedUser.forEach((receiverId) => {
      const messageContent = `📤 ${post.author.username} shared a post: ${post.post}`;
      socket.emit("sendMessage", {
        from: userId,
        to: receiverId,
        message: messageContent,
        postId: post._id, //
      });
    });
    setSelectedUser([]);
    onClose(); // close panel
  };

  if (isLoading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {contacts.length === 0 ? (
          <p className="text-gray-400 text-sm">No friends found</p>
        ) : (
          contacts.map((friend) => (
            <div
              key={friend._id}
              className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded"
            >
              <Image
                src={friend?.image}
                width={300}
                height={300}
                className="w-8 h-8 rounded-full"
                alt="friend"
              />
              <p className="flex-1">{friend.username}</p>
              <Button
                size="sm"
                onClick={() => handleSelect(friend)}
                className={
                  selectedUser.includes(friend._id)
                    ? "bg-blue-600 hover:bg-blue-700"
                    : ""
                }
              >
                {selectedUser.includes(friend._id) ? "Selected" : "Send"}
              </Button>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-gray-700 pt-3 mt-2 flex gap-2">
        <Button
          className="flex-1"
          onClick={handleSend}
          disabled={selectedUser.length === 0}
        >
          Done
        </Button>
        <Button className="flex-1" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default SharePannel;

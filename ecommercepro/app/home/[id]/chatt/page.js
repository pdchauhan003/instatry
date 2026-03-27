"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { useQuery,useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/handler/SearchApi";

function AllChats() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient=useQueryClient();

  // const [contacts, setContacts] = useState([]);
  const [onlineUsers,setOnlineUsers]=useState({});
  const [searchText, setSearchText] = useState("");
  const [users,setUsers]=useState([]);

  const fetchContacts=async()=>{
    const res = await fetch(`/api/auth/home/${id}/chatt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
      return data.friends || [];
    // if (data.success) setContacts(data.friends || []);
  }

  const fetchData = async () => {
    try {
      if (!searchText) {
        setUsers([]);
        return;
      }
      const searchData = await searchApi(id, searchText);
      setUsers(searchData.users || []);
    } catch (err) {
      console.log(err);
    }
  };
  
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchData();
    }, 100);

    return () => clearTimeout(delay);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText]);

  const {data:contacts=[],isLoading}=useQuery({
    queryKey:['friends',id],
    queryFn:fetchContacts,
    staleTime:1000*60*5
  })

  // fetch online users
  useEffect(()=>{
    const fetchOnline = async ()=>{
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/online-users`);
      const list = await res.json();

      const map={};
      list.forEach(id=> map[id]=true);
      setOnlineUsers(map);
    }
    fetchOnline()
  },[])

  // used to show online or offline users
 useEffect(() => {
  socket.on("userStatus", ({ userId, status }) => {
    setOnlineUsers(prev => ({
      ...prev,
      [userId]: status === "online"
    }));
  });

  return () => socket.off("userStatus");
}, []);

useEffect(() => {
  socket.on("receiveMessage", (msg) => {
    if (msg.to === id) {
      queryClient.setQueryData(['friends',id],(oldContacts) => {
        return oldContacts.map(user =>
          user._id === msg.from
            ? {
                ...user,
                unreadCount: (user.unreadCount || 0) + 1,
                lastMessageTime: new Date()
              }
            : user
        ).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)  // move sender to top
        );
      });
    }
  });
  return () => socket.off("receiveMessage");
}, [id,queryClient]);

if(isLoading) return <p>Loading...</p>

return (
    <div className="flex flex-col h-full bg-black text-white">

      {/* Header */}
      <div className="p-4 border-b border-gray-800 text-center font-semibold text-lg">
        Messages
      </div>

      {/* searchbar */}
      <div className="w-full flex justify-center">
        <input
          type="text"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search users..."
          className="px-3 py-2 rounded-md text-white bg-gray-900"
        />
      </div>
      
      {/* show search users */}
      {users.length > 0 && (
        <div className="mx-3 mt-3 bg-gray-900 rounded-xl p-2 shadow-md">
          <p className="text-sm text-gray-400 px-2 mb-2">Search Results</p>

          {users.map((user) => (
            <div
              key={user._id}
              onClick={() =>
                router.push(`/home/${id}/chatt/personalChatt/${user._id}`)
              }
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 relative">
                {user.image ? (
                  <Image
                    src={user.image}
                    alt={user.username}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sm text-gray-300">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <p className="text-sm font-medium">{user.username}</p>
            </div>
          ))}
        </div>
      )}


      {/* Scrollable Chat List */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2 pb-24 no-scrollbar">

        {contacts.length === 0 ? (
          <p className="text-center text-gray-400 mt-6">No chats yet</p>
        ) 
        :
        (
          contacts?.map((user) => (
            <div
              key={user._id}
              onClick={() =>
                router.push(`/home/${id}/chatt/personalChatt/${user._id}`)
              }
              className="flex items-center justify-between p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition cursor-pointer"
            >
              {/* LEFT SIDE */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden relative bg-gray-700">
                  {user?.image ? (
                    <Image src={user?.image} alt={user?.username} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm text-gray-300">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-semibold">{user.username}</p>

                  {onlineUsers[user._id] ? (
                    <p className="text-green-500 text-sm">Online</p>
                  ) : (
                    <p className="text-gray-400 text-sm">Offline</p>
                  )}

                  <p className="text-sm text-gray-400">Tap to chat</p>
                </div>
              </div>

              {/* RIGHT SIDE → RED BADGE */}
              {user.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {user.unreadCount}
                </span>
              )}
            </div>
          ))
        )
        }
      </div>
    </div>
  );
}
export default AllChats;
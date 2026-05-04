"use client";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { searchApi } from "@/handler/SearchApi";
import { Button } from "@/components/ui/button";

function AllChats() {
  const { id } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();

  // const [contacts, setContacts] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState({});
  const [searchText, setSearchText] = useState("");
  const [users, setUsers] = useState([]);

  const fetchContacts = async () => {
    const res = await fetch(`/api/auth/home/${id}/chatt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    return {
      friends: data.friends || [],
      groups: data.groups || []
    };
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

  const { data: { friends = [], groups = [] } = {}, isLoading } = useQuery({
    queryKey: ['friends', id],
    queryFn: fetchContacts,
    staleTime: 1000 * 60 * 5
  })

  // fetch online users
  useEffect(() => {
    const fetchOnline = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/online-users`);
      const list = await res.json();

      const map = {};
      list.forEach(id => map[id] = true);
      setOnlineUsers(map);
    }
    fetchOnline()
  }, [])

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

  const handleGroup=()=>{
    router.push(`/home/${id}/chatt/groupform`)
  }


  if (isLoading) return <p>Loading...</p>

  return (
    <div className="flex flex-col h-full bg-black text-white">

      {/* Header */}
      <div className="flex justify-between border-b border-gray-800">
        <div className="flex-1 p-4  text-center font-semibold text-lg">
          Messages
        </div>
        <Button className='m-4' onClick={handleGroup}>Group chat</Button>
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

        {groups.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Groups</p>
            {groups.map((group) => (
              <div
                key={group._id}
                onClick={() =>
                  router.push(`/home/${id}/chatt/groupChat/${group._id}`)
                }
                className="flex items-center justify-between p-3 rounded-xl bg-gray-900 hover:bg-gray-800 transition cursor-pointer mb-2 border border-purple-500/10"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden relative bg-purple-900/30 flex items-center justify-center border border-purple-500/20">
                    {group.dp ? (
                      <Image src={group.dp} alt={group.name} fill className="object-cover" />
                    ) : (
                      <span className="text-purple-400 font-bold">{group.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-purple-100">{group.name}</p>
                    <p className="text-[10px] text-gray-500">Group Chat</p>
                  </div>
                </div>

                {/* Group Unread Badge */}
                {group.unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-lg shadow-red-500/20">
                    {group.unreadCount}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        <p className="text-xs font-bold text-gray-500 mb-2 px-2 uppercase tracking-wider">Direct Messages</p>
        {friends.length === 0 ? (
          <p className="text-center text-gray-400 mt-6">No chats yet</p>
        )
          :
          (
            friends?.map((user) => (
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

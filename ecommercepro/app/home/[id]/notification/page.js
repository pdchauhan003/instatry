"use client";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function NotificationPage() {
  const { id } = useParams(); // logged in user id
  const [requests, setRequests] = useState([]);

  // const [showOption,setShowOption]=useState(false);

  // FETCH EXISTING REQUESTS FROM EXPRESS SERVER all requests
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_SOCKET_URL}/notification/${id}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setRequests(data);
        }
        else {
          setRequests([]);
        }
      } catch (error) {
        console.log("error fetching notifications", error);
      }
    };
    if (id) fetchRequests();
  }, [id]);

  // fetch follow req 
  useEffect(() => {
    socket.on("newFollowReq", (data) => {
      setRequests((prev) => [...prev, data]);
    });

    socket.on("friendOrNot", ({ from, to, isFriend }) => {
      if (isFriend) {
        // remove request immediately
        setRequests((prev) =>
          prev.filter((req) => req.from._id !== from)
        );
      } else {
        // mark this request as follow-back type
        setRequests((prev) =>
          prev.map((req) =>
            req.from._id === from
              ? { ...req, followBack: true }
              : req
          )
        );
      }
    });
    return () => {
      socket.off("newFollowReq"), socket.off('friendOrNot')
    };
  }, []);


  // accept
  const handleAccept = (senderId) => {
    // setShowOption(true);
    socket.emit("acceptFollowRequest", {
      from: senderId,
    });
  };

  // decline
  const handleDecline = (senderId) => {
    socket.emit("declineReq", {
      from: senderId,
    });
    setRequests((prev) =>
      prev.filter((req) => req.from._id !== senderId)
    );
  };

  //follow back 
  const handleFollowBack = (senderId) => {
    socket.emit('followback', {
      to: senderId
    })
    setRequests((prev) =>
      prev.filter((req) => req.from._id !== senderId)
    );
  }

  return (
    <div className="max-w-md mx-auto text-white p-4">
      <h1 className="text-xl font-bold mb-4">
        Follow Requests
      </h1>
      {requests.length === 0 && (
        <p className="text-gray-400">
          No pending requests
        </p>
      )}
      {requests?.map((req) => (
        <div key={req._id} className="flex items-center justify-between bg-gray-800 p-3 rounded-lg mb-3">
          {/* profile picture and username section */}
          <div className="flex items-center gap-3">
            <Image
              src={req.from.image}
              width={40}
              height={40}
              alt="profile"
              className="rounded-full"
            />
            <span>{req.from.username}</span>
          </div>

          {/*  accept and decline buttons */}
          <div className="flex gap-2">
            {req.followBack ? (
              <button
                onClick={() => handleFollowBack(req.from._id)}
                className="bg-green-500 px-3 py-1 rounded"
              >
                FollowBack
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleAccept(req.from._id)}
                  className="bg-green-500 px-3 py-1 rounded"
                >
                  Accept
                </button>

                <button
                  onClick={() => handleDecline(req.from._id)}
                  className="bg-red-500 px-3 py-1 rounded"
                >
                  Decline
                </button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
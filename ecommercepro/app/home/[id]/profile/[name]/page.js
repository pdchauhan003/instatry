"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import socket from "@/lib/socket";
import Image from "next/image";
import { profilePageContent } from "@/Componants/ProfileUpperPage";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogClose,} from "@/components/ui/dialog"; // ShadCN dialog
import FollowingFeed from "@/Componants/FollowingFeed";
import FollowerFeed from "@/Componants/FollowerFeed";
import { Button } from "@/components/ui/button";
import { handleUnfollow } from "@/handler/UnFollowhandler";
// import { handleFollow } from "@/handler/follow&unfollow.handler";

function ProfilePage() {

  const params = useParams();
  const router=useRouter();
  const username = params.name; // name of other shows other person profile
  const id = params.id; //id of logged in user

  const [friend, setFriend] = useState(false); //send req
  const [fdData, setFdData] = useState(null); // data which is searches
  const [friendId, setFriendId] = useState(null); // person id which is searched...
  const [status, setStatus] = useState(''); // check status friend?,req pending or not
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState([]);  // all posts store in this list
  const [selectedPost, setSelectedPost] = useState(null);  // if any post click then zoom
  const [followers,setFollowers]=useState([]);  // followers of users
  const [followings,setFollowings]=useState([]); //followings of users
  const [openDialog,setOpenDialog]=useState(false); // for followers and following dialog box
  const [dialogType, setDialogType] = useState("followers"); // or "followings"
  const [bio,setBio]=useState('') //uses bio
  const [followersCount,setFollowersCount]=useState(null);
  const [followingsCount,setFollowingsCount]=useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/auth/home/${id}/profile`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      setFriend(data.friend);
      setFdData(data.user);
      setFriendId(data.friendid);
      setLoading(false);
      setPosts(data.posts);
      setFollowers(data.followers);
      setFollowings(data.followings)
      setFollowersCount(data.followerCount);
      setFollowingsCount(data.followingCount)
      setBio(data.bio)
      if (!data.friend && !data.requested) {
        setStatus("follow");
      }
      if (!data.friend && data.requested) {
        setStatus("followback");
      }
      if (data.friend) {
        setStatus("following");
      }
    };
    if (id && username) {
      fetchData();
    }
  }, [id, username]);

  const handleAAdd = async () => {
    try {
      socket.emit("sendFollowRequest", {
        from: id,
        to: friendId,
        status: "pending",
      });
      setStatus("requested");
    } catch (error) {
      console.error(error);
      alert(error,'error in sending follow req...')
    }
    // await handleFollow({id,friendId,setStatus})
  };

  const handleFollower = () => {
    setDialogType("followers");
    setOpenDialog(true);
  };

  const handleFollowing = () => {
    setDialogType("followings");
    setOpenDialog(true);
  };
  useEffect(() => {
  //   const checkRequest = async ()=>{
  //   const res = await fetch(`http://localhost:1212/request/${id}/${friendId}`);
  //   const data = await res.json();
  //   if(data){
  //     setStatus("requested");
  //   }
  // }
  // if(friendId){
  //   checkRequest();
  // }

   //if person req accept then real time update it
  const handleAccepted = ({ from, to }) => {
    if (from === friendId || to === friendId) {
      setStatus("following");
      setFriend(true);
    }
  };

  //if person req decline then real time update it
  const handleDeclineed = ({ from, to }) => {
    if (from === friendId || to === friendId) {
      setFriend(false);
      setStatus("");
    }
  };
  socket.on("reqAccepted", handleAccepted);
  socket.on("declineReq", handleDeclineed);
  return () => {
    socket.off("reqAccepted", handleAccepted);
    socket.off("declineReq", handleDeclineed);
  };
}, [friendId]);

  console.log("ffffffff", friendId);
  console.log("is a friend", friend);
  console.log("friend data", fdData);
  // console.log('friend image is ',fdData.name)
  console.log("post data", posts);
  useEffect(()=>{
    if(friend){
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("following")
    }
  },[friend])

  // useEffect(()=>{
  //   socket.on('friendOrNot',(data)=>{
  //     if(data){
  //       setFriend(true);
  //       setStatus('following')
  //     }
  //     else{
  //       setStatus('followback')
  //     }
  //   })
  //   return ()=> socket.off('friendOrNot');
  // },[])

  const handleFollowBack=()=>{
    socket.emit('followback',{from:id,to:friendId})
    setStatus('following')
    setFriend(true);
  }

  // remove
  const handleFriendRemove = async () => {
    try {
      // const res = await fetch(`/api/auth/home/${id}/profile/remove`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ friendId }),
      // });

      const data = await handleUnfollow(id, friendId);
      console.log("unfollow data is", data);
      if (data.success) {
        setFriend(data.friend);
        setStatus("follow");
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.log(err);
      alert("Something went wrong");
    }
  };

  const handleMessage=async()=>{
    router.push(`/home/${id}/chatt/personalChatt/${friendId}`)
  }

  if (loading) {
  return (
    <div className="flex justify-center items-center h-screen text-white text-xl">
      Loading profile...
    </div>
  );
  }
  
  return (
    <>
      {
        profilePageContent({followersCount,followingsCount,handleFollowBack,bio,followings,followers,status,friendId,fdData,username,posts,friend,handleFriendRemove,handleAAdd,handleMessage,setSelectedPost,handleFollower,handleFollowing})
      }
      {selectedPost && (
        <div
          className="fixed inset-0 bg-gray-800 flex items-center justify-center"
          onClick={() => setSelectedPost(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <Image
              src={selectedPost.post}
              alt="zoomed post"
              width={300}
              height={300}
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">
              {dialogType === "followers" ? "Followers" : "Following"}
            </DialogTitle>
          </DialogHeader>

          {dialogType === "followers" ? (
            <FollowerFeed id={friendId} />
          ) : (
            <FollowingFeed id={friendId} />
          )}
          <DialogClose asChild>
            <Button className='w-full'>Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
export default ProfilePage;

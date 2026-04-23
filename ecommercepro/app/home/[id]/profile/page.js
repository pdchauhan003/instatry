"use client";

import dynamic from "next/dynamic";
const FollowerFeed = dynamic(() => import("@/components/FollowerFeed"), { ssr: false });
const FollowingFeed = dynamic(() => import("@/components/FollowingFeed"), { ssr: false });
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogClose,} from "@/components/ui/dialog"; // ShadCN dialog
import { Button } from "@/components/ui/button";

function PersonalProfilePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [ourData, setourData] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState("followers"); // or "followings"

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch(`/api/auth/home/${id}/pprofile`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      setourData(data.userData);
      console.log('data in page ',ourData)
    };
    if (id) {
      fetchData();
    }
  }, [id]);

  const handleEditProfile = async () => {
    router.push(`/home/${id}/profile/edit`);
  };

  const handleFollower = () => {
    setDialogType("followers");
    setOpenDialog(true);
  };

  const handleFollowing = () => {
    setDialogType("followings");
    setOpenDialog(true);
  };

  console.log('our data is',ourData);
  return (
    <>
      <div className="max-w-xl mx-auto min-h-screen m-2 rounded-sm border-2 border-black">
        
        {/* HEADER */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="font-bold text-lg">{ourData.username}</h1>
          <button className="text-xl">☰</button>
        </div>

        {/* PROFILE INFO */}
        <div className="flex items-center gap-5 p-4">
          <div className="w-24 h-24 rounded-full border-2 border-pink-500 p-1">
            {
              ourData?.image && (
                <Image
                  src={ourData.image}
                  width={96}
                  height={96}
                  alt='profile image'
                  className="w-full h-full rounded-full object-cover"
                  priority
                />

              )
            }
          </div>

          <div className="flex justify-between flex-1 text-center">
            <div>
              <h2 className="font-semibold">
                {ourData?.posts?.length || 0}
              </h2>
              <p className="text-sm text-gray-500">Posts</p>
            </div>

            <div onClick={handleFollower}>
              <h2 className="font-semibold">
                {ourData?.followerCount || 0}
              </h2>
              <p className="text-sm text-gray-500">Followers</p>
            </div>

            <div onClick={handleFollowing}>
              <h2 className="font-semibold">
                {ourData?.followingCount || 0}
              </h2>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>

        {/* bio */}
        <div className="px-4">
          <h2 className="font-semibold">{ourData?.name}</h2>
          <p className="text-sm">
            {ourData?.userInfo?.bio?.bio}
          </p>
        </div>

        {/* edit button */}
        <div className="px-4 mt-3">
          <button
            onClick={handleEditProfile}
            className="w-full border rounded-md py-1.5 font-medium bg-gray-600"
          >
            Edit Profile
          </button>
        </div>

        {/* Highlights */}
        <div className="flex gap-4 px-4 mt-5 overflow-x-auto">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="flex flex-col items-center">
              <div className="w-16 h-16 border rounded-full p-1 bg-gray-600" ></div>
              <p className="text-xs mt-1">Story</p>
            </div>
          ))}
        </div>

        {/* Postt */}
        <div className="grid grid-cols-3 gap-1 mt-5">
          {ourData?.posts?.map((i, index) => (
            <div
              key={index}
              className="aspect-square bg-gray-600 cursor-pointer"
              onClick={() => setSelectedPost(i)} // CLICK TO ZOOM
            >
              <Image
                src={i.post}
                alt="post"
                width={300}
                height={300}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* zoom then show its type */}
      {selectedPost && (
        <div className="fixed inset-0 bg-gray-800 flex items-center justify-center"
          onClick={() => setSelectedPost(null)}>
          <div className="relative" onClick={(e) => e.stopPropagation()} >
            <Image src={selectedPost.post} alt="zoomed post" width={300} height={300}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"/>
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
            <FollowerFeed id={id} />
          ) : (
            <FollowingFeed id={id} />
          )}
          <DialogClose asChild>
            <Button className='w-full'>Close</Button>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PersonalProfilePage;

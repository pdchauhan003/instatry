"use client";
import Link from "next/link";
// import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
function SettingPage() {
  const { id } = useParams();
  const router = useRouter();
  const handleLogout = async () => {
    const res = await fetch(`/api/auth/home/${id}/setting/logout`, {
      method: "POST",
    });
    if (!res.ok) {
      console.error("Logout failed");
      return;
    }
    const data = await res.json();
    if (data?.success) {
      router.replace("/login");
      router.refresh();
    }
  };
  
  const handlesavedPost=async()=>{
    router.replace(`/home/${id}/setting/savedposts`)
  }
  return (
    <>
      <div className="justify-center items-center">
        <div className="font-bold text-2xl">
          <Link href={`/home/${id}/setting/passchange`}>Change Password</Link>
        </div>
        <div className="font-bold text-2xl">
          <button onClick={handleLogout} className="">
            Logout
          </button>
        </div>
        <div className="font-bold text-2xl">
          <button onClick={handlesavedPost} className="">
            Saved
          </button>
        </div>
      </div>
    </>
  );
}
export default SettingPage;

"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
// import OIP from "../public/OIP.webp";
import firstPageLogo from '../public/firstPageLogo.png'
function FirstPage() {
  const router = useRouter();
  useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();

      if (data.success) {
        console.log('success in first page',data.userId)
        router.replace(`/home/${data.userId}`);
      } else {
        router.replace(`/login`);
      }
    } catch (error) {
      router.replace("/login");
    }
  }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
    <div className="firstPagelogo bg-black min-h-screen flex flex-col items-center justify-center">
      <Image src={firstPageLogo} width={300} height={300} alt="Logo" className="rounded-full" />
      {/* <h2 className="font-bold text-orange-500 text-center mt-10">
        Hello world
      </h2> */}
    </div>
    </>
  );
}
export default FirstPage;
//first page 

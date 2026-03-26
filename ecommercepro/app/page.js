"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useEffect } from "react";
// import Image from "next/image";
import OIP from "../public/OIP.webp";
function FirstPage() {
  const router = useRouter();
  useEffect(() => {
  const timer = setTimeout(async () => {
    try {
      const res = await fetch("/api/auth");
      const data = await res.json();

      if (data.success) {
        router.replace(`/home/${data.userId}`);
      } else {
        router.replace(`/login`);
      }
    } catch (error) {
      router.replace("/login");
    }
  }, 100);
    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      <div className="firstPagelogo">
        <Image src={OIP} alt="Logo" />
        {/* <h2 className="font-bold text-orange-500 text-center mt-40">Hello world</h2> */}
      </div>
    </>
  );
}
export default FirstPage;
//first page 
"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useSelector } from "react-redux";
export default function CartBadge() {
const {id}=useParams()
const selector=useSelector((state)=>state.cart.items);
  return (
    <>
        <Link  href={`/dashboard/${id}/cart`} className="absolute bottom-7 right-4 z-[9999] bg-gradient-to-r from-green-400-500 to-green-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 active:scale-95">
            🛒 cart
            <span className="relative bg-rose-500 rounded-full px-2">
                {selector.length > 0 ? selector.length : 0}
            </span>
        </Link>
    </>
  );
}

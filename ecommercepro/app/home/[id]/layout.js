"use client";
import { useParams, usePathname, useRouter} from "next/navigation";
import { Home, Search, MessageCircle, ShoppingBag, User, Settings, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";

export default function RootLayoutt({ children }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  const mainRef = useRef(null);

  const { user } = useAuth();

  // Save scroll position before navigating away
  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;

    // Restore saved scroll position for this route
    const saved = sessionStorage.getItem(`scroll:${pathname}`);
    if (saved) {
      el.scrollTop = parseInt(saved, 10);
    } else {
      el.scrollTop = 0;
    }

    // Save scroll position when user scrolls
    const handleScroll = () => {
      sessionStorage.setItem(`scroll:${pathname}`, el.scrollTop);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [pathname]);
  
  // check if current page is one of the allowed mobile nav pages
  const allowedPaths = [
    `/home/${id}`,
    `/home/${id}/search`,
    `/home/${id}/chatt`,
    `/home/${id}/profile`,
    `/home/${id}/setting`
  ];
  const showMobileNav = allowedPaths.includes(pathname);

  const handleNav = (href) => {
    if (pathname === href) {
      // Same page: scroll to top
      mainRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      router.push(href);
      // No router.refresh() — prevents full page remount
    }
  };

  return (
    <div className="bg-black text-white h-screen flex overflow-hidden">

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-full fixed left-0 top-0 bg-black border-r border-gray-800 p-6 gap-6">
        <h1 className="text-2xl font-bold">Instagram</h1>

        <button onClick={() => handleNav(`/home/${id}`)} className="text-left hover:text-gray-400">Home</button>
        <button onClick={() => handleNav(`/home/${id}/search`)} className="text-left hover:text-gray-400">Search</button>
        <button onClick={() => handleNav(`/home/${id}/chatt`)} className="text-left hover:text-gray-400">Messages</button>
        <button onClick={() => handleNav(`/dashboard/${id}`)} className="text-left hover:text-gray-400">Shopping</button>
        <button onClick={() => handleNav(`/home/${id}/setting`)} className="text-left hover:text-gray-400">Settings</button>
        <button onClick={() => handleNav(`/home/${id}/profile`)} className="text-left hover:text-gray-400">Profile</button>
        {user?.role === "admin" && (
          <button onClick={() => handleNav(`/admin/verify`)} className="text-left text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-2">
            Admin Panel
          </button>
        )}
      </nav>

      {/* Scroll Container */}
      <main ref={mainRef} className="flex-1 md:ml-64 h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar">
        {children}
      </main>

      {/* mobile Bottom Navbar */}
      {showMobileNav && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black/95 backdrop-blur-md border-t border-gray-800 flex justify-around items-center py-4 px-2 pb-6 z-50">
          <button onClick={() => handleNav(`/home/${id}`)} className="text-white hover:text-gray-400 active:scale-90 transition-transform">
            <Home size={28} strokeWidth={2} />
          </button>
          <button onClick={() => handleNav(`/home/${id}/search`)} className="text-white hover:text-gray-400 active:scale-90 transition-transform">
            <Search size={28} strokeWidth={2} />
          </button>
          <button onClick={() => handleNav(`/home/${id}/chatt`)} className="text-white hover:text-gray-400 active:scale-90 transition-transform">
            <MessageCircle size={28} strokeWidth={2} />
          </button>
          <button onClick={() => handleNav(`/dashboard/${id}`)} className="text-white hover:text-gray-400 active:scale-90 transition-transform">
            <ShoppingBag size={28} strokeWidth={2} />
          </button>
          <button onClick={() => handleNav(`/home/${id}/profile`)} className="text-white hover:text-gray-400 active:scale-90 transition-transform">
            <User size={28} strokeWidth={2} />
          </button>
          {user?.role === "admin" && (
            <button onClick={() => handleNav(`/admin/verify`)} className="text-emerald-400 hover:text-emerald-300 active:scale-90 transition-transform">
              <ShieldCheck size={28} strokeWidth={2} />
            </button>
          )}
          <button onClick={() => handleNav(`/home/${id}/setting`)} className="text-white hover:text-gray-400 active:scale-90 transition-transform">
            <Settings size={28} strokeWidth={2} />
          </button>
        </nav>
      )}
    </div>
  );
}

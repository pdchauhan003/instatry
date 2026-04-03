"use client";
import { useParams, usePathname, useRouter} from "next/navigation";
import SocketProvider from "@/app/SocketProvider";

export default function RootLayoutt({ children }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router = useRouter();
  // check if current page is Home
  const isHomePage = pathname === `/home/${id}`;

  const handleNav = (href) => {
    if (pathname === href) {
      // Force a hard reload if we are already on the current page
      window.location.href = href;
    } else {
      router.push(href);
      router.refresh();
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
      </nav>

      {/* Scroll Container */}
      <main className="flex-1 md:ml-64 h-full overflow-y-auto pb-20 md:pb-0 no-scrollbar">
        <SocketProvider>
          {children}
        </SocketProvider>
      </main>

      {/* mobile Bottom Navbar (Home only) */}
      {isHomePage && (
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t border-gray-800 flex justify-around py-3">
          <button onClick={() => handleNav(`/home/${id}`)} className="hover:text-gray-400">Home</button>
          <button onClick={() => handleNav(`/home/${id}/search`)} className="hover:text-gray-400">Search</button>
          <button onClick={() => handleNav(`/home/${id}/chatt`)} className="hover:text-gray-400">Chat</button>
          <button onClick={() => handleNav(`/home/${id}/profile`)} className="hover:text-gray-400">Profile</button>
          <button onClick={() => handleNav(`/home/${id}/setting`)} className="hover:text-gray-400">Settings</button>
        </nav>
      )}
    </div>
  );
}
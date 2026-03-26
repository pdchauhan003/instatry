"use client";
import Link from "next/link";
import { useParams, usePathname, useRouter} from "next/navigation";
import SocketProvider from "@/app/SocketProvider";

export default function RootLayoutt({ children }) {
  const { id } = useParams();
  const pathname = usePathname();
  const router=useRouter();
  // check if current page is Home
  const isHomePage = pathname === `/home/${id}`;

  return (
    <div className="bg-black text-white h-screen flex overflow-hidden">

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 h-full fixed left-0 top-0 bg-black border-r border-gray-800 p-6 gap-6">
        <h1 className="text-2xl font-bold">Instagram</h1>

        <Link href={`/home/${id}`} prefetch>Home</Link>
        <Link href={`/home/${id}/search`} prefetch>Search</Link>
        <Link href={`/home/${id}/chatt`} prefetch>Messages</Link>
        <Link href={`/dashboard/${id}`} prefetch>Shopping</Link>
        <Link href={`/home/${id}/setting`} prefetch>Settings</Link>
        <Link href={`/home/${id}/profile`} prefetch>Profile</Link>
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
          <Link href={`/home/${id}`} prefetch>Home</Link>
          <Link href={`/home/${id}/search`} prefetch>Search</Link>
          <Link href={`/home/${id}/chatt`} prefetch>Chat</Link>
          <Link href={`/home/${id}/profile`} prefetch>Profile</Link>
          <Link href={`/home/${id}/setting`} prefetch>Settings</Link>
        </nav>
      )}
    </div>
  );
}
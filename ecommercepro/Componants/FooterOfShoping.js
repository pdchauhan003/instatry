import { Home, User, Settings } from "lucide-react";

export default function ResponsiveNavbar() {
  const navItems = [
    { name: "Home", icon: <Home size={20} /> },
    { name: "Profile", icon: <User size={20} /> },
    { name: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* sidebar  */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 h-full w-64 bg-gray-900 text-white p-5">
        <h1 className="text-xl font-bold mb-8">My App</h1>

        <nav className="flex flex-col gap-4">
          {navItems.map((item, index) => (
            <button
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-700 transition"
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* bottom navbar  */}
      <div className="md:hidden fixed bottom-0 left-0 w-full bg-gray-900 text-white flex justify-around py-3 border-t border-gray-700">
        {navItems.map((item, index) => (
          <button
            key={index}
            className="flex flex-col items-center text-sm"
          >
            {item.icon}
            <span>{item.name}</span>
          </button>
        ))}
      </div>
    </>
  );
}
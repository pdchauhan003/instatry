"use client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { 
  ChevronLeft, 
  Lock, 
  Bookmark, 
  LogOut, 
  ChevronRight,
  User,
  Settings,
  Bell,
  Shield
} from "lucide-react";

function SettingPage() {
  const { id } = useParams();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const res = await fetch(`/api/auth/home/${id}/setting/logout`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Logout failed");
      const data = await res.json();
      if (data?.success) {
        toast.success('logout success')
        router.replace("/login");
        router.refresh();
      }
    } catch (error) {
      toast.error('logout failed')
      console.error("Logout error:", error);
    }
  };

  const navTo = (path) => {
    router.push(`/home/${id}/setting/${path}`);
  };

  const SettingsItem = ({ icon: Icon, label, onClick, color = "text-white" }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 hover:bg-white/5 active:bg-white/10 transition-colors border-b border-gray-900 last:border-0"
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-lg bg-gray-900 ${color}`}>
          <Icon size={20} />
        </div>
        <span className={`text-sm font-medium ${color}`}>{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-600" />
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      <div className="w-full max-w-xl border-x border-gray-900 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-md border-b border-gray-900 px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-bold">Settings and activity</h1>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {/* Account Section */}
          <div className="mt-4 px-4 pb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              How you use Instagram
            </h2>
            <div className="bg-gray-950/30 rounded-2xl border border-gray-900 overflow-hidden">
              <SettingsItem 
                icon={Bookmark} 
                label="Saved" 
                onClick={() => navTo('savedposts')} 
              />
              <SettingsItem 
                icon={Bell} 
                label="Notifications" 
                onClick={() => {}} 
              />
            </div>
          </div>

          {/* Security Section */}
          <div className="mt-6 px-4 pb-2">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              Who can see your content
            </h2>
            <div className="bg-gray-950/30 rounded-2xl border border-gray-900 overflow-hidden">
              <SettingsItem 
                icon={Lock} 
                label="Change Password" 
                onClick={() => navTo('passchange')} 
              />
              <SettingsItem 
                icon={Shield} 
                label="Account Privacy" 
                onClick={() => {}} 
              />
            </div>
          </div>

          {/* Action Section */}
          <div className="mt-6 px-4 pb-10">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 mb-2">
              Login
            </h2>
            <div className="bg-gray-950/30 rounded-2xl border border-gray-900 overflow-hidden">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-4 p-4 hover:bg-red-500/10 active:bg-red-500/20 transition-colors text-red-500"
              >
                <div className="p-2 rounded-lg bg-red-500/10">
                  <LogOut size={20} />
                </div>
                <span className="text-sm font-bold">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingPage;

'use client'
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Lock, ShieldCheck, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

function PassChange() {
  const router = useRouter();
  const { id } = useParams();
  const [oldpassword, setOldpassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePass = async (e) => {
    e.preventDefault();
    if (password !== confirmPass) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/home/${id}/setting/passchange`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldpassword, password, confirmPass })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password updated successfully");
        router.back();
      } else {
        toast.error(data.message || "Failed to update password");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-lg font-bold">Change Password</h1>
        </div>

        <div className="flex-1 flex flex-col items-center px-6 pt-10">
          <div className="mb-8 p-4 bg-blue-500/10 rounded-full text-blue-500">
            <ShieldCheck size={48} />
          </div>
          
          <h2 className="text-xl font-bold mb-2">Security check</h2>
          <p className="text-gray-400 text-center text-sm mb-8 px-4">
            Protect your account with a strong password. You'll be logged out of other devices after changing.
          </p>

          <form onSubmit={handleChangePass} className="w-full space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Current Password</label>
              <div className="relative">
                <input 
                  type="password" 
                  value={oldpassword} 
                  onChange={(e) => setOldpassword(e.target.value)}
                  placeholder="Old password"
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 ml-1">Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPass} 
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-gray-900/50 border border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={loading}
              className={`w-full mt-6 py-3 rounded-xl font-bold text-sm transition-all ${
                loading 
                ? "bg-blue-600/50 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-500 active:scale-[0.98]"
              }`}
            >
              {loading ? "Updating..." : "Change Password"}
            </button>
          </form>

          <div className="mt-8 flex items-start gap-2 px-4 py-3 bg-gray-900/30 rounded-xl border border-gray-900/50">
            <AlertCircle size={18} className="text-gray-500 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-500 leading-relaxed">
              Your password must be at least 6 characters and should include a combination of numbers, letters and special characters (!$@%).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PassChange;
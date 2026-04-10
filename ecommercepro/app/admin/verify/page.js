"use client";

import { useEffect, useState } from "react";

export default function AdminVerifySellers() {
  const [pendingSellers, setPendingSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPendingSellers = async () => {
    try {
      const res = await fetch("/api/auth/shoping/admin/pending-sellers");
      const data = await res.json();
      if (res.ok) {
        setPendingSellers(data);
      } else {
        setError(data.error || "Failed to fetch pending sellers");
      }
    } catch (err) {
      setError("An error occurred while fetching sellers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSellers();
  }, []);

  const handleAction = async (userId, action) => {
    try {
      const res = await fetch("/api/auth/shoping/admin/approve-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`User ${action}ed!`);
        fetchPendingSellers(); // Refresh list
      } else {
        alert(data.error || `Failed to ${action} user`);
      }
    } catch (err) {
      alert("Error taking action.");
    }
  };

  if (loading) return <div className="p-8 text-center">Loading pending requests...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">
          Admin: Seller Verification Requests
        </h1>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

        {pendingSellers.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No pending requests found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b">User</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingSellers.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-b">
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">@{user.username}</div>
                    </td>
                    <td className="p-3 border-b text-gray-600">{user.email}</td>
                    <td className="p-3 border-b space-x-2">
                      <button
                        onClick={() => handleAction(user._id, "approve")}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(user._id, "reject")}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all shadow-sm"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

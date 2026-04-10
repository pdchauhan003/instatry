"use client";

import { useEffect, useState } from "react";

export default function AdminVerifySellers() {
  const [activeTab, setActiveTab] = useState("pending"); // "pending" | "sellers"

  // --- Pending Requests State ---
  const [pendingSellers, setPendingSellers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingError, setPendingError] = useState("");

  // --- Seller List State ---
  const [sellers, setSellers] = useState([]);
  const [sellersLoading, setSellersLoading] = useState(false);
  const [sellersError, setSellersError] = useState("");

  // --- Fetch Pending Requests ---
  const fetchPendingSellers = async () => {
    setPendingLoading(true);
    setPendingError("");
    try {
      const res = await fetch("/api/auth/shoping/admin/pending-sellers");
      const data = await res.json();
      if (res.ok) {
        setPendingSellers(data);
      } else {
        setPendingError(data.error || "Failed to fetch pending sellers");
      }
    } catch {
      setPendingError("An error occurred while fetching pending sellers.");
    } finally {
      setPendingLoading(false);
    }
  };

  // --- Fetch Approved Sellers ---
  const fetchSellers = async () => {
    setSellersLoading(true);
    setSellersError("");
    try {
      const res = await fetch("/api/auth/shoping/admin/sellers");
      const data = await res.json();
      if (data.success) {
        setSellers(data.sellers);
      } else {
        setSellersError(data.error || "Failed to fetch sellers");
      }
    } catch {
      setSellersError("An error occurred while fetching sellers.");
    } finally {
      setSellersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pending") fetchPendingSellers();
    else if (activeTab === "sellers") fetchSellers();
  }, [activeTab]);

  // --- Approve / Reject Pending ---
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
        fetchPendingSellers();
      } else {
        alert(data.error || `Failed to ${action} user`);
      }
    } catch {
      alert("Error taking action.");
    }
  };

  // --- Remove Seller ---
  const handleRemoveSeller = async (userId, username) => {
    if (!confirm(`Are you sure you want to remove seller @${username}? They will become a regular user.`)) return;
    try {
      const res = await fetch("/api/auth/shoping/admin/remove-seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`@${username} has been removed as a seller.`);
        fetchSellers();
      } else {
        alert(data.error || "Failed to remove seller");
      }
    } catch {
      alert("Error removing seller.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500 mt-1">Manage seller verifications and active sellers</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm ${
              activeTab === "pending"
                ? "bg-indigo-600 text-white shadow-indigo-200 shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            ⏳ Pending Requests
            {pendingSellers.length > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                {pendingSellers.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sellers")}
            className={`px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-sm ${
              activeTab === "sellers"
                ? "bg-emerald-600 text-white shadow-emerald-200 shadow-md"
                : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
            }`}
          >
            🏪 Seller List
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">

          {/* --- PENDING TAB --- */}
          {activeTab === "pending" && (
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-3">
                Seller Verification Requests
              </h2>
              {pendingError && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{pendingError}</div>
              )}
              {pendingLoading ? (
                <div className="text-center py-10 text-gray-400">Loading...</div>
              ) : pendingSellers.length === 0 ? (
                <p className="text-gray-500 text-center py-10">✅ No pending requests.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">User</th>
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">Email</th>
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingSellers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 border-b">
                            <div className="font-medium text-gray-800">{user.name}</div>
                            <div className="text-xs text-gray-500">@{user.username}</div>
                          </td>
                          <td className="p-3 border-b text-gray-600 text-sm">{user.email}</td>
                          <td className="p-3 border-b space-x-2">
                            <button
                              onClick={() => handleAction(user._id, "approve")}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleAction(user._id, "reject")}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
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
            </>
          )}

          {/* --- SELLER LIST TAB --- */}
          {activeTab === "sellers" && (
            <>
              <div className="flex items-center justify-between mb-4 border-b pb-3">
                <h2 className="text-xl font-bold text-gray-800">Active Sellers</h2>
                <button
                  onClick={fetchSellers}
                  className="text-sm text-emerald-600 hover:underline font-medium"
                >
                  🔄 Refresh
                </button>
              </div>
              {sellersError && (
                <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{sellersError}</div>
              )}
              {sellersLoading ? (
                <div className="text-center py-10 text-gray-400">Loading sellers...</div>
              ) : sellers.length === 0 ? (
                <p className="text-gray-500 text-center py-10">No active sellers found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">Seller</th>
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">Email</th>
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">Status</th>
                        <th className="p-3 border-b text-sm font-semibold text-gray-600">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellers.map((seller) => (
                        <tr key={seller._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 border-b">
                            <div className="font-medium text-gray-800">{seller.name}</div>
                            <div className="text-xs text-gray-500">@{seller.username}</div>
                          </td>
                          <td className="p-3 border-b text-gray-600 text-sm">{seller.email}</td>
                          <td className="p-3 border-b">
                            <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">
                              {seller.verificationStatus || seller.role}
                            </span>
                          </td>
                          <td className="p-3 border-b">
                            <button
                              onClick={() => handleRemoveSeller(seller._id, seller.username)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-md text-sm font-semibold transition-all"
                            >
                              Remove Seller
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

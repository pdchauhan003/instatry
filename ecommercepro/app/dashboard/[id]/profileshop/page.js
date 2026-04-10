"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

function ProductFormForShoping() {
  const [isSeller, setIsSeller] = useState(false);
  const { id } = useParams();
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!id) return;
    const checkSellerStatus = async () => {
      try {
        const res = await fetch("/api/auth/shoping/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        const data = await res.json();
        if (data.status === "approved") {
          setIsSeller(true);
        }
      } catch (error) {
        console.error("Error checking seller status:", error);
      }
    };
    checkSellerStatus();
  }, [id]);

  useEffect(() => {
    if (showForm) {
      router.push(`/dashboard/${id}/profileshop/sform`);
    }
  }, [showForm, id, router]);

  return (
    <>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Profile</h2>

        {!isSeller ? (
          <div className="bg-blue-50 p-4 rounded-lg mb-6 border border-blue-100">
            <p className="text-blue-800 mb-3 font-medium">
              If you want to add your product for sale then click to verify seller profile
            </p>
            <Button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition-all shadow-md">
              Verify seller
            </Button>
          </div>
        ) : (
          <div className="bg-green-50 p-4 rounded-lg mb-6 border border-green-200 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
              ✓
            </div>
            <div>
              <p className="text-green-800 font-bold text-lg">
                Verified Seller
              </p>
              <p className="text-green-600 text-sm">
                You can now add and manage your products.
              </p>
            </div>
          </div>
        )}

        <h2 className="text-lg font-semibold mt-4">Your total orders</h2>
        <p className="text-gray-500 italic">No orders found yet</p>
      </div>
    </>
  );
}

export default ProductFormForShoping;

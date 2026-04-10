"use client";

import { useEffect, useState } from "react";
import { useRouter,useParams } from "next/navigation";

export default function VerifyKYC() {
  const [status, setStatus] = useState("loading");
  const router = useRouter();
    const {id}=useParams();
  const fetchStatus = async () => {
    const res = await fetch("/api/auth/shoping/status",{
        method:"POST",
        body:JSON.stringify({id})
    });
    const data = await res.json();
    
    setStatus(data.status);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStatus();

    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (status === "approved") {
      router.push(`/dashboard/${id}/addproduct`);
    }
  }, [status, id, router]);

  if (status === "loading") return <p>Loading...</p>;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md text-center w-full max-w-md">

        <h1 className="text-xl font-bold mb-4">
          Seller Verification Status
        </h1>

        {/* NOT PAID / INITIAL STATE */}
        {status === "none" && (
          <>
            <p className="text-blue-600 font-semibold">
              🔄 Processing Terms Acceptance...
            </p>
            <p className="text-sm mt-2 text-gray-500">
              If the scanner did not open, please go back and try again.
            </p>
          </>
        )}

        {/* WAITING FOR APPROVAL */}
        {(status === "Pending" || status === "pending") && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl text-yellow-600">⏳</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Payment Successful!</h2>
              <p className="text-yellow-600 font-semibold mt-2">
                Waiting for admin approval
              </p>
              <p className="text-sm text-gray-500 mt-4 px-4">
                Your request has been sent for verification. You will see the "Add Product" option in your navbar once approved.
              </p>
            </div>
          </>
        )}

        {/* REJECTED */}
        {status === "rejected" && (
          <>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-3xl text-red-600">❌</span>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Verification Rejected</h2>
              <p className="text-red-500 mt-2">
                Admin has rejected your request.
              </p>
              <button
                onClick={() => router.push(`/dashboard/${id}/profileshop/sform`)}
                className="bg-gray-800 text-white px-6 py-2 mt-6 rounded-lg hover:bg-gray-900 transition-colors"
              >
                Go Back to Terms
              </button>
            </div>
          </>
        )}

        {/* APPROVED (Redirect happens in useEffect) */}
        {status === "approved" && (
          <p className="text-green-600 font-bold">✅ Approved! Redirecting...</p>
        )}

      </div>
    </div>
  );
}
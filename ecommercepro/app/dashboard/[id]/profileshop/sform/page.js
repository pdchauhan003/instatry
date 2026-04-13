"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function TermsPage() {
  const [accepted, setAccepted] = useState(false);
  const router = useRouter();
  const { id } = useParams();
  const handleSubmit = async () => {
    try {
      // 1. Accept Terms
      await fetch("/api/auth/shoping/terms/accept", {
        method: "POST",
        body: JSON.stringify({ id })
      });

      // 2. Create Razorpay Order
      const orderRes = await fetch("/api/auth/shoping/create-order", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const order = await orderRes.json();

      if (!order || !order.id) {
        throw new Error("Failed to create Razorpay order");
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Seller Verification",
        description: "Pay ₹1 to verify your account",
        order_id: order.id,
        handler: async function (response) {
          // 4. Verify Payment
          const verifyRes = await fetch("/api/auth/shoping/verify-payment", {
            method: "POST",
            body: JSON.stringify({ ...response, userId: id }),
          });

          const data = await verifyRes.json();
          if (data.success) {
            router.push(`/dashboard/${id}/profileshop/sform/verify-kyc`);
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: function () {
            alert("Payment cancelled. You must pay ₹1 to become a seller.");
          }
        },
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error) {
      console.error("Verification flow error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="bg-white p-6 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-xl font-bold mb-4">
          Terms & Conditions
        </h1>

        <div className="h-40 overflow-y-scroll border p-3 mb-4 text-sm">
          <p>
            • Only genuine products allowed <br />
            • No illegal items <br />
            • Admin can reject anytime <br />
            • ₹1 verification non-refundable
          </p>
        </div>

        <label className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            checked={accepted}
            onChange={() => setAccepted(!accepted)}
          />
          I accept Terms & Conditions
        </label>

        <button
          disabled={!accepted}
          onClick={handleSubmit}
          className={`w-full py-2 text-white rounded ${accepted ? "bg-blue-600" : "bg-gray-400"
            }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
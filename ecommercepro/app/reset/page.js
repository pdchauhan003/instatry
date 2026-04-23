"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handlePasschange = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/login");
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

        <h2 className="text-2xl font-bold text-center mb-2">
          Reset Password
        </h2>

        <p className="text-gray-500 text-center mb-6 text-sm">
          Set a new password for <span className="font-medium">{email}</span>
        </p>

        <div className="relative">
          <input
            type={show ? "text" : "password"}
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            className="w-full border border-gray-300 rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <span
            onClick={() => setShow(!show)}
            className="absolute right-3 top-3 cursor-pointer text-gray-500 text-sm"
          >
            {show ? "Hide" : "Show"}
          </span>
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-3 text-center">
            {error}
          </p>
        )}

        <button
          onClick={handlePasschange}
          disabled={loading || password.length < 6}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          Remember your password?{" "}
          <span
            onClick={() => router.push("/login")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>

      </div>
    </div>
  );
}

function Reset() {
  return (
    <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
      <ResetContent />
    </Suspense>
  );
}

export default Reset;

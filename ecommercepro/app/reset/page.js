"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetContent() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email");
  const [password, setPassword] = useState("");
  const handlePasschange = async () => {
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.success) {
      router.push("/login");
    } else {
      console.log(data.message);
      alert(data.message);
    }
  };
  return (
    <>
      <h2>Reset Password</h2>
      <input
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handlePasschange}>Update</button>
    </>
  );
}

function Reset() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetContent />
    </Suspense>
  );
}

export default Reset;

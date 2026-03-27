"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
function RegisterPage() {
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState(null);
  const router = useRouter();
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("password", password);
      formData.append("number", number);
      formData.append("username", username);
      formData.append("image", image);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert("User Registered.........", data.message);
        try {
          const resp = await fetch(
            "/api/auth/varification/afterregister/send-otp",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            },
          );
          const data = await resp.json();
          if (data.success) {
            router.push(`/varification/afterregister?email=${email}`);
          } else {
            console.log("error to send otp after register");
            alert("error to send otp after register");
          }
        } catch (error) {
          console.log("error in sending otp...");
          alert("error in sending otp...");
        }
      } else {
        alert("error in server..", data.message);
      }
    } catch (error) {
      console.log("server error...", error);
      alert("server error.............");
    }
  };
  return (
    <>
      <div className="h-screen overflow-y-auto flex justify-center px-4 py-10">
        <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-md">
          {/* Back Button */}
          <button className="mb-3">
            <ArrowLeft className="text-gray-600" />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sign Up</h2>
            <p className="text-gray-400 text-sm mt-1">
              Create account and choose favourite menu
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4 over">
            {/* Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                UserName
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="John Doe"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="johndoe@email.com"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Number */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Number
              </label>
              <input
                type="number"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="9876543210"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>
            
            {/* profile picture */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Profile Picture
              </label>
              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                required
              />
            </div>
          </form>

          {/* Register Button */}
          <button
            onClick={handleSubmit}
            className="w-full bg-purple-700 text-white py-3 rounded-full mt-6 font-semibold hover:bg-purple-800 transition"
          >
            Register
          </button>

          {/* Login Redirect */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Have an account?
            <Link href="/login" className="text-purple-700 font-semibold ml-1">
              Sign In
            </Link>
          </p>

          {/* Terms */}
          <div className="text-center text-xs text-gray-400 mt-6">
            <p>By clicking Register, you agree to our</p>
            <p className="text-purple-600 font-medium">Terms, Data Policy</p>
          </div>
        </div>
      </div>
    </>
  );
}
export default RegisterPage;

"use client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signIn } from "next-auth/react";
// import { toast } from "react-hot-toast";
import { loginSchema } from "@/zodschemas/authSchema";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const { login, isLoading } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
  }, []);

  const handleClick = async (e) => {
    e.preventDefault();
    //validate data
    const result=loginSchema.safeParse({email,password});
    if(!result.success){
      const errors = result.error.flatten().fieldErrors;
      if (errors.email) {
        toast.error(errors.email[0]);
      }
      if (errors.password) {
        toast.error(errors.password[0]);
      }
      return;
    }
   // Login API
  const loginResult = await login(email, password);
  if (loginResult && loginResult.forgot) {
    setShowForgot(true);
  }
  };

  const forgotPassword = async () => {
    await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    router.push(`/otp?email=${email}`);
  };

  if (!isMounted) {
    return null; // Or a loading skeleton
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome Back 👋
            </h2>
            <p className="text-gray-400 text-sm">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleClick}>
            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              />
            </div>
          

          {/* Forgot Password */}
          {showForgot && (
            <button
              onClick={forgotPassword}
              className="text-sm text-purple-600 mt-3 hover:underline"
            >
              Forgot Password?
            </button>
          )}

          {/* Login Button */}
          <button type="submit"
            disabled={isLoading}
            className={`w-full ${isLoading ? 'bg-purple-400' : 'bg-purple-700 hover:bg-purple-800'} text-white py-3 rounded-full mt-6 font-semibold transition flex justify-center items-center gap-2`}
          >
            {isLoading ? (
              <>
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : "Login"}
          </button>
          {/* </button> */}
          </form>

          {/* Sign Up */}
          <p className="text-center text-sm text-gray-500 mt-5">
            Dont have an account?
            <Link
              href="/register"
              className="text-purple-700 font-semibold ml-1"
            >
              Sign Up
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="px-3 text-gray-400 text-sm">Or with</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <button onClick={() => signIn("google", { callbackUrl: "/" })} className="w-full border py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100">
              Sign in with Google
            </button>
            
            <button className="w-full border py-2 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-100">
              {/* <img src="" className="w-5" alt="apple" /> */}
              Sign in with Apple
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default LoginPage;

'use client'
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function Congratulation() {
  const router = useRouter();

  const handleButton = () => {
    router.push('/login');
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4">
      
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full text-center">

        {/* Success Icon */}
        <div className="flex justify-center mb-4">
          <CheckCircle className="text-green-500 w-16 h-16" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Congratulations 🎉
        </h1>

        {/* Subtext */}
        <p className="text-gray-500 text-sm mb-6">
          Your account has been successfully created. You can now login and start using the app.
        </p>

        {/* Button */}
        <button
          onClick={handleButton}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-semibold transition duration-300"
        >
          Get Started
        </button>

      </div>

    </div>
  );
}

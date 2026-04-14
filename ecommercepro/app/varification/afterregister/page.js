// 'use client'
// import { useRouter, useSearchParams } from "next/navigation";
// import { useState, useRef, Suspense } from "react";
// import { ArrowLeft } from 'lucide-react';

// function AfterRegistrationContent() {
//   const router = useRouter();
//   const params = useSearchParams();
//   const email = params.get('email');

//   const [otp, setOtp] = useState(Array(6).fill(""));
//   const inputsRef = useRef([]);

//   const handleChange = (value, index) => {
//     if (!/^\d?$/.test(value)) return;

//     const newOtp = [...otp];
//     newOtp[index] = value;
//     setOtp(newOtp);

//     // auto focus next
//     if (value && index < 5) {
//       inputsRef.current[index + 1].focus();
//     }
//   };

//   const handleBackspace = (e, index) => {
//     if (e.key === "Backspace" && !otp[index] && index > 0) {
//       inputsRef.current[index - 1].focus();
//     }
//   };

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     const finalOtp = otp.join("");

//     try {
//       const res = await fetch('/api/auth/verify-otp', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ email, otp: finalOtp })
//       });

//       const data = await res.json();

//       if (data.success) {
//         router.push('/varification/congratulation');
//       } else {
//         alert(data.message || "Invalid OTP");
//       }
//     } catch (error) {
//       alert("Something went wrong");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-300 px-4">
//       <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
//         {/* Back Button */}
//         <button className="mb-4" onClick={() => router.back()}>
//           <ArrowLeft className="text-gray-600" />
//         </button>

//         {/* Header */}
//         <h2 className="text-2xl font-bold text-gray-900">
//           Verify OTP
//         </h2>

//         <p className="text-gray-400 text-sm mt-2">
//           Enter the 6-digit code sent to
//         </p>

//         <p className="text-purple-700 font-medium text-sm mt-1 break-all">
//           {email}
//         </p>

//         {/* OTP Input */}
//         <div className="flex justify-center gap-3 my-6">
//           {otp.map((digit, i) => (
//             <input
//               key={i}
//               ref={(el) => (inputsRef.current[i] = el)}
//               type="text"
//               maxLength="1"
//               value={digit}
//               onChange={(e) => handleChange(e.target.value, i)}
//               onKeyDown={(e) => handleBackspace(e, i)}
//               className="w-12 h-12 text-center text-lg font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
//             />
//           ))}
//         </div>

//         {/* Resend */}
//         <p className="text-sm text-gray-400 mb-5">
//           Didn’t receive code?
//           <span className="text-purple-700 font-semibold cursor-pointer ml-1 hover:underline">
//             Resend
//           </span>
//         </p>

//         {/* Button */}
//         <button
//           onClick={handleVerify}
//           className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-full font-semibold transition duration-300"
//         >
//           Verify & Continue
//         </button>

//       </div>
//     </div>
//   );
// }

// function AfterRegistration() {
//   return (
//     <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
//       <AfterRegistrationContent />
//     </Suspense>
//   );
// }

// export default AfterRegistration;



'use client'
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OtpContent() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [timer, setTimer] = useState(0); // ⏱ cooldown timer

    const router = useRouter();
    const params = useSearchParams();
    const email = params.get('email');

    // ⏱ Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timer]);

    // ✅ Verify OTP
    const verifyOtp = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/reset?email=${email}`);
            } else {
                setError(data.message);
            }
        } catch {
            setError('Something went wrong');
        }

        setLoading(false);
    };

    // 🔁 Resend OTP (with cooldown + limit handling)
    const resendOtp = async () => {
        if (timer > 0) return; // ⛔ prevent spam

        setResendLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage(data.message);
                setTimer(30); // ⏱ 30 sec cooldown
            } else {
                setError(data.message);

                // 🚫 If limit reached → disable resend for long time
                if (data.message.includes("Limit reached")) {
                    setTimer(86400); // 24h lock (optional UI)
                }
            }
        } catch {
            setError('Something went wrong');
        }

        setResendLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

                <h2 className="text-2xl font-bold text-center mb-2">
                    Verify OTP
                </h2>

                <p className="text-gray-500 text-center mb-6 text-sm">
                    Enter OTP sent to <span className="font-medium">{email}</span>
                </p>

                <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-widest text-lg border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* ❌ Error */}
                {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
                )}

                {/* ✅ Success */}
                {message && (
                    <p className="text-green-500 text-sm mt-2 text-center">{message}</p>
                )}

                <button
                    onClick={verifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                {/* 🔁 Resend Section */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    Didn’t receive OTP?{" "}
                    <span
                        onClick={resendOtp}
                        className={`text-blue-600 hover:underline ${
                            timer > 0 || resendLoading
                                ? 'opacity-50 cursor-not-allowed'
                                : 'cursor-pointer'
                        }`}
                    >
                        {resendLoading
                            ? "Sending..."
                            : timer > 0
                                ? `Resend in ${timer}s`
                                : "Resend"}
                    </span>
                </p>

            </div>
        </div>
    );
}

export default function Otp() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
            <OtpContent />
        </Suspense>
    );
}
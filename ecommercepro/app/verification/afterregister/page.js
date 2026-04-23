'use client'
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OtpContent() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const [timer, setTimer] = useState(0);

    const router = useRouter();
    const params = useSearchParams();
    const email = params.get('email');

    // Timer countdown
    useEffect(() => {
        if (timer > 0) {
            const interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [timer]);

    // verify OTP — this creates the real user account
    const verifyOtp = async () => {
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/verification/afterregister/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (data.success) {
                router.push('/verification/congratulation');
            } else {
                setError(data.message);
            }
        } catch {
            setError('Something went wrong');
        }

        setLoading(false);
    };

    // resend OTP
    const resendOtp = async () => {
        if (timer > 0) return; 

        setResendLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await fetch('/api/auth/verification/afterregister/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage(data.message);
                setTimer(30);
            } else {
                setError(data.message);

                if (data.message.includes("limit") || data.message.includes("Limit")) {
                    setTimer(300); // 5 min cooldown on limit
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
                    Verify Your Email
                </h2>

                <p className="text-gray-500 text-center mb-6 text-sm">
                    Enter OTP sent to <span className="font-medium">{email}</span> to complete registration
                </p>

                <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-widest text-lg border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* error */}
                {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
                )}

                {/* success */}
                {message && (
                    <p className="text-green-500 text-sm mt-2 text-center">{message}</p>
                )}

                <button
                    onClick={verifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                </button>

                {/* Resend Section */}
                <p className="text-center text-sm text-gray-400 mt-4">
                    Didnt receive OTP?{" "}
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

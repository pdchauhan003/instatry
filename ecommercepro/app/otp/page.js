'use client'
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function OtpContent() {
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const router = useRouter();
    const params = useSearchParams();
    const email = params.get('email');

    const verifyOtp = async () => {
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (data.success) {
                router.push(`/reset?email=${email}`);
            } else {
                setError(data.message || 'Invalid OTP');
            }
        } catch (err) {
            setError('Something went wrong');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">

                <h2 className="text-2xl font-bold text-center mb-2">
                    Verify OTP
                </h2>

                <p className="text-gray-500 text-center mb-6 text-sm">
                    Enter the OTP sent to <span className="font-medium">{email}</span>
                </p>

                <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center tracking-widest text-lg border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {error && (
                    <p className="text-red-500 text-sm mt-3 text-center">
                        {error}
                    </p>
                )}

                <button
                    onClick={verifyOtp}
                    disabled={loading || otp.length < 6}
                    className="w-full mt-6 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Verifying...' : 'Verify OTP'}
                </button>

                <p className="text-center text-sm text-gray-400 mt-4">
                    Didn’t receive OTP? <span className="text-blue-600 cursor-pointer hover:underline">Resend</span>
                </p>

            </div>
        </div>
    );
}

function Otp() {
    return (
        <Suspense fallback={<div className="text-center mt-10">Loading...</div>}>
            <OtpContent />
        </Suspense>
    );
}

export default Otp;
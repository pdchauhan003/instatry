'use client'
import { useRouter,useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import {ArrowLeft} from 'lucide-react';

function AfterRegistrationContent(){
    const router=useRouter();
    const params=useSearchParams();
    const email=params.get('email')
    const[otp,setOtp]=useState('');

    const handleVerify=async(e)=>{
        e.preventDefault();
        try{
            const res=await fetch('/api/auth/varification/afterregister/verify-otp',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,otp})
            })
            const data=await res.json();
            if(data.success){
                console.log('otp verified succes.....')
                router.push('/varification/congratulation')
            }
            else{
                console.log('invalid otp...')
                alert('invalid otp...',data.message)
            }
        }
        catch(error){
            console.log('error in after registration page...')
            alert('error in after registration page...')
        }
    }
    return(
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-6">

        {/* Back Button */}
        <button className="mb-3">
          <ArrowLeft className="text-gray-600" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">

          <h2 className="text-2xl font-bold text-gray-900">
            Verification Email
          </h2>

          <p className="text-gray-400 text-sm mt-2">
            Please enter the code we just sent to email
          </p>

          <p className="text-purple-700 font-medium mt-1 break-all">
            {email}
          </p>

        </div>

        {/* OTP Boxes */}
        <div className="flex justify-center gap-3 mb-5">

          {[0, 1, 2, 3, 4, 5].map((i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              value={otp[i] || ""}
              onChange={(e) => {

                const value = e.target.value.replace(/\D/, '');
                const newOtp = otp.split('');

                newOtp[i] = value;

                setOtp(newOtp.join(''));
              }}
              className="w-12 h-12 text-center text-lg font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          ))}

        </div>

        {/* Resend */}
        <div className="text-center mb-5">
          <p className="text-sm text-gray-400">
            If you didn’t receive a code?
            <span className="text-purple-700 font-semibold cursor-pointer ml-1">
              Resend
            </span>
          </p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleVerify}
          className="w-full bg-purple-700 text-white py-3 rounded-full font-semibold hover:bg-purple-800 transition"
        >
          Continue
        </button>

      </div>

    </div>
        </>
    )
}

function AfterRegistration() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AfterRegistrationContent />
    </Suspense>
  );
}

export default AfterRegistration;
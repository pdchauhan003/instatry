'use client'
import { useState } from "react";
import { useSearchParams,useRouter } from 'next/navigation'

export default function OtpClient() {

  const[otp,setOtp]=useState('');
    const router=useRouter();
    const params=useSearchParams();
    const email=params.get('email');
    console.log('email',email)
    const verifyOtp=async()=>{
        const res=await fetch('/api/auth/verify-otp',{
            method:'POST',
            body:JSON.stringify({email,otp})
        });
        const data=await res.json();
        if(data.success){
            console.log('otp varified success...',data.message)
            router.push(`/reset?email=${email}`);
        }
        else{
            console.log('error in verify otp....',data.message)
        }
    }
  return (
    <div>
      <h2>Enter OTP</h2>
            <input onChange={e=>setOtp(e.target.value)}/>
            <button onClick={verifyOtp}>Verify</button>
    </div>
  )
}

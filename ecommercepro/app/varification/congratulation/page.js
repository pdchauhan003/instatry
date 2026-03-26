'use client'
import { useRouter } from "next/navigation"

export default function Congratulation() {
    const router=useRouter();
    const handleButton=()=>{
        router.push('/login')
    }   
  return(
    <>
        <h1>Congratulation</h1>;
        <button onClick={handleButton}>Get Started</button>
    </>
  )
}
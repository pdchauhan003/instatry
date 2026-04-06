'use client'
import { useRouter } from "next/navigation";
import { useState } from "react";
import im1 from '../../public/im1.webp'
import im2 from '../../public/im2.webp'
import im3 from '../../public/im3.webp'
import Image from "next/image";
function BoardingPage(){
    const router=useRouter();
    const[current,setCurrent]=useState(0);
    const container = {
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "16px"
        }

        const skip = {
        textAlign: "right",
        cursor: "pointer",
        color: "#6D4AFF"
        }

        const sliderWrapper = {
        width: "100%",
        overflow: "hidden"
        }

        const slider = {
        display: "flex",
        width: "300%", // 3 slides
        transition: "transform 0.5s ease-in-out"
        }


        const slide = {
        width: "100vw",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center"
        }


        const image = {
        maxWidth: "80%",
        height: "auto",
        marginBottom: "20px"
        }

        const dots = {
        display: "flex",
        justifyContent: "center",
        gap: "8px"
        }

        const dot = {
        width: "10px",
        height: "10px",
        borderRadius: "50%"
        }

        const button = {
        height: "50px",
        borderRadius: "12px",
        background: "#6D4AFF",
        color: "white",
        border: "none",
        fontSize: "16px",
        cursor: "pointer"
    }
    const slides = [
        {
        title: "Now reading books will be easier",
        desc: "Discover new worlds and start reading easily.",
        image: im1
        },
        {
        title: "Your Bookish Soulmate Awaits",
        desc: "Find books tailored to your taste.",
        image: im2
        },
        {
        title: "Start Your Adventure",
        desc: "Begin your reading journey today.",
        image: im3
        }
    ]
    const nextSlide=()=>{
        if(current<slides.length-1){
            setCurrent(current+1)
        }
        else{
            router.push('/login')
        }
    }
    return(
        <>
            <div style={container}>

      {/* SKIP BUTTON */}
      <div style={skip} onClick={() => router.push("/login")}>
        Skip
      </div>

      {/* SLIDER */}
      <div style={sliderWrapper}>
        <div
          style={{
            ...slider,
            transform: `translateX(-${current * 100}%)`
          }}
        >
          {slides.map((item, index) => (
            <div key={index} style={slide}>

              <Image
                src={item.image}
                alt={item.title}
                width={300}
                height={300}
                style={image}
                priority={index === 0}
              />

              <h2>{item.title}</h2>
              <p>{item.desc}</p>
              
            </div>
          ))}
        </div>
      </div>

      {/* DOT INDICATOR */}
      <div style={dots}>
        {slides.map((_, i) => (
          <div
            key={i}
            style={{
              ...dot,
              background: current === i ? "#6D4AFF" : "#ccc"
            }}
          />
        ))}
      </div>

      {/* BUTTON */}
      <button style={button} onClick={nextSlide}>
        {current === 2 ? "Get Started" : "Continue"}
      </button>

    </div>
        </>
    )
}
export default BoardingPage;
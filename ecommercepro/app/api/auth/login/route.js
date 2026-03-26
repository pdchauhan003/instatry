
import { NextResponse } from "next/server";
import { User } from "@/lib/database.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { generateToken, generateRefreshToken } from "@/lib/jwt";
import { connectDB } from "@/lib/Connection";

export async function POST(req) {
  try {
    await connectDB();

    const { email, password } = await req.json();
    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return NextResponse.json({
        success: false,
        message: "Wrong password",
        forgot: true,
      });
    }

    const sessionId = crypto.randomBytes(32).toString("hex");
    user.sessionId = sessionId;

    const refreshToken = generateRefreshToken({ id: user._id });
    user.refreshToken = refreshToken;

    await user.save();
    try {
        await fetch("http://localhost:1212/force-logout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userId: checkUser._id.toString() })
        });
        } 
    catch (e) {
        console.log("Socket server not reachable");
    }

    const accessToken = generateToken({
      id: user._id,
      role: user.role,
      sessionId,
    });

    //Create response
    const response = NextResponse.json({
      success: true,
      role: user.role,
      id: user._id,
    });

    //Set cookies
    response.cookies.set("token", accessToken, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });

    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      path: "/",
    });

    return response;

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json({
      success: false,
      message: "Server error",
    });
  }
}



// import { NextResponse } from "next/server";
// import {User} from '@/lib/database.js';
// import crypto from 'crypto';
// import { cookies } from "next/headers";
// import bcrypt from 'bcryptjs';
// import { generateToken,generateRefreshToken } from '@/lib/jwt';
// import { connectDB } from '@/lib/Connection';

// export async function POST(req){
//     await connectDB()
//     const {email,password}=await req.json();
//     const checkUser=await User.findOne({email});
//     // console.log('person detail is :',checkUser);
//     const cookieStore = await cookies();
//     if(!checkUser){
//         return Response.json({message:'User is not registered plz register...'})
//     }
//     const passwordMatch=await bcrypt.compare(password,checkUser.password)
//     if(!passwordMatch){
//         return Response.json({message:'Password is wrong...',forgot:true})
//     }

//     const newSessionId=crypto.randomBytes(32).toString('hex');
//     checkUser.sessionId=newSessionId;

//     await checkUser.save();

//     try {
//         await fetch("http://localhost:1212/force-logout", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ userId: checkUser._id.toString() })
//         });
//         } 
//     catch (e) {
//         console.log("Socket server not reachable");
//     }
    
//     const token=generateToken({user:checkUser,sessionId:newSessionId});
//     cookieStore.set({
//       name: 'token',
//       value: token,
//       httpOnly: true,
//       path: '/',
//       maxAge: 60 * 60 * 24, // 1 day
//       sameSite: 'strict'
//     });
//     return Response.json({role:checkUser.role,id:checkUser._id,user:checkUser,success:true})
// }
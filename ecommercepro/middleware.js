// // middleware.js
import { NextResponse } from "next/server";
// import { jwtVerify } from "jose";
import jwt from 'jsonwebtoken'

export async function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/home"];
  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  try {
    // const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    // for another login account 
    // const { payload } = await jwtVerify(token, secret);

    const decode=jwt.verify(token,process.env.ACCESS_SECRET)
    const userId = decode.userId;
    const sessionId = decode.sessionId;

    const res = await fetch(`${req.nextUrl.origin}/api/auth/verify-session`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, sessionId })
    });

    const data = await res.json();
    if (!data.valid) {
      console.log('session is not verified')
      return NextResponse.redirect(new URL("/login", req.url));
    }
    else{
      console.log('session is verified')
    }
    return NextResponse.next()
  } catch (error) {
    // console.log("JWT Verify Error:", error.message);
    // return NextResponse.redirect(new URL("/login", req.url));

    const refreshRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    if (refreshRes.ok) {
      return NextResponse.next(); 
    }

    //refresh failed → logout
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*", "/home/:path*"],
};


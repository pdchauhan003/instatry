import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import redis from "@/services/redis";

export async function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/home"];
  const publicOnlyRoutes = ["/login", "/register", "/otp", "/reset", "/verification"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicOnly = publicOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 1. Handle cases with NO token
  if (!token) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // 2. Handle cases WITH token (Need verification)
  try {
    const secret = new TextEncoder().encode(process.env.ACCESS_SECRET);
    const { payload } = await jwtVerify(token, secret);
    
    const userId = payload.userId;
    const sessionId = payload.sessionId;

    // OPTIMIZED: Direct Redis check is much faster than an internal fetch + DB query
    let isValid = false;
    try {
      const storedSessionId = await redis.get(`session:${userId}`);
      isValid = storedSessionId === sessionId;
    } catch (redisError) {
      console.error("Middleware Redis error:", redisError);
      // Fallback: if redis is down, we might want to allow or hit the API
      // For now, let's just use the fetch as a fallback or assume invalid
      isValid = false; 
    }
    
    if (isValid) {
      // Session is valid
      if (isPublicOnly) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      // SECURITY: Ensure the URL's user ID matches the logged-in user's ID
      const pathSegments = pathname.split("/");
      if (pathSegments.length >= 3) {
        const urlUserId = pathSegments[2];
        if (urlUserId && urlUserId !== userId) {
          console.log(`Security: URL user (${urlUserId}) ≠ token user (${userId}). Redirecting.`);
          pathSegments[2] = userId;
          return NextResponse.redirect(new URL(pathSegments.join("/"), req.url));
        }
      }
      return NextResponse.next();
    } else {
      // Session is NOT valid (e.g., logged in on another device)
      if (isProtected) {
        const response = NextResponse.redirect(new URL("/login", req.url));
        response.cookies.delete("accessToken");
        return response;
      }
      return NextResponse.next();
    }
  } catch (error) {
    // Token verification failed, try refreshing
    try {
      const refreshRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
        method: "POST",
        headers: {
          cookie: req.headers.get("cookie") || "",
        },
      });

      if (refreshRes.ok) {
        if (isPublicOnly) {
          return NextResponse.redirect(new URL("/", req.url));
        }
        
        const response = NextResponse.next();
        const setCookies = refreshRes.headers.getSetCookie();
        for (const cookie of setCookies) {
          response.headers.append("Set-Cookie", cookie);
        }
        return response; 
      }
    } catch (refreshError) {
      console.error("Refresh error:", refreshError);
    }

    // Refresh failed or token completely invalid
    if (isProtected) {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("accessToken");
      return response;
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/home/:path*", 
    "/login", 
    "/register", 
    "/otp", 
    "/reset", 
    "/verification"
  ],
};


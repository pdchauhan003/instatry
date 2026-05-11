import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import redis from "@/services/redis";

export async function middleware(req) {
  const token = req.cookies.get("accessToken")?.value;
  // const userId = await getAuthUserId();
  const { pathname } = req.nextUrl;

  const protectedRoutes = ["/dashboard", "/home"];
  const publicOnlyRoutes = ["/login", "/register", "/otp", "/reset", "/verification"];

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isPublicOnly = publicOnlyRoutes.some((route) =>
    pathname.startsWith(route)
  );

  //  Handle NO token
  if (!token) {
    if (isProtected) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return NextResponse.next();
  }

  // Handle token 
  // Always check Redis for protected routes to ensure session revocation is instant
  const session = await verifySession(token, isProtected);

  if (session) {
    // ... (existing session logic)
    const { userId } = session;
    if (isPublicOnly) {
      return NextResponse.redirect(new URL(`/home/${userId}`, req.url));
    }
    const pathSegments = pathname.split("/");
    if (pathSegments.length >= 3) {
      const urlUserId = pathSegments[2];
      if (urlUserId && urlUserId !== userId && !pathname.startsWith("/api")) {
        console.log(`Security: URL user (${urlUserId}) ≠ token user (${userId}). Redirecting.`);
        pathSegments[2] = userId;
        return NextResponse.redirect(new URL(pathSegments.join("/"), req.url));
      }
    }
    return NextResponse.next();
  } else {
    // Session invalid/expired - try to refresh
    const refreshToken = req.cookies.get("refreshToken")?.value;
    if (refreshToken) {
      const { rotateTokens } = await import("@/lib/session");
      const result = await rotateTokens(refreshToken);
      
      if (result) {
        const { newAccessToken, newRefreshToken, userId } = result;
        
        // If they were going to a public route, redirect to home
        if (isPublicOnly) {
          const response = NextResponse.redirect(new URL(`/home/${userId}`, req.url));
          setTokenCookies(response, newAccessToken, newRefreshToken);
          return response;
        }

        // Proceed to destination with new tokens
        const response = NextResponse.next();
        setTokenCookies(response, newAccessToken, newRefreshToken);
        return response;
      }
    }

    // Refresh failed or no refresh token
    if (isProtected) {
      if (pathname.startsWith("/api")) {
        // API request should get a 401 JSON, not a redirect to HTML
        const response = NextResponse.json(
          { success: false, message: "Session expired or logged in elsewhere" },
          { status: 401 }
        );
        response.cookies.delete("accessToken");
        response.cookies.delete("refreshToken");
        return response;
      }

      // Page request gets a redirect
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("accessToken");
      response.cookies.delete("refreshToken");
      return response;
    }
    return NextResponse.next();
  }
}

// Helper to set cookies consistently
function setTokenCookies(response, accessToken, refreshToken) {
  const isProd = process.env.NODE_ENV === "production";
  
  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProd, // Must be true for sameSite: 'none'
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 15 * 60,
  });
  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProd, // Must be true for sameSite: 'none'
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
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


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
  const session = await verifySession(token);

  if (session) {
    const { userId } = session;
    // Session is valid
    if (isPublicOnly) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // urls user ID matches the logged-in users id
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
    // session is NOT valid 
    // session is NOT valid or token expired
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


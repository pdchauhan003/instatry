import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await getServerSession(authOptions);
        console.log("session success:", session);
        
        //check session is exits or not
        if (!session || !session.dbId || !session.jwt) {
            console.log("Missing dbId or jwt, redirecting to login");
            return NextResponse.redirect(new URL("/login?error=SessionNotFound", req.url));
        }
        
        const response = NextResponse.redirect(new URL(`/home/${session.dbId}`, req.url));
        console.log("SESSION:", session);
        // Set the custom token cookie on the response
        response.cookies.set("accessToken", session.jwt, {
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24,
            sameSite: "lax",
        });
        return response;
    } catch (error) {
        console.error("Error in GET /api/auth/google-success:", error);
        return NextResponse.redirect(new URL("/login?error=ServerError", req.url));
    }
}

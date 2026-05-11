import { NextResponse } from "next/server";
import { verifySession } from "@/lib/session";
import { cookies } from "next/headers";

// Proxy: Frontend → Next.js → Socket Server (avoids cross-domain cookie issue)
export async function GET(req, context) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        const session = await verifySession(token);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const params = await context.params;
        const { groupId } = params;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL?.replace(/\/$/, "");
        const backendRes = await fetch(`${socketUrl}/group-messages/${groupId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
            },
        });

        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });

    } catch (error) {
        console.error("Group messages proxy error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

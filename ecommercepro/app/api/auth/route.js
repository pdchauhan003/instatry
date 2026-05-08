import { cookies } from "next/headers";
import { verifySession } from "@/lib/session";

export async function GET(req) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const result = await verifySession(token);

  if (result) {
    return Response.json({
      success: true,
      userId: result.userId,
      role: result.role
    });
  }

  try {
    const refreshRes = await fetch(`${req.nextUrl.origin}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: req.headers.get("cookie") || "",
      },
    });

    const data = await refreshRes.json();
    if (!data.success) {
      return Response.json({ success: false });
    }
    return Response.json({
      success: true,
      userId: data.userId,
      role: data.role
    });
  } catch (error) {
    return Response.json({ success: false });
  }
}

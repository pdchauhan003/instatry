import { verifySession } from "@/lib/session";

export async function GET(req) {
  const result = await verifySession();

  if (result) {
    return Response.json({
      success: true,
      userId: result.userId,
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
    });
  } catch (error) {
    return Response.json({ success: false });
  }
}

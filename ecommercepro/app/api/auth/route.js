import jwt from "jsonwebtoken";

export async function GET(req) {
  const accessToken = req.cookies.get("accessToken")?.value;

  // access token
  if (accessToken) {
    try {
      const decode = jwt.verify(accessToken, process.env.ACCESS_SECRET);

      return Response.json({
        success: true,
        userId: decode.userId,
      });

    } catch {
      console.log("Access expired → trying refresh...");
    }
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

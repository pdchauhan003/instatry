import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    return decoded.userId?.toString() || decoded.userId;
  } catch (error) {
    console.error("Auth User Token Error:", error.message);
    return null;
  }
}

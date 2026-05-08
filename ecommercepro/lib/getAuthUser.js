import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";

/**
 * Returns the authenticated user's ID from the JWT token.
 */
export async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_SECRET);
    return decoded.userId?.toString() || decoded.userId;
  } catch (error) {
    console.error("Auth User Token Error:", error.message);
    return null;
  }
}

/**
 * Returns the full authenticated user object from the database.
 * Useful for role-based access control.
 */
export async function getAuthUser() {
  const userId = await getAuthUserId();
  if (!userId) return null;

  try {
    await connectDB();
    const user = await User.findById(userId).lean();
    return user;
  } catch (error) {
    console.error("Error fetching auth user from DB:", error);
    return null;
  }
}

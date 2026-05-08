import { cookies } from "next/headers";
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
import { verifySession } from "./session";


//Returns the authenticated user's ID from the JWT token.

export async function getAuthUserId() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  const session = await verifySession(token);
  return session ? session.userId : null;
}

//for admin roll base auth
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

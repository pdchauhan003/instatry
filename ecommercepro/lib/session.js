import { jwtVerify } from "jose";
import redis from "@/services/redis";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET);

/**
 * Verifies the access token and checks the sessionId against Redis.
 * @param {string} token - The JWT access token.
 * @returns {Promise<{userId: string, sessionId: string, role: string} | null>}
 */
export async function verifySession(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    const userId = payload.userId;
    const sessionId = payload.sessionId;

    if (!userId || !sessionId) {
      console.log("Session verification failed: Missing userId or sessionId in payload");
      return null;
    }

    // Validate against Redis
    const storedSessionId = await redis.get(`session:${userId}`);
    if (storedSessionId !== sessionId) {
      console.log(`Session verification failed for user ${userId}: Session ID mismatch or revoked`);
      return null;
    }

    return { userId, sessionId, role: payload.role };
  } catch (error) {
    // console.error("JWT Verification Error:", error.message);
    return null;
  }
}

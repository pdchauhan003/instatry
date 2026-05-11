import { jwtVerify } from "jose";
import redis from "@/services/redis";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET);


//   Verifies the access token and checks the sessionId against Redis.
export async function verifySession(token, checkRedis = true) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    const userId = payload.userId;
    const sessionId = payload.sessionId;

    if (!userId || !sessionId) {
      console.log("Session verification failed: Missing userId or sessionId in payload");
      return null;
    }

    // Validate against Redis only if explicitly requested (usually for API routes)
    if (checkRedis) {
      const storedSessionId = await redis.get(`session:${userId}`);
      if (storedSessionId !== sessionId) {
        console.log(`Session verification failed for user ${userId}: Session ID mismatch or revoked`);
        return null;
      }
    }

    return { userId, sessionId, role: payload.role };
  } catch (error) {
    // console.error("JWT Verification Error:", error.message);
    return null;
  }
}

const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET);

export async function verifyRefreshToken(token) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return { 
      userId: payload.userId, 
      sessionId: payload.sessionId,
      role: payload.role || 'user' 
    };
  } catch (error) {
    return null;
  }
}

export async function rotateTokens(refreshToken) {
  const decoded = await verifyRefreshToken(refreshToken);
  if (!decoded) return null;

  const { userId, sessionId, role } = decoded;

  // redis verify
  const storedSessionId = await redis.get(`session:${userId}`);
  if (!storedSessionId || storedSessionId !== sessionId) return null;

  const { generateAccessToken, generateRefreshToken } = await import("@/lib/jwt");
  
  const newAccessToken = await generateAccessToken({ id: userId, sessionId, role }); 
  const newRefreshToken = await generateRefreshToken({ id: userId, sessionId, role });

  // Update Redis 
  await redis.set(`session:${userId}`, sessionId, { ex: 7 * 24 * 60 * 60 });

  return { newAccessToken, newRefreshToken, userId };
}

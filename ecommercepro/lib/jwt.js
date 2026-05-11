import { SignJWT } from "jose";

const ACCESS_SECRET = new TextEncoder().encode(process.env.ACCESS_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET);

// generate access for 15m
export async function generateAccessToken(data) {
    const userId = data.id?.toString() || data.id || data.userId;
    
    return await new SignJWT({ 
        userId, 
        role: data.role || 'user', 
        sessionId: data.sessionId 
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('15m')
        .sign(ACCESS_SECRET);
}

// generate refresh for 7day
export async function generateRefreshToken(data) {
    const userId = data.id?.toString() || data.id || data.userId;
    
    return await new SignJWT({ 
        userId, 
        role: data.role || 'user',
        sessionId: data.sessionId 
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(REFRESH_SECRET);
}

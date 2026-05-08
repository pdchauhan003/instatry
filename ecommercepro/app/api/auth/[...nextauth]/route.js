//for google authentication
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
// import { generateToken } from "@/lib/jwt";
import { generateAccessToken, generateRefreshToken } from "@/lib/jwt";
import crypto from 'crypto';
import redis from "@/services/redis";

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
            try {
                await connectDB()
                const email = user.email
                let existingUser = await User.findOne({ email })
                if (!existingUser) {
                    const newUser = new User({
                        name: user.name || "Google User",
                        email: user.email,
                        username: user.email.split("@")[0] + Date.now(),
                        image: user.image,
                        googleId: account.providerAccountId,
                        provider: "google",
                        password: crypto.randomBytes(16).toString("hex"),
                        number: "0000000000"
                    })
                    await newUser.save()
                }
                return true
            } catch (error) {
                console.error("Error in NextAuth signIn callback:", error);
                return false;
            }
        },
        async redirect({ url, baseUrl }) {
            return baseUrl + "/api/auth/google-success";
        },

        async jwt({ token, account, profile }) {
            try {
                await connectDB();

                // first login with google
                if (account && account.provider === "google") {
                    const email = profile?.email;

                    let existingUser = await User.findOne({ email });

                    //if account is not exists then create a new account
                    if (!existingUser) {
                        const newUser = new User({
                            name: profile?.name || "Google User",
                            email,
                            username: email.split("@")[0] + Date.now(),
                            image: profile?.picture,
                            googleId: account.providerAccountId,
                            provider: "google",
                            password: crypto.randomBytes(16).toString("hex"),
                            number: "0000000000",
                        });

                        await newUser.save();
                        existingUser = newUser;
                    }

                    //generate session id
                    const newSessionId = crypto.randomBytes(32).toString("hex");

                    existingUser.sessionId = newSessionId;
                    
                    // Generate and save refreshToken
                    const refreshToken = generateRefreshToken({ id: existingUser._id, sessionId: newSessionId });
                    existingUser.refreshToken = refreshToken;
                    
                    await existingUser.save(); //save session id and refresh token in db

                    // Store session in Redis
                    try {
                        await redis.set(`session:${existingUser._id}`, newSessionId, { ex: 7 * 24 * 60 * 60 });
                    } catch (redisError) {
                        console.error("Redis session storage failed:", redisError);
                    }

                    const jwtToken = generateAccessToken({
                        id: existingUser._id,
                        role: existingUser.role,
                        sessionId: newSessionId,
                    });

                    token.jwt = jwtToken;
                    token.refreshToken = refreshToken;
                    token.dbId = existingUser._id.toString();
                    token.email = existingUser.email;
                }

                if (!token.dbId && token.email) {
                    const user = await User.findOne({ email: token.email });

                    if (user) {
                        const jwtToken = generateAccessToken({
                            id: user._id,
                            role: user.role,
                            sessionId: user.sessionId,
                        });

                        token.jwt = jwtToken;
                        token.refreshToken = user.refreshToken;
                        token.dbId = user._id.toString();
                    }
                }
                return token;
            } catch (error) {
                console.error("Error in NextAuth jwt callback:", error);
                return token;
            }
        },
        async session({ session, token }) {
            // Remove sensitive tokens from client-accessible session object
            // They are already in HttpOnly cookies
            session.dbId = token.dbId;
            return session;
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// import NextAuth from "next-auth";
// import GoogleProvider from "next-auth/providers/google";
// import { User } from "@/lib/database";
// import { connectDB } from "@/lib/Connection";
// import { generateToken } from "@/lib/jwt";
// import crypto from 'crypto';

// export const authOptions = {
//     providers: [
//         GoogleProvider({
//             clientId: process.env.GOOGLE_CLIENT_ID,
//             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//         })
//     ],
//     callbacks: {
//         async signIn({ user, account }) {
//             await connectDB()
//             const email = user.email
//             let existingUser = await User.findOne({ email })
//             if (!existingUser) {
//                 const newUser = new User({
//                     name: user.name || "Google User",
//                     email: user.email,
//                     username: user.email.split("@")[0] + Date.now(),
//                     image: user.image,
//                     googleId: account.providerAccountId,
//                     provider: "google",
//                     password: crypto.randomBytes(16).toString("hex"),
//                     number: "0000000000"
//                 })
//                 await newUser.save()
//             }
//             return true
//         },
//         async redirect({ url, baseUrl }) {
//             return baseUrl + "/api/auth/google-success";
//         },

//         async jwt({ token, account, profile }) {

//             await connectDB();

//             // first login with google
//             if (account && account.provider === "google") {
//                 const email = profile?.email;

//                 let existingUser = await User.findOne({ email });

//                 if (!existingUser) {
//                     const newUser = new User({
//                         name: profile?.name || "Google User",
//                         email,
//                         username: email.split("@")[0] + Date.now(),
//                         image: profile?.picture,
//                         googleId: account.providerAccountId,
//                         provider: "google",
//                         password: crypto.randomBytes(16).toString("hex"),
//                         number: "0000000000",
//                     });

//                     await newUser.save();
//                     existingUser = newUser;
//                 }

//                 const newSessionId = crypto.randomBytes(32).toString("hex");

//                 existingUser.sessionId = newSessionId;
//                 await existingUser.save();

//                 const jwtToken = generateToken({
//                     user: existingUser,
//                     sessionId: newSessionId,
//                 });

//                 token.jwt = jwtToken;
//                 token.dbId = existingUser._id.toString();
//                 token.email = existingUser.email;
//             }

//             //  THIS PART FIXES THE PROBLEM
//             if (!token.dbId && token.email) {
//                 const user = await User.findOne({ email: token.email });

//                 if (user) {
//                     const jwtToken = generateToken({
//                         user,
//                         sessionId: user.sessionId,
//                     });

//                     token.jwt = jwtToken;
//                     token.dbId = user._id.toString();
//                 }
//             }

//             return token;
//         },
//         async session({ session, token }) {
//             session.jwt = token.jwt
//             session.dbId = token.dbId

//             return session
//         }
//     }
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };



//for google authentication
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { User } from "@/lib/database";
import { connectDB } from "@/lib/Connection";
// import { generateToken } from "@/lib/jwt";
import { generateAccessToken } from "@/lib/jwt";
import crypto from 'crypto';

export const authOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
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
        },
        async redirect({ url, baseUrl }) {
            return baseUrl + "/api/auth/google-success";
        },

        async jwt({ token, account, profile }) {

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
                await existingUser.save(); //save session id in db

                const jwtToken = generateAccessToken({
                    id: existingUser._id,
                    role: existingUser.role,
                    sessionId: newSessionId,
                });

                token.jwt = jwtToken;
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
                    token.dbId = user._id.toString();
                }
            }
            return token;
        },
        async session({ session, token }) {
            session.jwt = token.jwt
            session.dbId = token.dbId

            return session
        }
    }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
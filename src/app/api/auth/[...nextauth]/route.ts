import { authOptions } from "@/lib/auth/auth";
import NextAuth from "next-auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

// app/api/auth/[...nextauth]/route.ts

// import { users } from "@/const";
// import { userTable } from "@/db/schema";
// import { db } from "@/lib/db";
// import { eq } from "drizzle-orm";
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import GoogleProvider from "next-auth/providers/google";

// export const authOptions = {
//   secret: process.env.NEXTAUTH_SECRET, // ✅ Include this line
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         username: { label: "Username", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         // if (!credentials) return null;

//         const user = await db.query.userTable.findFirst({
//           where: eq(userTable.email, credentials?.username || ""),
//         });

//         if (user?.password === credentials?.password) {
//           return {
//             id: user.id,
//             name: user.name,
//             email: user.email,
//             user_type: user.user_type,
//           };
//         }

//         return null;
//       },
//     }),

//     GoogleProvider({
//       clientId: process.env.GOOGLE_CLIENT_ID!,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
//     }),
//   ],
//   pages: {
//     signIn: "/login",
//   },
//   session: {
//     strategy: "jwt" as const,
//   },
//   callbacks: {
//     // Called when JWT is created/updated
//     async jwt({ token, user, account, profile }: any) {
//       // On first login (user exists only at login)
//       if (user) {
//         // If login is via credentials, keep user_type
//         if (account?.provider === "credentials") {
//           token.user = user;
//         }

//         // If login is via Google
//         if (account?.provider === "google") {
//           // Check if user is known in your DB (optional)
//           const existingUser = await db.query.userTable.findFirst({
//             where: eq(userTable.email, user.email),
//           });

//           if (existingUser) {
//             token.user = {
//               id: existingUser.id,
//               name: existingUser.name,
//               email: existingUser.email,
//               user_type: existingUser.user_type,
//             };
//           } else {
//             // New user → default role
//             token.user = {
//               id: user.id,
//               name: user.name,
//               email: user.email,
//               user_type: "customer",
//             };
//           }
//         }
//       }
//       return token;
//     },
//     // Called when session is checked
//     async session({ session, token }: any) {
//       session.user = token.user;
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

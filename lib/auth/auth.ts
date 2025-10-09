import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { db } from "../db";
import { userTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { users } from "@/const";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET, // ✅ Include this line
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        // const user = users.find(
        //   (u) =>
        //     u.username === credentials?.username &&
        //     u.password === credentials?.password
        // );

        // Fetch user by email or username
        let user;
        try {
          user = await db
            .select()
            .from(userTable)
            .where(eq(userTable.email, credentials.username)); // Adjust this line if using username instead of email
        } catch (error) {
          console.log(user, error);
        }

        if (!user) {
          console.log("User not found");
          return null;
        }

        console.log("user: ", user);
        user = user[0];
        if (user) {
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            user_type: user.user_type,
          };
        }
        return null;
      },
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    // Called when JWT is created/updated
    async jwt({ token, user, account, profile }: any) {
      // On first login (user exists only at login)
      if (user) {
        // If login is via credentials, keep user_type
        if (account?.provider === "credentials") {
          token.user = user;
        }

        // If login is via Google
        if (account?.provider === "google") {
          // Check if user is known in your DB (optional)
          const existingUser = users.find((u) => u.email === user.email);

          if (existingUser) {
            token.user = {
              id: existingUser.id,
              name: existingUser.username,
              email: existingUser.email,
              user_type: existingUser.user_type,
            };
          } else {
            // New user → default role
            token.user = {
              id: user.id,
              name: user.name,
              email: user.email,
              user_type: "customer",
            };
          }
        }
      }
      return token;
    },
    // Called when session is checked
    async session({ session, token }: any) {
      session.user = token.user;
      return session;
    },
  },
};

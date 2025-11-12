import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { cognitoClient } from "./cognitoClient";
import crypto from "crypto";
import {
  InitiateAuthCommand,
  AuthFlowType, // ✅ import the enum
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import { getUserByEmail, insertUser } from "./getUserTypeFromEmail";
import { CLIENT_ID, generateSecretHash } from "./generateHash";

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const secretHash = generateSecretHash(credentials.username);

        const params = {
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH, // ✅ use the enum
          ClientId: CLIENT_ID,
          AuthParameters: {
            USERNAME: credentials.username,
            PASSWORD: credentials.password,
            SECRET_HASH: secretHash,
          },
        };

        try {
          const command = new InitiateAuthCommand(params);
          const response = await cognitoClient.send(command);
          const auth = response.AuthenticationResult;

          if (!auth?.AccessToken) return null;

          const idToken = auth.IdToken;
          const decoded: any = jwt.decode(idToken as string);
          return {
            username: credentials.username,
            id: decoded.sub,
            email: decoded.email,
          };
        } catch (err) {
          console.error("Cognito auth error:", err);
          throw new Error("Cognito auth error");
          return null;
        }
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
    async signIn({ user }: any) {
      if (!user) return false; // Reject sign in
      return true;
    },
    async jwt({ token, user, account, profile }: any) {
      if (user) {
        if (account?.provider === "credentials") {
          token.username = user.username;
          token.id = user["custom:id"];
          token.email = user.email;

          const userData = await getUserByEmail(user.email);

          if (!userData) {
            throw new Error("USER_NOT_FOUND");
          }

          token.user_type = userData.user_type;
        }

        if (account?.provider === "google") {
          const existingUser = await getUserByEmail(user.email);
          if (existingUser) {
            token.username = existingUser.email;
            token.id = existingUser.id;
            token.email = existingUser.email;
            token.user_type = existingUser.user_type;
          } else {
            const userData = {
              name: user.name,
              email: user.email,
            };
            const newUserData = await insertUser(userData);

            token.email = newUserData[0].email;
            token.id = newUserData[0].id;
            token.username = newUserData[0].email;
            token.user_type = newUserData[0].user_type;
          }
        }
      }

      return token;
    },
    async session({ session, token }: any) {
      session.username = token.username;
      session.email = token.email;
      session.id = token.id;
      session.user_type = token.user_type;

      return session;
    },
  },
};

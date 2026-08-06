import { cognitoClient } from "@/lib/auth/cognitoClient";
import {
  CLIENT_ID,
  generateSecretHash,
} from "@/lib/auth/generateHash";
import { getUserByEmail, insertUser } from "@/lib/auth/getUserTypeFromEmail";
import { ConfirmSignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, code } = await request.json();

    if (!name || !email || !code) {
      return NextResponse.json(
        { message: "Name, email, and verification code are required." },
        { status: 400 }
      );
    }

    await cognitoClient.send(
      new ConfirmSignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        ConfirmationCode: code,
        SecretHash: generateSecretHash(email),
      })
    );

    const existingUser = await getUserByEmail(email);
    if (!existingUser) {
      await insertUser({ email, name });
    }

    return NextResponse.json({
      success: true,
      message: "Account verified successfully. You can now log in.",
    });
  } catch (error: any) {
    if (error.code === "23505") {
      if (error.constraint === "users_email_unique") {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      }
    }

    console.error("Unexpected error:", error);
    return NextResponse.json(
      { message: error?.message || "Something went wrong" },
      { status: 400 }
    );
  }
}

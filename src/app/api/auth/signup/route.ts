import { cognitoClient } from "@/lib/auth/cognitoClient";
import { CLIENT_ID, generateSecretHash } from "@/lib/auth/generateHash";
import { SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    await cognitoClient.send(
      new SignUpCommand({
        ClientId: CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name },
        ],
        SecretHash: generateSecretHash(email),
      })
    );

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error?.message || "Signup failed." },
      { status: 400 }
    );
  }
}
